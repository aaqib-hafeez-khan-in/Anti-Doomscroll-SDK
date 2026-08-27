import {create} from 'zustand';
import {Entry, FilterType} from '../types';
import {DatabaseService} from '../services/DatabaseService';
import {Logger} from '../services/AnalyticsService';

interface JournalState {
  entries: Entry[];
  searchQuery: string;
  activeFilter: FilterType;
  isLoading: boolean;
  setSearchQuery: (q: string) => void;
  setFilter: (f: FilterType) => void;
  loadEntries: () => Promise<void>;
  addEntry: (
    e: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Entry>;
  editEntry: (id: string, patch: Partial<Entry>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  searchEntries: (query: string) => Promise<Entry[]>;
}

export const useJournalStore = create<JournalState>()((set, get) => ({
  entries: [],
  searchQuery: '',
  activeFilter: 'all',
  isLoading: false,

  setSearchQuery: (q: string) => {
    set({searchQuery: q});
  },

  setFilter: (f: FilterType) => {
    set({activeFilter: f});
  },

  loadEntries: async (): Promise<void> => {
    set({isLoading: true});
    try {
      const entries = await DatabaseService.getEntries();
      set({entries, isLoading: false});
    } catch (error) {
      Logger.error('useJournalStore.loadEntries failed', error);
      set({isLoading: false});
      throw error;
    }
  },

  addEntry: async (
    params: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Entry> => {
    try {
      const newEntry = await DatabaseService.createEntry(params);
      set(state => ({entries: [newEntry, ...state.entries]}));
      return newEntry;
    } catch (error) {
      Logger.error('useJournalStore.addEntry failed', error);
      throw error;
    }
  },

  editEntry: async (id: string, patch: Partial<Entry>): Promise<void> => {
    try {
      await DatabaseService.updateEntry(id, patch);
      set(state => ({
        entries: state.entries.map(e =>
          e.id === id
            ? {...e, ...patch, updatedAt: new Date().toISOString()}
            : e,
        ),
      }));
    } catch (error) {
      Logger.error('useJournalStore.editEntry failed', error);
      throw error;
    }
  },

  removeEntry: async (id: string): Promise<void> => {
    try {
      await DatabaseService.deleteEntry(id);
      set(state => ({entries: state.entries.filter(e => e.id !== id)}));
    } catch (error) {
      Logger.error('useJournalStore.removeEntry failed', error);
      throw error;
    }
  },

  searchEntries: async (query: string): Promise<Entry[]> => {
    try {
      if (!query.trim()) {
        return get().entries;
      }
      return await DatabaseService.searchEntries(query);
    } catch (error) {
      Logger.error('useJournalStore.searchEntries failed', error);
      return get().entries;
    }
  },
}));
