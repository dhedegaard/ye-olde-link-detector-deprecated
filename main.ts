import { getGuildData } from "./data.ts";
import {
  botHasChannelPermissions,
  Channel,
  ChannelTypes,
  createClient,
  getMessages,
  Guild,
  Intents,
  Permissions,
  sendMessage,
} from "./deps.ts";
import { processMessage } from "./process-message.ts";

const token = Deno.env.get("TOKEN");
if (token == null) {
  throw new Error("TOKEN env variable not defined");
}

console.log("Connecting...");
await createClient({
  token: token,
  intents: [Intents.GUILDS, Intents.GUILD_MESSAGES],
  eventHandlers: {
    ready() {
      console.log("Connected!");
    },
    messageCreate(message) {
      for (const messageToSend of processMessage(message)) {
        sendMessage(message.channel, {
          content: messageToSend,
        });
      }
    },
    guildLoaded(guild) {
      processChannelsForGuildLoaded(guild);
    },
    heartbeat() {
      console.log("heartbeat");
    },
  },
});

const processChannelsForGuildLoaded = async ({ name, id, channels }: Guild) => {
  console.log(`  Processing guild: ${name} (${id})`);
  for (const [channelId, channel] of channels) {
    // Make sure it's a text channel, and that we have the required permissions.
    if (
      channel.type !== ChannelTypes.GUILD_TEXT ||
      !botHasChannelPermissions(channelId, [
        Permissions.READ_MESSAGE_HISTORY,
        Permissions.VIEW_CHANNEL,
      ])
    ) {
      continue;
    }

    // Fetch all the messages recursive, or fail loudly.
    await processMessagesForChannel(id, channel, undefined).catch((error) => {
      console.error("Error reading messages from channel with id:", channelId);
      console.error(error);
    });
    console.log("      Done building data for server:", name);
  }
};

/** Recursively processes messages for a given channel. */
const processMessagesForChannel = async (
  guildId: string,
  channel: Channel,
  beforeId: string | undefined
) => {
  const messages = await getMessages(
    channel,
    beforeId != null ? { before: beforeId, limit: 100 } : { limit: 100 }
  );
  if (messages == null || messages.length === 0) {
    return;
  }
  for (const message of messages) {
    processMessage(message);
  }
  const earliestMessage = messages.sort((a, b) => a.timestamp - b.timestamp)[0];
  console.log(
    `    Now processed channel(${channel.name}) messages. URLs found: ${
      Object.keys(getGuildData(guildId).urls ?? {}).length ?? 0
    }. earliest: ${new Date(earliestMessage.timestamp).toISOString()}`
  );

  await processMessagesForChannel(guildId, channel, earliestMessage.id);
};
