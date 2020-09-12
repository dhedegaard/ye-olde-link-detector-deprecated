import { formatDistance } from "./deps.ts";
import { processMessage } from "./process-message.ts";

export const formatOutputMessage = ({
  userid,
  url,
  postCount,
  firstTimePosted,
}: ReturnType<typeof processMessage>[number]) =>
  `🚨🚨🚨**OLD**🚨🚨🚨: <@!${userid}> The URL: <${url}> has previous been posted **${postCount}** time(s) before. 🚨🚨🚨 It was first posted by **${
    firstTimePosted.username
  }**, **${formatDistance(
    new Date(),
    firstTimePosted.timestamp,
    undefined
  )}** ago`;
