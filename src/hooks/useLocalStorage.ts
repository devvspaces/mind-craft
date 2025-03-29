// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';
import { GameScore } from '../types/game';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}

export function saveGameScore(score: GameScore) {
  try {
    const existingScores = JSON.parse(localStorage.getItem('memoryMatrixScores') || '[]') as GameScore[];
    const updatedScores = [...existingScores, score].slice(-10); // Keep last 10 scores
    localStorage.setItem('memoryMatrixScores', JSON.stringify(updatedScores));
  } catch (error) {
    console.error('Error saving game score:', error);
  }
}

export function getGameScores(): GameScore[] {
  try {
    return JSON.parse(localStorage.getItem('memoryMatrixScores') || '[]');
  } catch (error) {
    console.error('Error retrieving game scores:', error);
    return [];
  }
}
