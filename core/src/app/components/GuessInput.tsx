'use client'

import './guess-input.css'
import Fuse from 'fuse.js'

import { useCallback, useMemo, useState } from 'react';
import { queryWDQS } from '../../../lib/wdqs';
import { normalize } from '../../../lib/normalize';
import { CategoryType, EntryType, GuessInputProps } from './types';

const FUZZY_THRESHOLD = 0.1;
const LENGTH_DIFF_THRESHOLD = 3;

function buildEntryHashMap(entries: EntryType[]): Map<string, EntryType> {
    const hashMap = new Map<string, EntryType>();

    for (const entry of entries) {
        if (entry.norm) {
            hashMap.set(entry.norm, entry);
        }
        hashMap.set(normalize(entry.label), entry);
    }
    return hashMap;
}

function buildCategoryQuery(updateSparql: string, guess: string): string {
  return updateSparql.replace("SEARCH_TERM", `${guess}`);
}

async function checkAndInsertDynamic(
  entryHashMap: Map<string, EntryType>,
  guess: string,
  category: CategoryType
): Promise<EntryType | null> {
  if (!category.updateSparql) {
    return null;
  }

  const sparqlWithGuess = buildCategoryQuery(category.updateSparql, guess);

  const data = await queryWDQS(sparqlWithGuess);

  if (data.results.bindings.length === 0) {
    return null;
  }

  for (const binding of data.results.bindings) {
    const label = binding.itemLabel?.value ?? binding.item_label?.value;
    const url = binding.item?.value;

    if (!label || !url) return null;

    const normalizedLabel = normalize(label)

    if (Math.abs(normalizedLabel.length - guess.length) > LENGTH_DIFF_THRESHOLD) {
      continue;
    }

    try {
      const res = await fetch(`/api/categories/${category.slug}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: category.id,
          label,
          norm: normalizedLabel,
          url,
        }),
      });
      if (res.ok) {
        const entry: EntryType = await res.json();
        if (entry.norm) entryHashMap.set(entry.norm, entry);
        entryHashMap.set(normalize(entry.label), entry);
        return entry;
      }
    } catch (err) {
      console.error("Failed to insert entry via API:", err);
    }
  
  }
  return null;
}

function fuzzySearch(entries: EntryType[], guess: string): EntryType | null {
  const fuse = new Fuse(entries, {
    keys: ['label', 'norm'],
    threshold: FUZZY_THRESHOLD,
    includeScore: true,
  });

  const results = fuse.search(guess);
  
  if (results.length > 0 && 
    results[0].score && 
    results[0].score < FUZZY_THRESHOLD &&
    (Math.abs(results[0].item.norm.length - guess.length) <= LENGTH_DIFF_THRESHOLD)) {
    return results[0].item;
  }
  
  return null;
}

async function checkGuess(
  category: CategoryType,
  guess: string,
  entryHashMap: Map<string, EntryType>,
  entries: EntryType[],
  isDynamic: boolean
): Promise<EntryType | null> {
  const normalizedGuess = normalize(guess);
  
  const correspondingEntry = entryHashMap.get(normalizedGuess) || null;
  if (correspondingEntry) {
    return correspondingEntry;
  }
  
  const fuzzyMatch = fuzzySearch(entries, guess);
  if (fuzzyMatch) {
    return fuzzyMatch;
  }

  // TODO: 
  // check if exists in hashmap of alias
  // check if exists in fuzzymatch of alias
  
  if (isDynamic) {
    const verifiedEntry = await checkAndInsertDynamic(entryHashMap, guess, category);
    if (!verifiedEntry) {
      return null;
    }
    return verifiedEntry
  }

  return null;
}

export default function GuessInput({ category, entries, isDynamic, isGameCompleted, onCorrectGuess, onIncorrectGuess }: GuessInputProps) {
  const entryHashMap = useMemo(() => {
        return buildEntryHashMap(entries);
    }, [entries]);
  const [inputValue, setInputValue] = useState('');
  const [showCorrectEffect, setShowCorrectEffect] = useState(false);
  const [showErrorEffect, setShowErrorEffect] = useState(false);

  const triggerCorrectEffect = () => {
      setShowCorrectEffect(true);
      setTimeout(() => setShowCorrectEffect(false), 400); 
  };

  const triggerErrorEffect = () => {
      setShowErrorEffect(true);
      setTimeout(() => setShowErrorEffect(false), 400); 
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        if (!inputValue.trim()) {
            return;
        }
        
        const correctEntry = await checkGuess(category, inputValue, entryHashMap, entries, isDynamic);

        if (correctEntry) {
            console.log("Correct Entry! :", correctEntry)
            onCorrectGuess(correctEntry);
            setInputValue('');
            triggerCorrectEffect();
        } else {
            console.log("Incorrect Entry: ", inputValue)
            onIncorrectGuess(inputValue.trim());
            setInputValue('');
            triggerErrorEffect();
        }

    }, [inputValue, entryHashMap, entries, category, isDynamic, onCorrectGuess, onIncorrectGuess]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
      <input
        disabled={isGameCompleted}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Enter your guess..."
        className={`guess-input ${showErrorEffect ? 'error-fade' : ''} ${showCorrectEffect ? 'correct-fade' : ''}`}
      />
  );
}