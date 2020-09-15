import { getGuildUrl } from "./data.ts";
import type { Message } from "./deps.ts";
import { findUrlsInMessage } from "./url-regex.ts";

/**
 * Processes a given message, returning an array of message objects to send
 * due to duplicate URLs.
 */
export const processMessage = ({
  id: messageid,
  timestamp,
  author: { bot, id: userid, username },
  content,
  guildID,
}: Message): Array<{
  userid: string;
  url: string;
  postCount: number;
  firstTimePosted: {
    username: string;
    timestamp: string;
  };
}> => {
  const messagesToSend: ReturnType<typeof processMessage> = [];
  if (bot) {
    // Skip messages from bots.
    return messagesToSend;
  }
  // Check if either of the URls have been previously posted on the same
  // guild.
  const urls = findUrlsInMessage(content);
  if (urls.length < 1) {
    return messagesToSend;
  }
  for (const url of urls) {
    const urlData = getGuildUrl(guildID, url);
    // If the URL has already been sent, notify the caller.
    if (urlData.length > 0) {
      const firstTimePosted = urlData.sort((a, b) =>
        a.timestamp.localeCompare(b.timestamp)
      )[0];
      messagesToSend.push({
        userid,
        url,
        postCount: urlData.length,
        firstTimePosted,
      });
    }
    // In any case, register the URL for later.
    if (!urlData.some((e) => messageid === e.messageid)) {
      urlData.push({
        messageid,
        userid,
        username,
        timestamp: new Date(timestamp).toISOString(),
      });
    }
  }
  return messagesToSend;
};
