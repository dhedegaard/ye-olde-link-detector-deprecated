import { assertEquals } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import {
  stub,
  assertSpyCall,
} from "https://deno.land/std@0.145.0/testing/mock.ts";
import { _internal, processMessage } from "../process-message.ts";
import { discord } from "../deps.ts";
import { clearData, getGuildData } from "../data.ts";

const fakeMessage: discord.DiscordenoMessage & { author: discord.User } = {
  id: 1234n,
  timestamp: new Date("2020-01-01T12:34:56Z").getTime(),
  authorId: 1212n,
  author: {
    id: "1212",
    username: "fake-username",
    bot: false,
    avatar: null,
    discriminator: "test",
  } as discord.User,
  attachments: [],
  // @ts-expect-error - ignore unneeded fields.
  channel: {
    guildId: 123n,
    id: 12345n,
    lastPinTimestamp: undefined,
    mention: "",
    nsfw: true,
    rateLimitPerUser: undefined,
    type: discord.ChannelTypes.GuildText,
    userLimit: undefined,
  },
  channelID: "channel-id",
  content: "test-content",
  editedTimestamp: undefined,
  embeds: [],
  // @ts-expect-error - ignore unneeded fields.
  guild: {},
  guildId: 123n,
  // @ts-expect-error - ignore unneeded fields.
  member: {},
  mentionChannels: undefined,
  mentionRoles: [],
  // @ts-expect-error - ignore unneeded fields.
  mentions: {},
  mentionsEveryone: false,
  messageReference: undefined,
  pinned: false,
  tts: false,
  type: 0,
  webhookID: undefined,
};

Deno.test(
  "Should return an empty array of the message is from a bot",
  async () => {
    assertEquals(await processMessage(fakeMessage), []);
  }
);

Deno.test(
  "Should return an empty array if there are no URLs in the message",
  async () => {
    // assertEquals(
    await processMessage({
      ...fakeMessage,
    });
    //   []
    // );
  }
);

Deno.test(
  "Should return an empty array, if there's an URL but it's the first time we see it and the guild.",
  async () => {
    const getUsernameForUserIdStub = stub(
      _internal,
      "getUsernameForUserId",
      () => Promise.resolve("stubbed-author-response")
    );

    try {
      clearData();

      assertEquals(
        await processMessage({
          ...fakeMessage,
          content: "Some url: http://example.com",
        }),
        []
      );
      assertEquals(getGuildData("123"), {
        seenMessageIds: [],
        urls: {
          "http://example.com": [
            {
              messageid: fakeMessage.id.toString(),
              timestamp: new Date(fakeMessage.timestamp).toISOString(),
              userid: "1212",
              username: "stubbed-author-response",
            },
          ],
        },
      });
      assertSpyCall(getUsernameForUserIdStub, 0, {
        args: [1212n],
      });
    } finally {
      getUsernameForUserIdStub.restore();
    }
  }
);

Deno.test(
  "Should return an element in the array, when an existing URL is encountered.",
  async () => {
    const getUsernameForUserIdStub = stub(
      _internal,
      "getUsernameForUserId",
      () => Promise.resolve("stubbed-author-response")
    );

    try {
      clearData();
      const oneYearAgo = new Date(fakeMessage.timestamp);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      getGuildData(fakeMessage.guildId!.toString()).urls = {
        "http://example.com": [
          {
            messageid: "old-fake-message-id",
            timestamp: oneYearAgo.toISOString(),
            userid: "user-id",
            username: "fake-username",
          },
        ],
      };

      const result = await processMessage({
        ...fakeMessage,
        content: "Some url: http://example.com",
      });

      assertEquals(result, [
        {
          firstTimePosted: {
            messageid: "old-fake-message-id",
            timestamp: new Date("2019-01-01T12:34:56.000Z").toISOString(),
            userid: "user-id",
            username: "fake-username",
          },
          postCount: 1,
          url: "http://example.com",
          userid: "1212",
        },
      ]);
      assertEquals(getGuildData("123"), {
        seenMessageIds: [],
        urls: {
          "http://example.com": [
            // The original message.
            {
              messageid: "old-fake-message-id",
              timestamp: oneYearAgo.toISOString(),
              userid: "user-id",
              username: "fake-username",
            },
            // The new double posted message.
            {
              messageid: fakeMessage.id.toString(),
              timestamp: new Date(fakeMessage.timestamp).toISOString(),
              userid: "1212",
              username: "stubbed-author-response",
            },
          ],
        },
      });

      assertSpyCall(getUsernameForUserIdStub, 0, {
        args: [1212n],
      });
    } finally {
      getUsernameForUserIdStub.restore();
    }
  }
);
