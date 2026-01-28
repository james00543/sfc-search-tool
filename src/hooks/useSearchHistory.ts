import { useState, useEffect } from 'react';

export const useSearchHistory = () => {
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('sfc-search-history');
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const addToHistory = (sn: string) => {
        setHistory(prev => {
            // Remove if exists, then unshift to top
            const filtered = prev.filter(item => item !== sn);
            const updated = [sn, ...filtered].slice(0, 20); // Keep last 20
            localStorage.setItem('sfc-search-history', JSON.stringify(updated));
            return updated;
        });
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('sfc-search-history');
    };

    return { history, addToHistory, clearHistory };
};
