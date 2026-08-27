import {useEffect, useMemo} from 'react';
import {useJournalStore} from '../store/useJournalStore';
import {Entry, JournalSection, FilterType} from '../types';
import {
  getWeekRange,
  getMonthRange,
  formatDateSectionHeader,
} from '../utils/dateUtils';
import {parseISO, isWithinInterval} from 'date-fns';

interface UseJournalEntriesReturn {
  sections: JournalSection[];
  filteredEntries: Entry[];
  totalCount: number;
  isLoading: boolean;
  reload: () => Promise<void>;
}

export function useJournalEntries(): UseJournalEntriesReturn {
  const {entries, activeFilter, searchQuery, isLoading, loadEntries} =
    useJournalStore();

  useEffect(() => {
    // eslint-disable-next-line no-void
    void loadEntries();
  }, [loadEntries]);

  const filteredEntries = useMemo<Entry[]>(() => {
    let result = entries;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        e =>
          e.entryText.toLowerCase().includes(q) ||
          e.promptText.toLowerCase().includes(q),
      );
    }

    if (activeFilter !== 'all') {
      const moodFilters: FilterType[] = [
        'grateful',
        'calm',
        'reflective',
        'challenged',
        'hopeful',
        'neutral',
      ];

      if (activeFilter === 'week') {
        const {start, end} = getWeekRange();
        result = result.filter(e =>
          isWithinInterval(parseISO(e.createdAt), {start, end}),
        );
      } else if (activeFilter === 'month') {
        const {start, end} = getMonthRange();
        result = result.filter(e =>
          isWithinInterval(parseISO(e.createdAt), {start, end}),
        );
      } else if (moodFilters.includes(activeFilter)) {
        result = result.filter(e => e.mood === activeFilter);
      }
    }

    return result;
  }, [entries, activeFilter, searchQuery]);

  const sections = useMemo<JournalSection[]>(() => {
    const sectionMap = new Map<string, Entry[]>();

    for (const entry of filteredEntries) {
      const header = formatDateSectionHeader(entry.createdAt);
      const existing = sectionMap.get(header) ?? [];
      existing.push(entry);
      sectionMap.set(header, existing);
    }

    return Array.from(sectionMap.entries()).map(([title, data]) => ({
      title,
      data,
    }));
  }, [filteredEntries]);

  return {
    sections,
    filteredEntries,
    totalCount: filteredEntries.length,
    isLoading,
    reload: loadEntries,
  };
}
