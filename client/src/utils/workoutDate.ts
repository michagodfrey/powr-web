// Workout dates are calendar days ("YYYY-MM-DD"), not instants. The server
// stores them as UTC midnight, so they must never be parsed with `new Date()`
// directly — that shifts them to the previous day for users west of UTC.

// Today's date in the user's local timezone, as YYYY-MM-DD
export const todayLocal = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Strips any time portion from a stored workout date, for <input type="date">
export const toDateInputValue = (date: string): string => date.slice(0, 10);

// Parses a stored workout date as local midnight of that calendar day
export const parseWorkoutDate = (date: string): Date => {
  const [y, m, d] = toDateInputValue(date).split("-").map(Number);
  return new Date(y, m - 1, d);
};
