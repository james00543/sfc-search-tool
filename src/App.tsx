import React, { useState } from 'react';
import { Settings, Search, Loader2, X, Clock, History, LayoutGrid, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { useSFCSearch } from './hooks/useSFCSearch';
import { useSearchHistory } from './hooks/useSearchHistory';
import { ConfigurationView, RouteView } from './components/ConfigurationView';
import { RackView } from './components/RackView';

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { settings, updateSettings } = useSettings();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Station ID</label>
                        <input
                            type="text"
                            value={settings.STATION_ID}
                            onChange={(e) => updateSettings({ STATION_ID: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                        <input
                            type="text"
                            value={settings.PROJECT}
                            onChange={(e) => updateSettings({ PROJECT: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emp No</label>
                        <input
                            type="text"
                            value={settings.EMP_NO}
                            onChange={(e) => updateSettings({ EMP_NO: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                        <input
                            type="text"
                            value={settings.MODEL_NAME}
                            onChange={(e) => updateSettings({ MODEL_NAME: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                        Done
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const RickRollModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white z-10"
                >
                    <X size={32} />
                </button>
                <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="Rick Roll"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    )
}

const HistorySidebar: React.FC<{ isOpen: boolean; onClose: () => void; onSelect: (sn: string) => void }> = ({ isOpen, onClose, onSelect }) => {
    const { history, clearHistory } = useSearchHistory();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]"
                    />
                    <motion.div
                        initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col"
                    >
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                <History size={18} /> Search History
                            </h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {history.length === 0 ? (
                                <div className="text-center text-gray-400 py-8 text-sm">No recent searches</div>
                            ) : (
                                <div className="space-y-1">
                                    {history.map((sn, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { onSelect(sn); onClose(); }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg text-sm text-gray-700 flex items-center gap-3 transition-colors group"
                                        >
                                            <Clock size={14} className="text-gray-400 group-hover:text-blue-500" />
                                            <span className="font-mono">{sn}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {history.length > 0 && (
                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={clearHistory}
                                    className="w-full py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    Clear History
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

const SearchApp = () => {
    const [query, setQuery] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isRickRolling, setIsRickRolling] = useState(false);

    const { search, isLoading, results } = useSFCSearch();
    const { addToHistory } = useSearchHistory();

    const handleSearch = (e: React.FormEvent | string) => {
        if (typeof e !== 'string') e.preventDefault();
        const q = typeof e === 'string' ? e : query;

        if (q.trim()) {
            setQuery(q.trim());
            search(q.trim());
            addToHistory(q.trim());
        }
    };

    // Detect Data Type (Rack vs Compute Tray)
    // Heuristic: If Compute_Tray array exists, it's a Rack.
    const isRack = results?.config?.DATA?.Compute_Tray && Array.isArray(results.config.DATA.Compute_Tray);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center">
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <RickRollModal isOpen={isRickRolling} onClose={() => setIsRickRolling(false)} />
            <HistorySidebar
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                onSelect={(sn) => handleSearch(sn)}
            />

            {/* Header / Settings Toggle */}
            <div className="w-full p-4 flex justify-between items-center">
                <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2"
                    title="History"
                >
                    <History size={24} />
                </button>

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Settings"
                >
                    <Settings size={24} />
                </button>
            </div>

            <div className={`w-full max-w-4xl px-4 transition-all duration-500 ease-in-out ${results ? 'mt-8' : 'mt-[20vh]'}`}>

                {/* Logo Area */}
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-6xl font-bold tracking-tight text-blue-600 mb-2">
                        SFC Search
                    </h1>
                    <p className="text-gray-500 text-lg">Shopfloor Control Explorer</p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto mb-12">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter Serial Number (SN)"
                            className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-sm hover:shadow-md focus:shadow-lg focus:border-gray-300 focus:outline-none transition-all duration-300 text-lg"
                        />
                        {isLoading && (
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center mt-6 space-x-4">
                        <button
                            type="submit"
                            className="bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm px-6 py-2 rounded-md text-sm font-medium transition-all"
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            className="bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm px-6 py-2 rounded-md text-sm font-medium transition-all"
                            onClick={() => setIsRickRolling(true)}
                        >
                            I'm Feeling Lucky
                        </button>
                    </div>
                </form>

                {/* Results */}
                <AnimatePresence>
                    {results && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 pb-12"
                        >
                            {results.error && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                                    {results.error}
                                </div>
                            )}

                            {results.route && <RouteView data={results.route} />}

                            {/* Contextual Visualizer Toggle or Auto-Detect */}
                            {isRack ? (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center gap-2 text-blue-800 text-sm">
                                        <LayoutGrid size={18} />
                                        <strong>Rack Detected</strong> - Showing rack visualization.
                                    </div>
                                    <RackView data={results.config} />
                                    {/* We could also show the regular configuration view below if needed, but for now Rack View is primary */}
                                </div>
                            ) : (
                                <ConfigurationView data={results.config} />
                            )}

                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

const App = () => {
    return (
        <SettingsProvider>
            <SearchApp />
        </SettingsProvider>
    );
};

export default App;
