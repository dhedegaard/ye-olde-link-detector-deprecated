import { discord } from "../deps.ts";
import { Command, commands } from "./mod.ts";

const help: Command = ({ author, channelId }) => {
  discord.sendMessage(
    channelId,
    `<@${author.id}> Available commands in the system:\n\n${Object.entries(
      commands
    )
      .filter(([, func]) => func.description != null)
      .map(([command, { description }]) => `- \`!${command}\`: ${description}`)
      .join("\n")}`
  );
};
help.description = "Lists all the available commands";

export default help;
