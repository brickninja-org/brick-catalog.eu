// Function to calculate difference in days
export function differenceInDays(date1: Date, date2: Date): number {
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
    throw new Error('Both arguments must be Date objects');
  }

  // Normalize to midnight to avoid DST/timezone issues
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

  const msPerDay = 24 * 60 * 60 * 1000;

  return Math.round((utc2 - utc1) / msPerDay);
}
