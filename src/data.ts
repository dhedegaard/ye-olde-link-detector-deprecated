import { ensureDir, join, dirname } from "./deps.ts";

const DATA_FILE: string = join(Deno.cwd(), "data", "data.json");
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

let data: Data = {
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

/**
 * Reads old and existing data into the current data state.
 */
export const readExistingData = async (): Promise<void> => {
  data = JSON.parse(await Deno.readTextFile(DATA_FILE));
};

/** Writes the current state to disk. */
export const writeExistingData = async (): Promise<void> => {
  await ensureDir(dirname(DATA_FILE));
  await Deno.writeTextFile(DATA_FILE, JSON.stringify(data));
};

/**
 * Filters away the known messageIds and returns the unknown message ids.
 */
export const filterMissingMessageIds = (
  guildId: string,
  messageIds: string[]
): string[] => {
  const guildData = getGuildData(guildId);
  const knownMessageIds = new Set<string>(
    Object.values(guildData.urls).flatMap(
      (urlValue) => urlValue?.map(({ messageid }) => messageid) ?? []
    )
  );
  return messageIds.filter((id) => !knownMessageIds.has(id));
};
