import { discord } from "../deps.ts";
import type { Command } from "./mod.ts";

const unknown: Command = ({ author, channelId }) => {
  discord.sendMessage(
    channelId,
    `<@${author.id}> Unknown command, try \`!help\``
  );
};

export default unknown;
