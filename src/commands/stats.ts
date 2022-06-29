import { getGuildData } from "../data.ts";
import { discord } from "../deps.ts";
import type { Command } from "./mod.ts";

const stats: Command = ({ channelId, guildId, author }) => {
  const data = getGuildData(guildId.toString());
  const message = Object.entries(
    Object.values(data.urls)
      .filter((e): e is NonNullable<typeof e> => e != null)
      .reduce<{ [username: string]: number }>((agg, obj) => {
        obj?.forEach(({ username }) => {
          if (agg[username] == null) {
            agg[username] = 0;
          }
          agg[username]++;
        });
        return agg;
      }, {})
  )
    .sort(([, a], [, b]) => b - a)
    .map(([username, count]) => `**${username}**: ${count}`)
    .slice(0, 10)
    .join("\n");
  discord.sendMessage(
    channelId,
    `<@${author.id}> The 10 people who posted the most links:\n${message}`
  );
};

stats.description = "Shows some fun statistics";

export default stats;
