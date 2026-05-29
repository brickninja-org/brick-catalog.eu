export interface RelativeDateDifference {
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
}

const SECONDS_TO_MINUTES_THRESHOLD = 150;
const MINUTES_TO_HOURS_THRESHOLD = 120;
const HOURS_TO_DAYS_THRESHOLD = 24;

export function isValidDate(date: Date | null | undefined): date is Date {
  return !!date && Number.isFinite(date.valueOf());
}

export function getRelativeDateDifference(
  targetDate: Date,
  nowDate: Date = new Date(),
): RelativeDateDifference {
  const difference: RelativeDateDifference = {
    value: (targetDate.valueOf() - nowDate.valueOf()) / 1000,
    unit: 'second',
  };

  if (Math.abs(difference.value) > SECONDS_TO_MINUTES_THRESHOLD) {
    difference.value /= 60;
    difference.unit = 'minute';

    if (Math.abs(difference.value) > MINUTES_TO_HOURS_THRESHOLD) {
      difference.value /= 60;
      difference.unit = 'hour';

      if (Math.abs(difference.value) > HOURS_TO_DAYS_THRESHOLD) {
        difference.value /= 24;
        difference.unit = 'day';
      }
    }
  }

  return difference;
}
