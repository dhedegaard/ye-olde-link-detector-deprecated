import { getGuildData } from "../data.ts";
import { discord } from "../deps.ts";
import { Command } from "./mod.ts";

const dumpData: Command = ({ author, guildId }) => {
  const guildData = getGuildData(guildId.toString());

  discord
    .sendDirectMessage(BigInt(author.id), {
      content: "A dump of the latest data for the guild is attached.",
      file: {
        name: `dump-${new Date().toISOString()}.json`,
        blob: new Blob([JSON.stringify(guildData)], {
          type: "application/json",
        }),
      },
    })
    .catch((error) => {
      console.error("Error sending data dump to user:", author.id);
      console.error(error);
    });
};
dumpData.description = "Dumps the current data for the current guild in a PM";

export default dumpData;
