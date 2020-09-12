export type Data = {
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

export const data: Data = {
  guilds: {},
};
