'use client'

import { Entry } from "@prisma/client"
import { useState, useCallback, useMemo } from "react"

export interface GuessInputProps {
    entries: Entry[];
    disabled?: boolean;
};

function normalizeGuess(guess: string): string {
    return guess.toLowerCase().trim().replace(/\s+/g, '');
}

function buildEntryHashMap(entries: Entry[]): Map<string, Entry> {
    const hashMap = new Map<string, Entry>();

    for (const entry of entries) {
        hashMap.set(entry.norm, entry)
        hashMap.set(normalizeGuess(entry.label), entry)

        // for (const alias of entry.aliases) {
        //     hashMap.set(alias.norm, entry);
        //     hashMap.set(normalizeGuess(alias.label), entry)
        // }
    }
    return hashMap
}

function checkGuess(guess: string, entryHashMap: Map<string, Entry>): Entry | null {
    const normalizedGuess = normalizeGuess(guess)
    
    return entryHashMap.get(normalizedGuess) || null
}

export default function GuessInput({
    entries,
    disabled = false,
}: GuessInputProps) {
    const entryHashMap = useMemo(() => {
        return buildEntryHashMap(entries)
    }, [entries])

    const [guess, setGuess] = useState('')

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        if (!guess.trim()) {
            return
        }
        
        const correctGuess = checkGuess(guess, entryHashMap)

        if (correctGuess) {
            setGuess('');
            console.log("You got it!")
            return
        }
    }, [guess, entryHashMap]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGuess(e.target.value)
    }

    return (
        <form onSubmit={handleSubmit} className="guess-input-form">
            <div className="input-field">
                <input
                    type="text"
                    value={guess}
                    onChange={handleInputChange}
                    placeholder=''
                    className="guess-input"
                    autoComplete="off"
                    disabled={disabled}
                    autoFocus
                />
            </div>

            <div className="guess-button">
                <button
                    type="submit"
                    className="submit-button"
                    disabled={!guess.trim() || disabled}
                >
                    Guess
                </button>
            </div>
        </form>
    )
}