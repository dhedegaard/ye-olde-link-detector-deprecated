import type { Channel, Message, UserPayload } from "../deps.ts";
import help from "./help.ts";
import unknown from "./unknown.ts";

export type Command = (args: {
  args: string[];
  author: UserPayload;
  channel: Channel;
}) => void;

const commands: { [key: string]: Command } = {
  help,
  unknown,
};

export const processCommands = (botId: string, message: Message) => {
  // Check if we're mentioned.
  const isMentioned = message
    .mentions()
    .some((mention) => mention.user.id === botId);
  if (!isMentioned) {
    return;
  }
  const { author, channel } = message;

  const parts = message.content.split(" ").filter((e) => !e.startsWith("<@"));
  const firstCommandPartIndex = parts.findIndex((e) => e.startsWith("!"));

  // Missing command with "!" in it.
  if (firstCommandPartIndex < 0) {
    return commands.unknown({ args: [], author, channel });
  }

  // Command with "!" found, but does not match known commands.
  const command = parts[firstCommandPartIndex].slice(1);
  if (commands[command] == null) {
    return commands.unknown({ args: [], author, channel });
  }

  // Call the command with the args.
  return commands[command]({
    args: parts.slice(firstCommandPartIndex + 1),
    author,
    channel,
  });
};
