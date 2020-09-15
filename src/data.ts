import { ensureDir, join, dirname } from "./deps.ts";

const DATA_FILE: string = join(Deno.cwd(), "data", "data.json");
type Data = {
  guilds: {
    [guildID: string]:
      | undefined
      | {
          seenMessageIds: string[];
          urls: {
            [url: string]:
              | undefined
              | Array<{
                  messageid: string;
                  username: string;
                  userid: string;
                  /** iso8601 */
                  timestamp: string;
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
    data.guilds[guildId] = { urls: {}, seenMessageIds: [] };
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
  const knownMessageIds = new Set<string>(getGuildData(guildId).seenMessageIds);
  return messageIds.filter((id) => !knownMessageIds.has(id));
};

/**
 * @returns The number of messageIds now marked as seen.
 */
export const markMessageIdsSeen = (
  guildId: string,
  messageIds: string[]
): number => {
  const { seenMessageIds } = getGuildData(guildId);
  // Might be a bit slow?
  const set = new Set(seenMessageIds);
  return messageIds
    .filter((id) => !set.has(id))
    .map((id) => seenMessageIds.push(id)).length;
};
