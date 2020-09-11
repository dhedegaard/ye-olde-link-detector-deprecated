import {
  getMessages,
  sendMessage,
} from "https://deno.land/x/discordeno@v8.4.1/src/handlers/channel.ts";
import { Channel } from "https://deno.land/x/discordeno@v8.4.1/src/structures/channel.ts";
import { Intents } from "https://deno.land/x/discordeno@v8.4.1/src/types/options.ts";
import { ChannelTypes } from "https://deno.land/x/discordeno@v8.4.1/src/types/channel.ts";
import { findUrlsInMessage } from "./url-regex.ts";
import { botHasChannelPermissions } from "https://deno.land/x/discordeno@v8.4.1/src/utils/permissions.ts";
import { Permissions } from "https://deno.land/x/discordeno@v8.4.1/src/types/permission.ts";
import { Guild } from "https://deno.land/x/discordeno@v8.4.1/src/structures/guild.ts";
import createClient from "https://deno.land/x/discordeno@v8.4.1/src/module/client.ts";
import { Message } from "https://deno.land/x/discordeno@v8.4.1/src/structures/message.ts";

const token = Deno.env.get("TOKEN");
if (token == null) {
  throw new Error("TOKEN env variable not defined");
}

const data: {
  guilds: {
    [guildID: string]:
      | undefined
      | {
          urls: {
            [url: string]:
              | undefined
              | Array<{
                  messageid: string;
                  username: string;
                  userid: string;
                  timestamp: Date;
                }>;
          };
        };
  };
} = {
  guilds: {},
};

console.log("Connecting...");
await createClient({
  token: token,
  intents: [Intents.GUILDS, Intents.GUILD_MESSAGES],
  eventHandlers: {
    ready() {
      console.log("Connected!");
    },
    messageCreate(message) {
      processMessage(message, true);
    },
    guildLoaded(guild) {
      processChannelsForGuildLoaded(guild);
    },
  },
});

const processMessage = (
  {
    id: messageid,
    timestamp,
    author: { bot, id: userid, username },
    content,
    guildID,
    channel,
  }: Message,
  notify: boolean
) => {
  if (bot) {
    // Skip messages from bots.
    return;
  }
  // Check if either of the URls have been previously posted on the same
  // guild.
  const urls = findUrlsInMessage(content);
  if (urls.length < 1) {
    return;
  }
  const guildData = data.guilds[guildID]!;
  for (const url of urls) {
    if (guildData.urls[url] == null) {
      guildData.urls[url] = [];
    }
    const urlData = guildData.urls[url]!;
    // If the URL has already been sent, notify the caller.
    if (notify && urlData.length > 0) {
      const firstPost = urlData.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      )[0];
      sendMessage(channel, {
        content: `🚨🚨🚨**OLD**🚨🚨🚨: <@!${userid}> The URL: <${url}> has previous been posted **${
          urlData.length
        }** time(s) before. 🚨🚨🚨 It was first posted by **${
          firstPost.username
        }** on **${firstPost.timestamp.toLocaleDateString()}**`,
        mentions: {
          parse: ["everyone"],
          users: [userid],
        },
      });
    }
    // In any case, register the URL for later.
    if (!urlData.some((e) => messageid === e.messageid)) {
      urlData.push({
        messageid,
        userid,
        username,
        timestamp: new Date(timestamp),
      });
    }
  }
};

const processChannelsForGuildLoaded = async ({ name, id, channels }: Guild) => {
  if (data.guilds[id] == null) {
    data.guilds[id] = { urls: {} };
  }
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
    processMessage(message, false);
  }
  const earliestMessage = messages.sort((a, b) => a.timestamp - b.timestamp)[0];
  console.log(
    `    Now processed channel(${channel.name}) messages. URLs found: ${
      Object.keys(data.guilds[guildId]?.urls ?? {}).length ?? 0
    }. earliest: ${new Date(earliestMessage.timestamp).toISOString()}`
  );

  await processMessagesForChannel(guildId, channel, earliestMessage.id);
};
