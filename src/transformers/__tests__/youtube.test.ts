import { assertEquals } from "https://deno.land/std@0.68.0/testing/asserts.ts";
import { urlTransformer } from "../mod.ts";

Deno.test("it should let random URLs through", () => {
  assertEquals(urlTransformer("https://example.com"), "https://example.com");
});

Deno.test("it should transform youtu.be URLs as expected", () => {
  assertEquals(
    urlTransformer("https://youtu.be/qUm8TSGtenI"),
    "https://www.youtube.com/watch?v=qUm8TSGtenI"
  );
});

Deno.test("it should transform and remove timestampts as expected", () => {
  assertEquals(
    urlTransformer("https://youtu.be/qUm8TSGtenI?t=628"),
    "https://www.youtube.com/watch?v=qUm8TSGtenI"
  );
});

Deno.test(
  "it should remove various parameters, like playlist and index",
  () => {
    assertEquals(
      urlTransformer(
        "https://www.youtube.com/watch?v=C4DwmXK9gEY&list=WL&index=2"
      ),
      "https://www.youtube.com/watch?v=C4DwmXK9gEY"
    );
  }
);

Deno.test("it should not append v GET parameter, when there is not one", () => {
  assertEquals(
    urlTransformer("https://www.youtube.com/live"),
    "https://www.youtube.com/live"
  );
  assertEquals(
    urlTransformer("https://www.youtube.com/"),
    "https://www.youtube.com/"
  );
});

Deno.test(
  "It should remove any excessive invalid questionmarks in the videoId",
  () => {
    assertEquals(
      urlTransformer("https://www.youtube.com/watch?v=81GDlmDa-uQ?hejsa"),
      "https://www.youtube.com/watch?v=81GDlmDa-uQ"
    );
  }
);
