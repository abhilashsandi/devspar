// Keys that tie a question to its progress. Same logic as `titleKey` in scripts/study/engine.js and
// `fnv` in scripts/study/build-index.mjs: change all three together or shared progress stops matching.

/** Normalised form of a question title: no tags, no entities, lower case, words only. */
export const titleKey = (t) =>
  String(t).replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** FNV-1a hash of a string, base 36 (the key stored in studyMeta.json and search-index consumers). */
export const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
};
