import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import type { GetConfigurationResponse, CheckRouteResponse } from '../types';

interface SearchResult {
    config: GetConfigurationResponse | null;
    route: CheckRouteResponse | null;
    error: string | null;
}

export const useSFCSearch = () => {
    const { settings } = useSettings();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult | null>(null);

    const search = async (sn: string) => {
        setIsLoading(true);
        setResults(null);

        try {
            // Parallel requests
            const configPromise = fetch('/SFCAPI/SFC/GetConfigurations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    SN: sn,
                    STATION_ID: settings.STATION_ID,
                    PROJECT: settings.PROJECT,
                }),
            });

            const routePromise = fetch('/SFCAPI/SFC/CheckRoute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    SN: sn,
                    STATION_ID: settings.STATION_ID,
                    EMP_NO: settings.EMP_NO,
                    MODEL_NAME: settings.MODEL_NAME,
                }),
            });

            const [configRes, routeRes] = await Promise.all([configPromise, routePromise]);

            const configData = await configRes.json().catch(() => null);
            const routeData = await routeRes.json().catch(() => null);

            if (!configRes.ok && !routeRes.ok) {
                throw new Error('Failed to fetch data from SFC API');
            }

            setResults({
                config: configData,
                route: routeData,
                error: null,
            });
        } catch (err) {
            console.error(err);
            setResults({
                config: null,
                route: null,
                error: err instanceof Error ? err.message : 'An unknown error occurred',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const clear = () => setResults(null);

    return { search, isLoading, results, clear };
};
