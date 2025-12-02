import { useState, useEffect, useCallback } from 'react';

const MAX_HISTORY_SIZE = 20;

export const useInputHistory = (storageKey: string): [string[], (newItem: string) => void] => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(storageKey);
      if (storedHistory) {
        setSuggestions(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, [storageKey]);

  const addSuggestion = useCallback((newItem: string) => {
    if (!newItem || newItem.trim() === '') {
      return;
    }
    
    try {
      const trimmedItem = newItem.trim();
      // Add new item to the front, remove duplicates, and cap the list size
      const updatedHistory = [trimmedItem, ...suggestions.filter(item => item.toLowerCase() !== trimmedItem.toLowerCase())].slice(0, MAX_HISTORY_SIZE);
      
      setSuggestions(updatedHistory);
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [storageKey, suggestions]);

  return [suggestions, addSuggestion];
};