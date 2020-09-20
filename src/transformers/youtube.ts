/**
 * If the URL is a youtube our, then makes sure that the URL is always formatted
 * the same way.
 */
export const transformYoutube = (url: string): string => {
  if (!url.includes("youtu.be/") && !url.includes("youtube.com/watch?")) {
    return url;
  }
  const obj = new URL(url);
  const params = obj.searchParams;
  if (obj.host === "youtu.be") {
    obj.host = "www.youtube.com";
    const videoId = obj.pathname.slice(1);
    obj.pathname = "/watch";
    params.set("v", videoId);
  }
  const newParams = new URLSearchParams();
  if (params.has("v")) {
    newParams.set("v", params.get("v")!);
  }
  obj.search = `?${newParams.toString()}`;
  return obj.toString();
};
