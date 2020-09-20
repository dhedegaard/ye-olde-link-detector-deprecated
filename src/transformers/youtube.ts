/**
 * If the URL is a youtube video, then makes sure that the URL is always
 * formatted the same way.
 */
export const transformYoutube = (url: string): string => {
  // Skip all non-youtube related domains.
  if (!url.includes("youtu.be/") && !url.includes("youtube.com/watch?")) {
    return url;
  }
  const obj = new URL(url);
  const params = obj.searchParams;
  // Convert youtu.be -> youtube.com, move the videoId from the path to a GET
  // parameter.
  if (obj.host === "youtu.be") {
    obj.host = "www.youtube.com";
    const videoId = obj.pathname.slice(1);
    obj.pathname = "/watch";
    params.set("v", videoId);
  }
  // Implicitly, remove any GET parameters not being "v".
  const newParams = new URLSearchParams();
  if (params.has("v")) {
    newParams.set("v", params.get("v")!);
  }
  obj.search = `?${newParams.toString()}`;
  return obj.toString();
};
