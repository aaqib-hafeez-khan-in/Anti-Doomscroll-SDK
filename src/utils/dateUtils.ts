import {
  format,
  isToday,
  isYesterday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  differenceInCalendarDays,
  getDayOfYear,
  eachDayOfInterval,
  subDays,
  subMonths,
  isSameDay,
} from 'date-fns';

export function formatTimestamp(isoString: string): string {
  const date = parseISO(isoString);
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, yyyy • h:mm a');
}

export function formatDateSectionHeader(isoString: string): string {
  const date = parseISO(isoString);
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'EEEE, MMMM d');
}

export function getWeekRange(): {start: Date; end: Date} {
  const now = new Date();
  return {
    start: startOfWeek(now, {weekStartsOn: 1}),
    end: endOfWeek(now, {weekStartsOn: 1}),
  };
}

export function getMonthRange(): {start: Date; end: Date} {
  const now = new Date();
  return {start: startOfMonth(now), end: endOfMonth(now)};
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export function getDayOfYearIndex(): number {
  return getDayOfYear(new Date()) - 1;
}

export function calculateStreak(entryDates: string[]): {
  current: number;
  longest: number;
} {
  if (entryDates.length === 0) {
    return {current: 0, longest: 0};
  }

  const uniqueSortedDates = Array.from(
    new Set(entryDates.map(d => toISODateString(parseISO(d)))),
  ).sort();

  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < uniqueSortedDates.length; i++) {
    const prev = parseISO(uniqueSortedDates[i - 1]);
    const curr = parseISO(uniqueSortedDates[i]);
    const diff = differenceInCalendarDays(curr, prev);

    if (diff === 1) {
      tempStreak += 1;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  const lastDate = parseISO(uniqueSortedDates[uniqueSortedDates.length - 1]);
  const today = new Date();
  const diffFromToday = differenceInCalendarDays(today, lastDate);

  if (diffFromToday <= 1) {
    currentStreak = tempStreak;
  } else {
    currentStreak = 0;
  }

  return {current: currentStreak, longest: longestStreak};
}

export function getLast7Days(): Date[] {
  const today = new Date();
  return eachDayOfInterval({start: subDays(today, 6), end: today});
}

export function getLast90Days(): Date[] {
  const today = new Date();
  return eachDayOfInterval({start: subMonths(today, 3), end: today});
}

export function isSameDayAsEntry(entryCreatedAt: string, date: Date): boolean {
  return isSameDay(parseISO(entryCreatedAt), date);
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}
