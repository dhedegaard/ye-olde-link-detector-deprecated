type Data = {
  guilds: {
    [guildID: string]:
      | undefined
      | {
          urls: {
            [url: string]:
              | undefined
              | Array<{
                  messageid: string;
                  username: string;
                  userid: string;
                  timestamp: Date;
                }>;
          };
        };
  };
};

type GuildData = NonNullable<Data["guilds"][string]>;
type GuildUrls = NonNullable<GuildData["urls"][string]>;

const data: Data = {
  guilds: {},
};

/** Clears the data object, usually only needed for testing. */
export const clearData = () => {
  data.guilds = {};
};

export const getGuildData = (guildId: string): GuildData => {
  if (data.guilds[guildId] == null) {
    data.guilds[guildId] = { urls: {} };
  }
  return data.guilds[guildId]!;
};

export const getGuildUrl = (guildId: string, url: string): GuildUrls => {
  const guildData = getGuildData(guildId);
  if (guildData.urls[url] == null) {
    guildData.urls[url] = [];
  }
  return guildData.urls[url]!;
};
