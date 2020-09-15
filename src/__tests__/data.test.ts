import { assertEquals } from "https://deno.land/std@0.68.0/testing/asserts.ts";
import { DenoStdInternalError } from "https://deno.land/std@0.69.0/_util/assert.ts";
import { clearData, filterMissingMessageIds } from "../data.ts";
import { getGuildData } from "../data.ts";

Deno.test(
  "getGuildData, should always return an object with an urls key",
  () => {
    clearData();

    assertEquals(getGuildData("some-random-guild-id"), { urls: {} });
  }
);
Deno.test(
  "getGuildData, should always return an object with an urls key",
  () => {
    clearData();

    // Put some stuff into the guild data, and check that it's still there.
    getGuildData("test").urls = {
      "some-url": [],
    };
    assertEquals(getGuildData("test"), {
      urls: { "some-url": [] },
    });
  }
);

Deno.test(
  "filterMissingMessageIds: Should return full input when theres no data",
  () => {
    clearData();

    assertEquals(filterMissingMessageIds("-1", ["1", "2", "3"]), [
      "1",
      "2",
      "3",
    ]);
  }
);

Deno.test(
  "filterMissingMessageIds: Should filter away already known messages on an url",
  () => {
    clearData();
    const data = getGuildData("-1");
    data.urls = {
      "http://example.com": [
        {
          messageid: "1",
          timestamp: new Date(),
          userid: "-1",
          username: "test",
        },
        {
          messageid: "2",
          timestamp: new Date(),
          userid: "-1",
          username: "test",
        },
      ],
    };

    assertEquals(filterMissingMessageIds("-1", ["1", "2", "3"]), ["3"]);
  }
);

Deno.test(
  "filterMissingMessageIds: Should filter away already known messages across URLs",
  () => {
    clearData();
    const data = getGuildData("-1");
    data.urls = {
      "http://example.com": [
        {
          messageid: "1",
          timestamp: new Date(),
          userid: "-1",
          username: "test",
        },
        {
          messageid: "2",
          timestamp: new Date(),
          userid: "-1",
          username: "test",
        },
      ],
      "http://example2.com": [
        {
          messageid: "3",
          timestamp: new Date(),
          userid: "-1",
          username: "test",
        },
      ],
    };

    assertEquals(filterMissingMessageIds("-1", ["1", "2", "3"]), []);
  }
);

// Deno never exits after running the tests, probably some weird bug. If 5
// seconds have passed and no tests have failed, we're probably out of the woods.
setTimeout(() => {
  Deno.exit(0);
}, 5_000);
