import { sendMessage } from "../deps.ts";
import type { Command } from "./mod.ts";

const unknown: Command = ({ author, channel }) => {
  sendMessage(channel, `<@${author.id}> Unknown command, try \`!help\``);
};

export default unknown;
