import { sendMessage } from "../deps.ts";
import type { Command } from "./mod.ts";

const unknown: Command = ({ author, channelID }) => {
  sendMessage(channelID, `<@${author.id}> Unknown command, try \`!help\``);
};

export default unknown;
