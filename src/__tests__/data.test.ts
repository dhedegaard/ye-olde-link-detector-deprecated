import { assertEquals } from "https://deno.land/std@0.68.0/testing/asserts.ts";
import { clearData } from "../data.ts";
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
