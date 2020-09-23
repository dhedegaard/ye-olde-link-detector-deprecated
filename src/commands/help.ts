import { sendMessage } from "../deps.ts";
import type { Command } from "./mod.ts";

const help: Command = ({ author, channel }) => {
  sendMessage(channel, `<@${author.id}> TODO:`);
};

export default help;
