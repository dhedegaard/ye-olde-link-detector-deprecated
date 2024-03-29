import { getGuildUrl } from "./data.ts";
import { discord } from "./deps.ts";
import { findUrlsInMessage } from "./url-regex.ts";

export type ProcessMessageResult = Array<{
  userid: string;
  url: string;
  postCount: number;
  firstTimePosted: {
    messageid: string;
    timestamp: string;
    userid: string;
    username: string;
  };
}>;

/**
 * Processes a given message, returning an array of message objects to send
 * due to duplicate URLs.
 */
export const processMessage = async ({
  id: _messageid,
  timestamp,
  content,
  authorId,
  guildId,
  isBot,
}: discord.DiscordenoMessage): Promise<ProcessMessageResult> => {
  const messageid = _messageid.toString();
  const messagesToSend: ProcessMessageResult = [];
  if (isBot || content == null || guildId == null) {
    // Skip useless stuff.
    return messagesToSend;
  }
  // Check if either of the URls have been previously posted on the same
  // guild.
  const urls = findUrlsInMessage(content);
  if (urls.length < 1) {
    return messagesToSend;
  }
  for (const url of urls) {
    const urlData = getGuildUrl(guildId.toString(), url);
    // If the URL has already been sent, notify the caller.
    if (urlData.length > 0) {
      const firstTimePosted = urlData.sort((a, b) =>
        a.timestamp.localeCompare(b.timestamp)
      )[0];
      messagesToSend.push({
        userid: authorId.toString(),
        url,
        postCount: urlData.length,
        firstTimePosted,
      });
    }
    // In any case, register the URL for later.
    if (!urlData.some((e) => messageid === e.messageid)) {
      urlData.push({
        messageid: messageid,
        userid: authorId.toString(),
        username: await _internal.getUsernameForUserId(authorId),
        timestamp: new Date(timestamp).toISOString(),
      });
    }
  }
  return messagesToSend;
};

const getUsernameForUserId = (userid: bigint) =>
  discord.getUser(userid).then((e) => e.username);

export const _internal = { getUsernameForUserId };
