import { assertEquals } from "https://deno.land/std@0.68.0/testing/asserts.ts";
import {
  clearData,
  filterMissingMessageIds,
  markMessageIdsSeen,
} from "../data.ts";
import { getGuildData } from "../data.ts";

Deno.test(
  "getGuildData, should always return an object with an urls key",
  () => {
    clearData();

    assertEquals(getGuildData("some-random-guild-id"), {
      seenMessageIds: [],
      urls: {},
    });
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
      seenMessageIds: [],
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
    data.seenMessageIds = ["1", "2"];

    assertEquals(filterMissingMessageIds("-1", ["1", "2", "3"]), ["3"]);
  }
);

Deno.test(
  "filterMissingMessageIds: Should filter away already known messages across URLs",
  () => {
    clearData();
    const data = getGuildData("-1");
    data.seenMessageIds = ["1", "2", "3", "4"];

    assertEquals(filterMissingMessageIds("-1", ["1", "2", "3"]), []);
  }
);

Deno.test(
  "markMessageIdsSeen: Should add newly seen message IDs to the data for the guild",
  () => {
    clearData();
    const data = getGuildData("-1");

    assertEquals(markMessageIdsSeen("-1", ["1", "2", "3", "4"]), 4);
    assertEquals(data.seenMessageIds, ["1", "2", "3", "4"]);
  }
);

Deno.test("markMessageIdsSeen: Should  only add previously unseen IDs", () => {
  clearData();
  const data = getGuildData("-1");
  data.seenMessageIds.push("1", "2");

  assertEquals(markMessageIdsSeen("-1", ["1", "2", "3", "4"]), 2);
  assertEquals(data.seenMessageIds, ["1", "2", "3", "4"]);
});

// Deno never exits after running the tests, probably some weird bug. If 5
// seconds have passed and no tests have failed, we're probably out of the woods.
setTimeout(() => {
  Deno.exit(0);
}, 5_000);
