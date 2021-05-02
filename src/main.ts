import { processCommands } from "./commands/mod.ts";
import {
  filterMissingMessageIds,
  getGuildData,
  markMessageIdsSeen,
  readExistingData,
  writeExistingData,
} from "./data.ts";
import {
  botHasChannelPermissions,
  Channel,
  ChannelTypes,
  startBot,
  Guild,
  Intents,
  sendMessage,
  botID,
  RequestManager,
  endpoints,
  MessageCreateOptions,
  structures,
} from "./deps.ts";
import { formatOutputMessage } from "./formatter.ts";
import { heartbeatReceived } from "./heartbeat-monitor.ts";
import { processMessage } from "./process-message.ts";

const token = Deno.env.get("TOKEN");
if (token == null) {
  throw new Error("TOKEN env variable not defined");
}

// Attempt to read existing data from disk.
await readExistingData().catch((error) =>
  console.warn("Error readonly old data from disk, because:", error)
);

// Periodically, try to write the current data to disk.
setInterval(() => {
  writeExistingData()
    .then(() => console.log("Wrote current data to disk succesfully"))
    .catch((error) =>
      console.warn("Error writing current data to disk, because:", error)
    );
}, 60_000);

console.log("Connecting...");
await startBot({
  token: token,
  intents: [Intents.GUILDS, Intents.GUILD_MESSAGES],
  eventHandlers: {
    ready() {
      console.log("Connected as:", botID);
    },
    messageCreate(message) {
      processCommands(botID, message);
      for (const messageToSend of processMessage(message)) {
        sendMessage(message.channelID, {
          content: formatOutputMessage(messageToSend),
        });
      }
    },
    guildLoaded(guild) {
      processChannelsForGuildLoaded(guild);
    },
    heartbeat() {
      heartbeatReceived();
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
        "READ_MESSAGE_HISTORY",
        "VIEW_CHANNEL",
      ])
    ) {
      continue;
    }

    // Fetch all the messages recursive, or fail loudly.
    await processMessagesForChannel(id, channel, undefined).catch((error) => {
      console.error(
        "Error reading messages from channel with id:",
        channelId,
        "name:",
        channel.name
      );
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
  // const messages = await getMessages(
  //   channel.id,
  //   beforeId != null ? { before: beforeId, limit: 100 } : { limit: 100 }
  // );

  // A work around the getMessages, which has a bug that fails on a permission
  // check.
  const result = (await RequestManager.get(
    endpoints.CHANNEL_MESSAGES(channel.id),
    beforeId != null ? { before: beforeId, limit: 100 } : { limit: 100 }
  )) as MessageCreateOptions[];
  const messages = await Promise.all(
    result.map((res) => structures.createMessage(res))
  );

  // Determine what messageIds we haven't seen before.
  const unknownMessageIds = filterMissingMessageIds(
    guildId,
    messages?.map(({ id }) => id) ?? []
  );
  if (
    messages == null ||
    messages.length === 0 ||
    unknownMessageIds.length === 0
  ) {
    return;
  }

  // There are at least some new messages, process them.
  for (const message of messages) {
    processMessage(message);
  }

  // Mark all the processed message as seen.
  markMessageIdsSeen(
    guildId,
    messages.map(({ id }) => id)
  );

  const earliestMessage = messages.sort((a, b) => a.timestamp - b.timestamp)[0];
  console.log(
    `    Now processed channel(${channel.name}) messages. URLs found: ${
      Object.keys(getGuildData(guildId).urls ?? {}).length ?? 0
    }. earliest: ${new Date(earliestMessage.timestamp).toISOString()}`
  );

  await processMessagesForChannel(guildId, channel, earliestMessage.id);
};
