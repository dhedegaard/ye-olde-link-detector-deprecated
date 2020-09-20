import { transformYoutube } from "./youtube.ts";

/**
 * Transforms URLs based on various conditions.
 *
 * An example is unifying the youtube URLs to a single format, to better check
 * for duplicate links.
 */
export const urlTransformer = (url: string): string => {
  return transformYoutube(url);
};
