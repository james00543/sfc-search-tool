import React from 'react';
import { motion } from 'framer-motion';
import {
    Check, X, Server, Cpu, CircuitBoard, HardDrive,
    Zap, Layers, Shield, Network, Database
} from 'lucide-react';

// Helper to check if a value is valid (not null, undefined, empty, or "N/A")
const isValid = (val: any) => {
    if (val === null || val === undefined) return false;
    const s = String(val).trim();
    return s !== '' && s.toUpperCase() !== 'N/A' && s.toUpperCase() !== 'NA';
};

interface KeyValueProps {
    label: string;
    value: any;
    className?: string;
    fullWidth?: boolean;
}

const KeyValue = ({ label, value, className = '', fullWidth = false }: KeyValueProps) => {
    if (!isValid(value)) return null;
    const displayValue = Array.isArray(value) ? value.join(', ') : value;

    return (
        <div className={`flex flex-col ${className} ${fullWidth ? 'col-span-full' : ''}`}>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
            {/* Changed truncate to break-all/break-words to handle long SNs */}
            <span className="text-sm font-medium text-gray-900 break-all">{displayValue}</span>
        </div>
    );
};

const Tile: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 ${className}`}
        >
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <div className="text-blue-500">{icon}</div>
                <h3 className="font-semibold text-gray-700">{title}</h3>
            </div>
            <div className="p-4 space-y-3">
                {children}
            </div>
        </motion.div>
    );
};

interface ConfigurationViewProps {
    data: any;
}

export const ConfigurationView: React.FC<ConfigurationViewProps> = ({ data }) => {
    if (!data?.DATA) return null;
    const d = data.DATA;

    const sections = [];

    // --- PBR Section ---
    if (isValid(d.PBR_NO) || isValid(d.Chassis_Part_Number)) {
        sections.push(
            <Tile key="pbr" title="PBR Info" icon={<Server size={18} />}>
                <KeyValue label="PBR Number" value={d.PBR_NO} />
                <KeyValue label="Product PN" value={d.Chassis_Part_Number} />
                <KeyValue label="BOM Rev" value={d.REV} />
            </Tile>
        );
    }

    // --- Generic List Helper ---
    const renderListSection = (
        key: string,
        title: string,
        icon: React.ReactNode,
        extraFields: (item: any) => React.ReactNode = () => null
    ) => {
        const list = d[key];
        if (Array.isArray(list)) {
            list.forEach((item: any, idx: number) => {
                if (isValid(item.SN) || isValid(item.PN)) {
                    sections.push(
                        <Tile key={`${key}-${idx}`} title={title} icon={icon}>
                            <KeyValue label="Position" value={item.POSITION} />
                            <KeyValue label="Serial Number" value={item.SN} />
                            <KeyValue label="Part Number" value={item.PN} />
                            {extraFields(item)}
                        </Tile>
                    );
                }
            });
        }
    };

    // --- SMM Module ---
    renderListSection("SMM_Board", "SMM Module", <Cpu size={18} />, (item) => (
        (item.MAC && (
            <>
                <KeyValue label="BMC MAC" value={item.MAC.BMC_MAC} />
                <KeyValue label="SYS MAC" value={item.MAC.SYS_MAC} />
            </>
        ))
    ));

    // --- Button Board ---
    renderListSection("Button_Board", "Button Board", <CircuitBoard size={18} />);

    // --- HPM ---
    if (Array.isArray(d.HPM)) {
        const leftHPM = d.HPM.find((i: any) => i.POSITION === "L");
        const rightHPM = d.HPM.find((i: any) => i.POSITION === "R");
        if (leftHPM || rightHPM) {
            const commonPN = leftHPM?.PN || rightHPM?.PN;
            sections.push(
                <Tile key="hpm-consolidated" title="HPM" icon={<HardDrive size={18} />}>
                    <KeyValue label="Part Number" value={commonPN} />
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
                        {leftHPM && <KeyValue label="Left SN" value={leftHPM.SN} />}
                        {rightHPM && <KeyValue label="Right SN" value={rightHPM.SN} />}
                    </div>
                </Tile>
            );
        } else {
            renderListSection("HPM", "HPM", <HardDrive size={18} />);
        }
    }

    // --- SMM Interposer ---
    renderListSection("SMM_Interposer", "SMM Interposer", <CircuitBoard size={18} />);

    // --- OS SSD ---
    renderListSection("OS_SSD", "OS SSD", <HardDrive size={18} />);

    // --- PDB ---
    renderListSection("PDB", "PDB", <Zap size={18} />);

    // --- Midplane ---
    renderListSection("Midplane", "Midplane", <Layers size={18} />);

    // --- HMC Module ---
    renderListSection("HMC_Module", "HMC Module", <Cpu size={18} />);

    // --- TPM ---
    renderListSection("TPM", "TPM", <Shield size={18} />);

    // --- E1.S SSD (Consolidated) ---
    if (Array.isArray(d["E1.S_SSD"]) && d["E1.S_SSD"].length > 0) {
        // Filter out duplicate SSDs that are already listed in OS_SSD
        // Assuming duplication is based on SN
        const osSSDSNs = new Set(
            Array.isArray(d.OS_SSD)
                ? d.OS_SSD.map((item: any) => item.SN?.trim()).filter(Boolean)
                : []
        );

        const uniqueE1S = d["E1.S_SSD"].filter((item: any) => {
            const sn = item.SN?.trim();
            return isValid(sn) && !osSSDSNs.has(sn);
        });

        if (uniqueE1S.length > 0) {
            sections.push(
                <Tile key="e1s-consolidated" title="E1.S SSD" icon={<Database size={18} />} className="col-span-1 sm:col-span-2 lg:col-span-1">
                    <div className="space-y-4">
                        {uniqueE1S.map((item: any, idx: number) => (
                            <div key={idx} className={idx > 0 ? "pt-3 border-t border-gray-100" : ""}>
                                <div className="grid grid-cols-1 gap-1">
                                    <KeyValue label="Serial Number" value={item.SN} />
                                    <KeyValue label="Part Number" value={item.PN} />
                                    {isValid(item.POSITION) && <KeyValue label="Position" value={item.POSITION} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </Tile>
            );
        }
    }

    // --- DPU Board ---
    renderListSection("DPU_Board", "DPU Board (BF4)", <Cpu size={18} />, (item) => (
        item.MAC && <KeyValue label="MAC Addresses" value={item.MAC} fullWidth />
    ));

    // --- ConnectX Module (Consolidated L/R) ---
    if (Array.isArray(d.ConnectX_Module)) {
        const cxModules = d.ConnectX_Module.filter((mod: any) => isValid(mod.SN) || isValid(mod.PN));

        if (cxModules.length > 0) {
            sections.push(
                <Tile key="cx-consolidated" title="ConnectX Modules" icon={<Network size={18} />} className="col-span-1 sm:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cxModules.map((mod: any, idx: number) => (
                            <div key={idx} className={`${idx > 0 ? 'pt-4 md:pt-0 md:pl-6 md:border-l border-gray-100 border-t md:border-t-0' : ''}`}>
                                <div className="font-semibold text-gray-800 mb-2">{mod.POSITION === 'L' ? 'Left Module' : mod.POSITION === 'R' ? 'Right Module' : `Module ${mod.POSITION || ''}`}</div>
                                <div className="space-y-2 mb-4">
                                    <KeyValue label="Serial Number" value={mod.SN} />
                                    <KeyValue label="Part Number" value={mod.PN} />
                                </div>

                                {Array.isArray(mod.ConnectX) && (
                                    <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                                        {mod.ConnectX.map((sub: any, subIdx: number) => (
                                            <div key={subIdx} className={subIdx > 0 ? "pt-2 border-t border-gray-200" : ""}>
                                                <div className="text-xs font-bold text-gray-500 mb-1">CONNECTX #{sub.POSITION}</div>
                                                <KeyValue label="SN" value={sub.SN} />
                                                <KeyValue label="PN" value={sub.PN} />
                                                {sub.MAC && <KeyValue label="MACs" value={sub.MAC} />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Tile>
            );
        }
    }

    if (sections.length === 0) {
        return <div className="p-4 text-gray-500 italic">No configuration data available.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections}
        </div>
    );
};

export const RouteView: React.FC<{ data: any }> = ({ data }) => {
    if (!data) return null;
    const rawResult = data.RESULT || JSON.stringify(data);
    const repairMatch = rawResult.match(/R_([A-Za-z0-9_]+)/);

    let displayResult = rawResult;
    let isRepair = false;

    if (repairMatch) {
        displayResult = `Repair at ${repairMatch[1]}`;
        isRepair = true;
    }

    const isPass = rawResult.toUpperCase().includes('PASS') || rawResult.toUpperCase().includes('OK');
    const isFail = !isPass && !isRepair;

    // Color logic
    let colorClass = "bg-gray-50 text-gray-700 border-gray-200";
    if (isPass) colorClass = "bg-green-50 text-green-700 border-green-200";
    if (isFail) colorClass = "bg-red-50 text-red-700 border-red-200";
    if (isRepair) colorClass = "bg-yellow-50 text-yellow-700 border-yellow-200";

    return (
        <div className={`p-4 rounded-xl border ${colorClass} shadow-sm flex items-center justify-between`}>
            <div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-70">Check Route</span>
                <div className="text-lg font-bold">{displayResult}</div>
            </div>
            {isPass && <Check className="w-6 h-6" />}
            {isFail && <X className="w-6 h-6" />}
            {isRepair && <div className="font-bold flex items-center text-sm bg-white/50 px-2 py-1 rounded">Action Required</div>}
        </div>
    )
}
