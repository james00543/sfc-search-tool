import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, ThermometerSnowflake, ThermometerSun, Cable } from 'lucide-react';

// --- Types for Rack Data ---
interface RackItem {
    uHeight: number;
    startU: number;
    label: string;
    details?: any;
    color: string;
    type: 'COMPUTE' | 'SWITCH' | 'POWER' | 'MGMT' | 'OTHER';
}

const RACK_HEIGHT = 48;

// --- Mapping Logic ---
const mapPositionToRU = (type: string, posStr: string): number => {
    const pos = parseInt(posStr, 10);
    if (isNaN(pos)) return 0;

    if (type === 'Power_Shelf' || type === 'Management_Switch') return pos;
    // Compute/Switch Trays (Offset +10)
    if (type === 'Compute_Tray' || type === 'Switch_Tray') return pos + 10;

    return pos;
};

// --- Helper: Render MACs ---
const renderMACs = (mac: any) => {
    if (!mac) return null;

    if (Array.isArray(mac)) {
        return (
            <div className="mt-1">
                <span className="text-gray-400 block mb-0.5">MAC Addresses:</span>
                <div className="grid grid-cols-2 gap-x-2">
                    {mac.map((m, i) => (
                        <div key={i} className="font-mono text-emerald-300">{m}</div>
                    ))}
                </div>
            </div>
        );
    }

    if (typeof mac === 'object') {
        return (
            <div className="mt-1">
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                    {Object.entries(mac).map(([key, val]) => (
                        <React.Fragment key={key}>
                            <span className="text-gray-400 text-right">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-mono text-emerald-300">
                                {typeof val === 'string' ? val : JSON.stringify(val)}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    }

    return <div><span className="text-gray-400">MAC:</span> {String(mac)}</div>;
};

// --- Helper: Render Power Shelf Details ---
const renderPowerShelfDetails = (details: any) => {
    if (!details) return null;

    return (
        <>
            {/* PSC (PMC) Section */}
            {details.PSC && Array.isArray(details.PSC) && details.PSC.length > 0 && (
                <div className="border-t border-gray-700 pt-1.5 mt-1.5 text-xs">
                    <span className="text-gray-400 block mb-0.5 text-[10px] uppercase tracking-wider">PSC (PMC)</span>
                    {details.PSC.map((psc: any, idx: number) => (
                        <div key={idx} className="mb-1">
                            <div className="grid grid-cols-[auto_1fr] gap-x-3">
                                <span className="text-gray-500 text-right">SN:</span>
                                <span className="font-mono text-white select-all">{psc.SN || 'N/A'}</span>
                            </div>
                            {psc.MAC && <div className="ml-4">{renderMACs(psc.MAC)}</div>}
                        </div>
                    ))}
                </div>
            )}

            {/* PSU Section */}
            {details.PSU && Array.isArray(details.PSU) && details.PSU.length > 0 && (
                <div className="border-t border-gray-700 pt-1.5 mt-1.5">
                    <span className="text-gray-400 block mb-0.5 text-[10px] uppercase tracking-wider">Power Supply Units</span>
                    <div className="grid grid-cols-2 gap-2">
                        {details.PSU.sort((a: any, b: any) => {
                            const posA = parseInt(a.POSITION) || 0;
                            const posB = parseInt(b.POSITION) || 0;
                            const pairA = Math.ceil(posA / 2);
                            const pairB = Math.ceil(posB / 2);
                            if (pairA !== pairB) return pairB - pairA; // Pair 3 (5,6) > Pair 2 (3,4) > Pair 1 (1,2)
                            return posA - posB; // 5 before 6
                        }).map((psu: any, idx: number) => (
                            <div key={idx} className="bg-gray-800/50 p-1.5 rounded border border-gray-700/50">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-gray-500 text-[10px] font-bold">PSU #{psu.POSITION}</span>
                                </div>
                                <div className="font-mono text-[10px] text-emerald-300 leading-tight break-all">
                                    {psu.SN}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

// --- Tooltip Component ---
const HoverTooltip = ({ label, details, subtitle, align = 'center' }: { label: string, details?: any, subtitle?: string, align?: 'left' | 'center' | 'right' }) => {
    let placementClass = "";
    if (align === 'center') placementClass = "left-1/2 -translate-x-1/2";
    if (align === 'left') placementClass = "left-0 translate-x-2";
    if (align === 'right') placementClass = "right-0 -translate-x-2";

    return (
        <div className={`
            absolute w-72 z-[100]
            bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-xl shadow-2xl 
            opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 scale-95 group-hover:scale-100
            top-1/2 -translate-y-1/2 ${placementClass}
        `}>
            <div className="font-bold text-sm border-b border-gray-700 pb-2 mb-2 flex justify-between items-center">
                <span>{label}</span>
                {details?.REV && <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">Rev {details.REV}</span>}
            </div>
            {subtitle && <div className="text-xs text-gray-400 mb-2">{subtitle}</div>}

            <div className="text-xs space-y-1.5">
                <div className="grid grid-cols-[auto_1fr] gap-x-3">
                    <span className="text-gray-400 text-right">SN:</span>
                    <span className="font-mono text-white select-all">{details?.SN || 'N/A'}</span>

                    <span className="text-gray-400 text-right">PN:</span>
                    <span className="font-mono text-white select-all">{details?.PN || 'N/A'}</span>
                </div>

                {details?.MAC && (
                    <div className="border-t border-gray-700 pt-1.5 mt-1.5">
                        {renderMACs(details.MAC)}
                    </div>
                )}

                {/* Power Shelf Specifics: PSC and PSU */}
                {renderPowerShelfDetails(details)}
            </div>
        </div>
    );
};

// --- Rack View Component ---
export const RackView: React.FC<{ data: any }> = ({ data }) => {
    const [view, setView] = useState<'FRONT' | 'REAR'>('FRONT');

    if (!data?.DATA) return null;
    const d = data.DATA;

    const rackItems: RackItem[] = [];

    const addItem = (u: number, h: number, label: string, color: string, type: RackItem['type'], details?: any) => {
        if (u < 1 || u > RACK_HEIGHT) return;
        rackItems.push({ uHeight: h, startU: u, label, color, type, details });
    };

    // --- Process Front Items ---
    if (d.Management_Switch) {
        d.Management_Switch.forEach((item: any) => {
            const u = mapPositionToRU('Management_Switch', item.POSITION);
            addItem(u, 1, `Mgmt Switch ${item.POSITION}`, "bg-orange-100 border-orange-200 text-orange-800", 'MGMT', item);
        });
    }
    if (d.Power_Shelf) {
        d.Power_Shelf.forEach((item: any) => {
            const u = mapPositionToRU('Power_Shelf', item.POSITION);
            let label = "Power Shelf";
            if (u === 4) label = "3U pwrshlf-01";
            if (u === 7) label = "3U pwrshlf-02";
            if (u === 39 || u === 40) label = "3U pwrshlf-03";
            if (u === 42 || u === 43) label = "3U pwrshlf-04";
            addItem(u, 3, label, "bg-yellow-100 border-yellow-300 text-yellow-800", 'POWER', item);
        });
    }
    if (d.Switch_Tray) {
        d.Switch_Tray.forEach((item: any) => {
            const u = mapPositionToRU('Switch_Tray', item.POSITION);
            addItem(u, 1, `Switch Tray-${item.POSITION}`, "bg-orange-200 border-orange-300 text-orange-900", 'SWITCH', item);
        });
    }
    if (d.Compute_Tray) {
        d.Compute_Tray.forEach((item: any) => {
            const u = mapPositionToRU('Compute_Tray', item.POSITION);
            addItem(u, 1, `Compute Tray-${item.POSITION}`, "bg-green-100 border-green-200 text-green-800", 'COMPUTE', item);
        });
    }

    // --- Rear View Logic ---
    // Layout: Hot Manifold | Cart 4 | Cart 3 | Cart 2 | Cart 1 | Cold Manifold
    // Note: Assuming Left JSON Manifold is Hot (next to 4) and Right is Cold (next to 1) 
    // or strictly by position: 4 Left, 1 Right.
    const renderRearView = () => {
        const cartridges = d.Cable_Cartridge || [];
        const leftManifold = d.Rack_Manifold_Left?.[0]; // Usually just 1 item array?
        const rightManifold = d.Rack_Manifold_Right?.[0];

        // Helper to find specific cartridge
        const getCartridge = (pos: string) => cartridges.find((c: any) => c.POSITION === pos);

        const VerticalBar = ({ item, title, color, icon, align = 'center' }: { item: any, title: string, color: string, icon: React.ReactNode, align?: 'left' | 'right' | 'center' }) => (
            <div className={`relative flex-1 flex flex-col items-center justify-center border-x border-gray-200 group ${color} transition-all hover:flex-[1.5]`}>
                <div className="absolute top-4">{icon}</div>
                <div className="vertical-text font-bold tracking-widest text-lg opacity-50 whitespace-nowrap">{title}</div>

                {/* Item Details Tooltip */}
                {item && <HoverTooltip label={title} details={item} align={align} />}
                {!item && <div className="absolute bottom-4 text-xs opacity-50">Empty</div>}
            </div>
        );

        return (
            <div className="flex w-full h-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                {/* Hot Manifold (Left / Next to 4) */}
                <VerticalBar
                    item={leftManifold}
                    title="HOT MANIFOLD"
                    color="bg-red-100/50 hover:bg-red-100 text-red-800"
                    icon={<ThermometerSun className="text-red-500" />}
                    align="left"
                />

                {/* Cable Cartridges 4 -> 1 */}
                {[4, 3, 2, 1].map(num => (
                    <VerticalBar
                        key={num}
                        item={getCartridge(String(num))}
                        title={`CARTRIDGE ${num}`}
                        color="bg-slate-100 hover:bg-slate-200 text-slate-700"
                        icon={<Cable className="text-slate-500" />}
                    />
                ))}

                {/* Cold Manifold (Right / Next to 1) */}
                <VerticalBar
                    item={rightManifold}
                    title="COLD MANIFOLD"
                    color="bg-cyan-100/50 hover:bg-cyan-100 text-cyan-800"
                    icon={<ThermometerSnowflake className="text-cyan-500" />}
                    align="right"
                />

                {/* CSS for Vertical Text */}
                <style>{`
                    .vertical-text {
                        writing-mode: vertical-rl;
                        text-orientation: mixed;
                        transform: rotate(180deg);
                    }
                `}</style>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${view === 'FRONT' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    Rack View ({view === 'FRONT' ? 'Front' : 'Rear'})
                </h3>
                <button
                    onClick={() => setView(view === 'FRONT' ? 'REAR' : 'FRONT')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                    <ArrowLeftRight size={16} />
                    Switch to {view === 'FRONT' ? 'Rear' : 'Front'} View
                </button>
            </div>

            <div className="relative h-[96rem] w-full"> {/* 48U * 2rem */}
                <AnimatePresence mode="wait">
                    {view === 'FRONT' ? (
                        <motion.div
                            key="front"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute inset-0 flex"
                        >
                            {/* RU Labels */}
                            <div className="w-12 flex flex-col border-r border-gray-200 mr-2">
                                {Array.from({ length: 48 }, (_, i) => 48 - i).map(u => (
                                    <div key={u} className="h-8 flex items-center justify-center text-xs text-gray-400 font-mono">
                                        {u}
                                    </div>
                                ))}
                            </div>

                            {/* Front Content */}
                            <div className="flex-1 grid grid-rows-[repeat(48,2rem)] gap-[1px] bg-gray-100 border border-gray-200 rounded-lg relative">
                                {rackItems.map((item, idx) => (
                                    <motion.div
                                        key={`abs-${idx}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                        className={`${item.color} absolute left-0 right-0 m-[1px] flex justify-between items-center px-4 shadow-sm rounded hover:brightness-95 cursor-default group z-10 hover:z-50`}
                                        style={{
                                            bottom: `${(item.startU - 1) * 2}rem`,
                                            height: `${item.uHeight * 2}rem`
                                        }}
                                    >
                                        <span className="font-semibold text-xs sm:text-sm truncate">{item.label}</span>
                                        <span className="text-xs opacity-75 font-mono hidden sm:inline">{item.details?.SN}</span>

                                        {/* Tooltip positioned nicely relative to item */}
                                        <div className={`
                                            absolute left-1/2 -translate-x-1/2 w-72 
                                            bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-xl shadow-2xl 
                                            opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 scale-95 group-hover:scale-100
                                            ${item.startU > 24 ? 'top-full mt-2' : 'bottom-full mb-2'}
                                        `}>
                                            <div className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-8 border-transparent ${item.startU > 24 ? 'border-b-gray-900/95 -top-4 rotate-180' : 'border-t-gray-900/95 -bottom-4'}`}></div>

                                            <div className="font-bold text-sm border-b border-gray-700 pb-2 mb-2 flex justify-between items-center">
                                                <span>{item.label}</span>
                                                {item.details?.REV && <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">Rev {item.details.REV}</span>}
                                            </div>
                                            <div className="grid grid-cols-[auto_1fr] gap-x-3 text-xs gap-y-1">
                                                <span className="text-gray-400 text-right">SN:</span>
                                                <span className="font-mono text-white select-all">{item.details?.SN || 'N/A'}</span>
                                                <span className="text-gray-400 text-right">PN:</span>
                                                <span className="font-mono text-white select-all">{item.details?.PN || 'N/A'}</span>
                                            </div>
                                            {item.details?.MAC && (
                                                <div className="border-t border-gray-700 pt-1.5 mt-1.5 text-xs">
                                                    {renderMACs(item.details.MAC)}
                                                </div>
                                            )}
                                            {renderPowerShelfDetails(item.details)}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="rear"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="absolute inset-0"
                        >
                            {renderRearView()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
