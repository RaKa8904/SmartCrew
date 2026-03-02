import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

const RulesContext = createContext();

export const RulesProvider = ({ children }) => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRules = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/rules');
            setRules(res.data);
        } catch (err) {
            // If not authenticated yet, silently ignore — will retry after login
            if (err?.response?.status !== 401) {
                setError(err?.response?.data?.message || 'Failed to load rules');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchRules();
        } else {
            setLoading(false);
        }
    }, [fetchRules]);

    // Update a single rule by id — PUT /api/rules/:id
    const updateRule = useCallback(async (id, value) => {
        const res = await api.put(`/rules/${id}`, { value: Number(value) });
        // Update local state immediately so all consumers re-render
        setRules((prev) =>
            prev.map((r) => (r.id === id ? { ...r, value: res.data.value } : r))
        );
        return res.data;
    }, []);

    // Helper — get a rule's current value by name (with optional fallback)
    const getRuleValue = useCallback(
        (name, fallback = 0) => {
            const rule = rules.find((r) => r.name === name);
            return rule ? rule.value : fallback;
        },
        [rules]
    );

    return (
        <RulesContext.Provider value={{ rules, loading, error, updateRule, refreshRules: fetchRules, getRuleValue }}>
            {children}
        </RulesContext.Provider>
    );
};

export const useRules = () => useContext(RulesContext);
