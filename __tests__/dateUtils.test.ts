import {calculateStreak} from '../src/utils/dateUtils';

describe('calculateStreak', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-30T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns zero for no entries', () => {
    expect(calculateStreak([])).toEqual({current: 0, longest: 0});
  });

  it('counts consecutive days as the current and longest streak', () => {
    expect(
      calculateStreak([
        '2026-08-28T09:00:00.000Z',
        '2026-08-29T14:00:00.000Z',
        '2026-08-30T18:00:00.000Z',
      ]),
    ).toEqual({current: 3, longest: 3});
  });

  it('resets the current streak after a missed day while preserving the longest streak', () => {
    expect(
      calculateStreak([
        '2026-08-26T09:00:00.000Z',
        '2026-08-27T09:00:00.000Z',
        '2026-08-29T09:00:00.000Z',
        '2026-08-30T09:00:00.000Z',
      ]),
    ).toEqual({current: 2, longest: 2});
  });

  it('does not inflate a streak when there are multiple entries on one day', () => {
    expect(
      calculateStreak([
        '2026-08-28T09:00:00.000Z',
        '2026-08-28T18:00:00.000Z',
        '2026-08-29T09:00:00.000Z',
        '2026-08-30T09:00:00.000Z',
      ]),
    ).toEqual({current: 3, longest: 3});
  });

  it('handles historical streaks separately from the current streak', () => {
    expect(
      calculateStreak([
        '2026-08-20T09:00:00.000Z',
        '2026-08-21T09:00:00.000Z',
        '2026-08-28T09:00:00.000Z',
        '2026-08-29T09:00:00.000Z',
        '2026-08-30T09:00:00.000Z',
      ]),
    ).toEqual({current: 3, longest: 3});
  });

  it('keeps consecutive dates across different times of day', () => {
    expect(
      calculateStreak([
        '2026-08-28T23:59:59.000Z',
        '2026-08-29T00:00:01.000Z',
        '2026-08-30T23:59:59.000Z',
      ]),
    ).toEqual({current: 3, longest: 3});
  });

  it('returns zero current streak when the latest entry is older than yesterday', () => {
    expect(
      calculateStreak([
        '2026-08-26T09:00:00.000Z',
        '2026-08-27T09:00:00.000Z',
        '2026-08-28T09:00:00.000Z',
      ]),
    ).toEqual({current: 0, longest: 3});
  });
});
