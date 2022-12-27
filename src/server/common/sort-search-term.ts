export const sortSearchTerm = (term: string) => {
  if (!term) return { hashtags: [], searchText: "" };

  const hashtags = term
    .split(" ")
    .filter((w) => w.startsWith("#"))
    .map((h) => h.replace(/#+/gi, ""));

  const searchText = term.replace(/#\w*/gi, "").replace(/\s+/gi, " ").trim();

  return { hashtags, searchText };
};
