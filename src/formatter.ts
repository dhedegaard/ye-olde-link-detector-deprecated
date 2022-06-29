import { formatDistance } from "./deps.ts";
import type { ProcessMessageResult } from "./process-message.ts";

export const formatOutputMessage = ({
  userid,
  url,
  postCount,
  firstTimePosted,
}: ProcessMessageResult[number]) =>
  `🚨🚨🚨**OLD**🚨🚨🚨: <@!${userid}> The URL: <${url}> has previously been posted **${postCount}** time(s) before. 🚨🚨🚨 It was first posted by **${
    firstTimePosted.username
  }**, **${formatDistance(
    new Date(),
    new Date(firstTimePosted.timestamp),
    undefined
  )}** ago`;
