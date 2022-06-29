import { processCommands } from "./commands/mod.ts";
import {
  filterMissingMessageIds,
  getGuildData,
  markMessageIdsSeen,
  readExistingData,
  writeExistingData,
} from "./data.ts";
import { discord } from "./deps.ts";
import { formatOutputMessage } from "./formatter.ts";
import { heartbeatReceived } from "./heartbeat-monitor.ts";
import { processMessage } from "./process-message.ts";

const token = Deno.env.get("TOKEN");
if (token == null) {
  throw new Error("TOKEN env variable not defined");
}

// Attempt to read existing data from disk.
await readExistingData().catch((error) =>
  console.warn("Error reading old data from disk, because:", error)
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
await discord.startBot({
  token: token,
  intents: [discord.Intents.Guilds, discord.Intents.GuildMessages],
  eventHandlers: {
    ready() {
      console.log("Connected as:", discord.botId);
    },
    messageCreate(message) {
      processCommands(discord.botId.toString(), message);
      processMessage(message).then((messages) =>
        messages.forEach((messageToSend) =>
          discord.sendMessage(message.channelId, {
            content: formatOutputMessage(messageToSend),
          })
        )
      );
    },
    guildLoaded(guild) {
      processChannelsForGuildLoaded(guild);
    },
    // @ts-expect-error - TODO: Determine what to do here :O
    heartbeat() {
      heartbeatReceived();
    },
  },
});

const processChannelsForGuildLoaded = async ({
  name,
  id,
  channels,
}: discord.DiscordenoGuild) => {
  console.log(`  Processing guild: ${name} (${id})`);
  for (const [, channel] of channels ?? []) {
    // Make sure it's a text channel, and that we have the required permissions.
    if (
      channel.type !== discord.ChannelTypes.GuildText ||
      !discord.botHasChannelPermissions(BigInt(channel.id), [
        "READ_MESSAGE_HISTORY",
        "VIEW_CHANNEL",
      ])
    ) {
      continue;
    }

    // Fetch all the messages recursive, or fail loudly.
    await processMessagesForChannel(id.toString(), channel, undefined).catch(
      (error) => {
        console.error(
          "Error reading messages from channel with id:",
          channel.id,
          "name:",
          channel.name
        );
        console.error(error);
      }
    );
    console.log("      Done building data for server:", name);
  }
};

/** Recursively processes messages for a given channel. */
const processMessagesForChannel = async (
  guildId: string,
  channel: discord.DiscordenoChannel,
  beforeId: string | undefined
) => {
  // A work around the getMessages, which has a bug that fails on a permission
  // check.
  const messages = await discord.getMessages(
    BigInt(channel.id),
    beforeId != null ? { before: BigInt(beforeId), limit: 100 } : { limit: 100 }
  );

  // Determine what messageIds we haven't seen before.
  const unknownMessageIds = filterMissingMessageIds(
    guildId,
    messages?.map(({ id }) => id.toString()) ?? []
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
    messages.map(({ id }) => id.toString())
  );

  const earliestMessage = messages.sort((a, b) => a.timestamp - b.timestamp)[0];
  console.log(
    `    Now processed channel(${channel.name}) messages. URLs found: ${
      Object.keys(getGuildData(guildId).urls ?? {}).length ?? 0
    }. earliest: ${new Date(earliestMessage.timestamp).toISOString()}`
  );

  await processMessagesForChannel(
    guildId,
    channel,
    earliestMessage.id.toString()
  );
};
