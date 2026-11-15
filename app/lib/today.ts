// Today's date in the reader's own calendar, as YYYY-MM-DD. Kept out of the pure planner on purpose: the
// planner is handed `today`, so Node can test it with any date.
export function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
