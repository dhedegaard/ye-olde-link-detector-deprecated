import { getGuildUrl } from "./data.ts";
import { Message, formatDistance } from "./deps.ts";
import { findUrlsInMessage } from "./url-regex.ts";

/**
 * Processes a given message, returning an array of message to send due to
 * duplicate URLs.
 */
export const processMessage = ({
  id: messageid,
  timestamp,
  author: { bot, id: userid, username },
  content,
  guildID,
}: Message): string[] => {
  const messagesToSend: string[] = [];
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
      const firstPost = urlData.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      )[0];
      messagesToSend.push(
        `🚨🚨🚨**OLD**🚨🚨🚨: <@!${userid}> The URL: <${url}> has previous been posted **${
          urlData.length
        }** time(s) before. 🚨🚨🚨 It was first posted by **${
          firstPost.username
        }**, **${formatDistance(
          new Date(),
          firstPost.timestamp,
          undefined
        )}** ago`
      );
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
  return messagesToSend;
};
