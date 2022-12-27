/**
 *
 * @param dirtyStr dirty string needs to be cleaned up
 * @example " foo    bar   " -> "foo bar"
 * @returns cleaned string
 */
export const cleanStr = (dirtyStr: string) =>
  dirtyStr.replace(/\s+/gi, " ").trim() || "";
