'use client'

import { useCallback, useMemo, useState } from 'react';
import { Category, Entry } from '@prisma/client';
import { queryWDQS } from '../../../lib/wdqs';
import { prisma } from '../../../lib/prisma';
import { normalize } from '../../../lib/normalize';

interface GuessInputProps {
  category: Category;
  entries: Entry[];
  isDynamic: boolean;
  isGameCompleted: boolean;
  onCorrectGuess: (entry: Entry) => void;
  onIncorrectGuess: (guess: string) => void;
}

function normalizeGuess(guess: string): string {
    return guess.toLowerCase().trim().replace(/\s+/g, '');
}

function buildEntryHashMap(entries: Entry[]): Map<string, Entry> {
    const hashMap = new Map<string, Entry>();

    for (const entry of entries) {
        if (entry.norm) {
            hashMap.set(entry.norm, entry);
        }
        hashMap.set(normalizeGuess(entry.label), entry);
    }
    return hashMap;
}

function buildCategoryQuery(updateSparql: string, guess: string): string {
  return updateSparql.replace("SEARCH_TERM", `${guess}`);
}

async function checkAndInsertDynamic(
  guess: string,
  category: Category
): Promise<boolean> {
  if (!category.updateSparql) {
    return false;
  }

  const sparqlWithGuess = buildCategoryQuery(category.updateSparql, guess);

  const data = await queryWDQS(sparqlWithGuess);

  if (data.results.bindings.length === 0) {
    return false;
  }

  for (const row of data.results.bindings) {
    const label = row.itemLabel?.value ?? row.item_label?.value;
    const url = row.item?.value;
    if (!label || !url) {
      console.warn("Skipping row due to missing label or URL", row);
      continue;
    }

    const aliases: string[] = row.alias ? [row.alias.value] : [];

    console.log("Posting entry to API:", label, "URL:", url, "Aliases:", aliases);

    try {
      await fetch(`http://localhost:3000/api/categories/${category.slug}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: category.id,
          label,
          norm: normalize(label),
          url,
        }),
      });
    } catch (err) {
      console.error("Failed to insert entry via API:", err);
    }
  }

  console.log("Finished inserting entries for guess:", guess);
  return true;
}


async function checkGuess(
  category: Category,
  guess: string,
  entryHashMap: Map<string, Entry>,
  isDynamic: boolean
): Promise<Entry | null> {
  const normalizedGuess = normalizeGuess(guess);
  const correspondingEntry = entryHashMap.get(normalizedGuess) || null;
  if (isDynamic && correspondingEntry === null) {
    const verifiedEntry = await checkAndInsertDynamic(guess, category);

    if (!verifiedEntry) {
      return null;
    }
  }

  return correspondingEntry;
}


export default function GuessInput({ category, entries, isDynamic, isGameCompleted, onCorrectGuess, onIncorrectGuess }: GuessInputProps) {
  const entryHashMap = useMemo(() => {
        return buildEntryHashMap(entries);
    }, [entries]);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        if (!inputValue.trim()) {
            return;
        }
        
        const correctEntry = await checkGuess(category, inputValue, entryHashMap, isDynamic);

        if (correctEntry) {
            onCorrectGuess(correctEntry);
            setInputValue('');
        } else {
            onIncorrectGuess(inputValue.trim());
            setInputValue('');
        }
    }, [inputValue, entryHashMap, onCorrectGuess, onIncorrectGuess]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="guess-input-wrapper">
      <input
        disabled={isGameCompleted}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Enter your guess..."
        className="guess-input"
      />
      <button 
        disabled={isGameCompleted}
        onClick={handleSubmit}
        className="guess-button"
      >
        Guess
      </button>
    </div>
  );
}