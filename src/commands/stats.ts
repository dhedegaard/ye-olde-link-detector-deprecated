import { getGuildData } from "../data.ts";
import { sendMessage } from "../deps.ts";
import type { Command } from "./mod.ts";

const stats: Command = ({ channel, author }) => {
  if (channel.guildID == null) {
    return;
  }
  const data = getGuildData(channel.guildID);
  const message = Object.entries(
    Object.values(data.urls)
      .filter((e) => e != null)
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
  sendMessage(
    channel,
    `<@${author.id}> The 10 people who posted the most links:\n${message}`
  );
};

stats.description = "Shows some fun statistics";

export default stats;
