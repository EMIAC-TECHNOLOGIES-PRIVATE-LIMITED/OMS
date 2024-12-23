// src/hooks/useTypeAhead.ts

import { useState, useRef } from 'react';
import { fetchDataPage } from '../utils/apiService';

const apiBaseUrl: string = import.meta.env.VITE_API_URL; // Dynamic API base URL

export const useTypeAhead = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (column: string, value: string) => {
    console.log(`Fetching suggestions for column: ${column} and value: ${value}`);

    if (!column || !value) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetchDataPage(
          `${apiBaseUrl}/data/sites/data`, // Use dynamic API base URL
          'POST',
          { column, value } // POST body
        );

        if (response.success) {
          console.log('Received successful response:', response);
          setSuggestions(response.data.map((item: any) => item[column]));
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    }, 300);
  };

  const resetSuggestions = () => {
    setSuggestions([]);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };

  return { suggestions, fetchSuggestions, resetSuggestions };
};
