import { assertEquals } from "https://deno.land/std@0.68.0/testing/asserts.ts";
import { findUrlsInMessage } from "../url-regex.ts";

Deno.test("should not yield any URLs for message without an URL", () => {
  assertEquals(findUrlsInMessage("some message"), []);
  assertEquals(findUrlsInMessage(""), []);
});

Deno.test(
  "should return an URLs from a message only consisting of an URL",
  () => {
    assertEquals(findUrlsInMessage("https://deno.land/manual/testing"), [
      "https://deno.land/manual/testing",
    ]);
  }
);

Deno.test("should return an URL somewhere inside the message", () => {
  assertEquals(
    findUrlsInMessage("some https://deno.land/manual/testing message"),
    ["https://deno.land/manual/testing"]
  );
});

Deno.test(
  "should match multiple URLs in the same message, in the right order",
  () => {
    assertEquals(
      findUrlsInMessage(
        " asdfasfd https://www.youtube.com/ fsdafsdasdfsdf https://www.google.com/ "
      ),
      ["https://www.youtube.com/", "https://www.google.com/"]
    );
  }
);

Deno.test("should not return diplicate matches of the same URL", () => {
  assertEquals(
    findUrlsInMessage(
      " asdfasfd https://www.youtube.com/ fsdafsdasdfsdf https://www.youtube.com/ "
    ),
    ["https://www.youtube.com/"]
  );
});
