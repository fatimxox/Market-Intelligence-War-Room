import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IntelligenceData, User, Team, Mission, BattleRole, ChatMessage, Report, MissionStatus, PlayerAssignment } from '../../types';
import { BATTLE_CONFIGS, initializeBattleData, ROLE_BATTLE_MAP, emptyFounder, emptyExecutive, emptyCompetitivePosition, emptyGeographicFootprint, emptyProductLine, emptyPricingChange, emptyPlatform, emptyInfluencerPartnership, emptyFundingRound, emptyInvestor, emptyB2CSegment, emptyB2BSegment, emptyPainPoint, emptyStrategicPartner, emptyKeySupplier, emptyExpansion, QUICK_TOOLS } from '../../constants';
import { Send, Plus, XCircle, MagicWandIcon, MessageCircleIcon, Clock, Loader } from '../icons';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/db';
import { fetchAiAssistedData } from '../../services/geminiService';

// --- HELPER COMPONENTS ---

const AIHelperButton = ({ fieldPath, fieldLabel, isLoading, onAiAssist }: { fieldPath: string; fieldLabel: string; isLoading: boolean; onAiAssist: (path: string, label: string) => void }) => {
    return (
        <button
            onClick={() => onAiAssist(fieldPath, fieldLabel)}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-accent p-1 rounded-full hover:bg-accent/10 disabled:cursor-wait"
            title={`AI Assist: ${fieldLabel}`}
        >
            {isLoading ? (
                <MagicWandIcon className="w-4 h-4 animate-spin text-accent" />
            ) : (
                <MagicWandIcon className="w-4 h-4" />
            )}
        </button>
    );
};

const QuickTools = ({ companyName, topic }: { companyName: string; topic: string }) => {
    return (
        <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-400">Quick Search:</span>
            {Object.entries(QUICK_TOOLS).map(([key, tool]) => {
                const IconComponent = tool.icon;
                const url = `${tool.url}${encodeURIComponent(`${companyName} ${topic}`)}`;
                return (
                    <a href={url} target="_blank" rel="noopener noreferrer" key={key}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1.5 py-1 px-2 text-xs">
                            <IconComponent className="w-3 h-3" />
                            {tool.name}
                        </Button>
                    </a>
                )
            })}
        </div>
    )
};

const SectionHeader = ({ children, progress }: { children?: React.ReactNode, progress: number }) => (
    <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-accent">{children}</h3>
            <span className="text-sm font-semibold text-accent">{progress}% Complete</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-1.5">
            <motion.div
                className="bg-accent h-1.5 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
        </div>
    </div>
);

const SubSection = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="mb-8">
        <h4 className="text-lg font-semibold text-primary-text mb-3">{title}</h4>
        {children}
    </div>
);

const EditableTable = ({ data, columns, rows, onInputChange, isEditable, path, onRemoveRow, aiLoadingFields, onAiAssist }: any) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-secondary">
                <tr>
                    <th className="p-3">Field</th>
                    {columns.map((col: any, index: number) => (
                        <th key={index} className="p-3">
                            <div className="flex justify-between items-center">
                                <span>{col}</span>
                                {isEditable && data.length > 0 && (
                                    <button 
                                        onClick={() => onRemoveRow(path, index)} 
                                        className="text-gray-500 hover:text-red-400 p-1 rounded-full hover:bg-red-500/10" 
                                        title={`Remove ${col}`}>
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row: any) => (
                    <tr key={row.key} className="border-b border-panel-border">
                        <td className="p-2 font-semibold whitespace-nowrap">{row.label}</td>
                        {data.map((item: any, index: number) => (
                            <td key={index} className="p-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={item[row.key] || ''}
                                        onChange={(e) => onInputChange(`${path}.${index}.${row.key}`, e.target.value)}
                                        disabled={!isEditable}
                                        className="w-full bg-background border border-panel-border rounded-md px-2 py-1 text-primary-text placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent disabled:bg-secondary disabled:cursor-not-allowed pr-10"
                                    />
                                    {isEditable && <AIHelperButton
                                        fieldPath={`${path}.${index}.${row.key}`}
                                        fieldLabel={row.label}
                                        isLoading={aiLoadingFields.has(`${path}.${index}.${row.key}`)}
                                        onAiAssist={onAiAssist}
                                    />}
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const EditableForm = ({ data, fields, onInputChange, isEditable, path, aiLoadingFields, onAiAssist }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        {fields.map((field: any) => (
            <div key={field.key} className={field.fullWidth ? 'lg:col-span-4' : (field.halfWidth ? 'lg:col-span-2' : '')}>
                <label className="block text-sm font-medium text-gray-300 mb-1">{field.label}</label>
                <div className="relative">
                    <input
                        type="text"
                        value={data?.[field.key] || ''}
                        onChange={(e) => onInputChange(`${path}.${field.key}`, e.target.value)}
                        disabled={!isEditable}
                        className="w-full bg-background border border-panel-border rounded-md px-2 py-1 text-primary-text placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent disabled:bg-secondary disabled:cursor-not-allowed pr-10"
                    />
                    {isEditable && <AIHelperButton
                        fieldPath={`${path}.${field.key}`}
                        fieldLabel={field.label}
                        isLoading={aiLoadingFields.has(`${path}.${field.key}`)}
                        onAiAssist={onAiAssist}
                    />}
                </div>
            </div>
        ))}
    </div>
);


const getCompletionPercentage = (data: any): number => {
    let totalFields = 0;
    let filledFields = 0;

    function traverse(obj: any) {
        if (obj === null || typeof obj !== 'object') return;

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (typeof value === 'string') {
                    totalFields++;
                    if (value.trim() !== '') {
                        filledFields++;
                    }
                } else if (typeof value === 'object') {
                    traverse(value);
                }
            }
        }
    }

    traverse(data);
    return totalFields === 0 ? 0 : Math.round((filledFields / totalFields) * 100);
};

const formatRelativeTime = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};


const WarRoomScreen: React.FC = () => {
    const { missionId, teamName } = useParams();
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [team, setTeam] = useState<Team | null>(null);
    const [mission, setMission] = useState<Mission | null>(null);
    const [userRole, setUserRole] = useState<BattleRole | null>(null);
    
    const [isConfirmSubmitModalOpen, setConfirmSubmitModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('B1');
    const [battleProgress, setBattleProgress] = useState<Record<string, number>>({});
    const [intelligenceData, setIntelligenceData] = useState<IntelligenceData>(initializeBattleData());

    // AI Assist Queue State
    const [aiAssistQueue, setAiAssistQueue] = useState<{fieldPath: string, fieldLabel: string}[]>([]);
    const [aiLoadingFields, setAiLoadingFields] = useState<Set<string>>(new Set());
    const isProcessingQueueRef = useRef(false);

    // Timer state
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const timerIntervalRef = useRef<number | null>(null);
    const lastPlayedAlarm = useRef<number>(0);

    // Save status
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const saveDataTimeout = useRef<number | null>(null);
    const isInitialMount = useRef(true);

    // Chat state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLInputElement>(null);

    // Mention state
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [mentionSuggestions, setMentionSuggestions] = useState<PlayerAssignment[]>([]);
    const [isMentionBoxOpen, setIsMentionBoxOpen] = useState(false);
    
    const isLeader = currentUser?.email === team?.team_leader_email;

    // --- HELPER FUNCTIONS ---
    
    const formatTime = (ms: number | null) => {
        if (ms === null || ms < 0) return '00:00';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const getTimerColor = (ms: number | null) => {
        if (ms === null) return 'text-gray-400';
        const totalSeconds = ms / 1000;
        if (totalSeconds < 60) return 'text-danger animate-pulse';
        if (totalSeconds < 300) return 'text-yellow-400';
        return 'text-primary-text';
    };

    const playAlarm = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (!audioContext) return;
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.error("Could not play alarm sound.", e);
        }
    };

    // --- MAIN COMPONENT LOGIC ---

    const handleSubmitReport = useCallback(() => {
        if (!mission || !team || team.report_submitted) return;

        const newReport: Report = {
            id: `report-${team.id}-${Date.now()}`,
            mission_id: mission.id,
            team_name: team.team_name,
            battle_data: intelligenceData,
        };
        db.addReport(newReport);
        
        if (missionId && teamName) {
            localStorage.removeItem(`war_room_data_${missionId}_${teamName}`);
        }

        const allTeams = db.getTeams();
        const updatedTeams = allTeams.map(t => 
            t.id === team.id ? { ...t, report_submitted: true, submission_timestamp: new Date().toISOString() } : t
        );
        db.updateTeams(updatedTeams);

        const otherTeam = updatedTeams.find(t => t.mission_id === mission.id && t.team_name !== team.team_name);
        if (otherTeam?.report_submitted) {
            const allMissions = db.getMissions();
            const updatedMissions = allMissions.map(m => 
                m.id === mission.id ? { ...m, status: MissionStatus.EVALUATION } : m
            );
            db.updateMissions(updatedMissions);
        }
        
        setConfirmSubmitModalOpen(false);
        navigate(`/mission-results/${missionId}`);
    }, [mission, team, intelligenceData, navigate, missionId, teamName]);

    const handleSubmitReportRef = useRef(handleSubmitReport);
    useEffect(() => {
        handleSubmitReportRef.current = handleSubmitReport;
    }, [handleSubmitReport]);

    // Timer Countdown Effect
    useEffect(() => {
        if (!mission || !mission.mission_start_time || team?.report_submitted) {
            if(timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setTimeLeft(null);
            return;
        }

        const startTime = new Date(mission.mission_start_time).getTime();
        const duration = mission.time_limit_minutes * 60 * 1000;
        const endTime = startTime + duration;

        const updateTimer = () => {
            const now = Date.now();
            const remaining = endTime - now;

            if (remaining <= 0) {
                setTimeLeft(0);
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                if (isLeader && !team?.report_submitted) {
                    handleSubmitReportRef.current();
                }
            } else {
                setTimeLeft(remaining);
                const remainingSeconds = Math.ceil(remaining / 1000);
                if (lastPlayedAlarm.current !== remainingSeconds) {
                    if (remainingSeconds === 10 || (remainingSeconds <= 5 && remainingSeconds > 0)) {
                        playAlarm();
                        lastPlayedAlarm.current = remainingSeconds;
                    }
                }
            }
        };

        if(timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        updateTimer();
        timerIntervalRef.current = window.setInterval(updateTimer, 1000);

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [mission, team?.report_submitted, isLeader]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('war-room-user') || '{}');
        setCurrentUser(user);
        
        const foundMission = db.getMissions().find(m => m.id === missionId);
        const foundTeam = db.getTeams().find(t => t.mission_id === missionId && t.team_name === teamName);
        setMission(foundMission || null);
        setTeam(foundTeam || null);

        if (foundMission && teamName) {
            const finalReport = db.getReports().find(r => r.mission_id === missionId && r.team_name === teamName);
            if (finalReport) {
                setIntelligenceData(finalReport.battle_data);
            } else {
                const storageKey = `war_room_data_${missionId}_${teamName}`;
                const savedData = localStorage.getItem(storageKey);
                let data = initializeBattleData();
                if (savedData) {
                    try {
                        data = JSON.parse(savedData) as IntelligenceData;
                    } catch (e) {
                        console.error("Failed to parse saved data, initializing.", e);
                    }
                }
                data.companyName = foundMission.target_company;
                setIntelligenceData(data);
            }
        }
        
        if (user && foundTeam) {
            const userInTeam = foundTeam.members.find(m => m.email === user.email);
            const role = userInTeam?.battle_role || null;
            setUserRole(role);
            
            // Auto-navigate to assigned battle tab
            if (role) {
                const battleKey = ROLE_BATTLE_MAP[role];
                const battleIndex = Object.keys(BATTLE_CONFIGS).indexOf(battleKey);
                if (battleIndex !== -1) {
                    setActiveTab(`B${battleIndex + 1}`);
                }
            }
        }

        if (missionId && teamName) {
            const chatKey = `war_room_chat_${missionId}_${teamName}`;
            const savedChat = localStorage.getItem(chatKey);
            if (savedChat) setChatMessages(JSON.parse(savedChat));
        }

    }, [missionId, teamName]);

    // Handle data saving to localStorage
    useEffect(() => {
        if (team?.report_submitted || isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (saveDataTimeout.current) clearTimeout(saveDataTimeout.current);
        setSaveStatus('saving');
        
        saveDataTimeout.current = window.setTimeout(() => {
            const storageKey = `war_room_data_${missionId}_${teamName}`;
            localStorage.setItem(storageKey, JSON.stringify(intelligenceData));
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1500);

        return () => {
            if(saveDataTimeout.current) clearTimeout(saveDataTimeout.current);
        }
    }, [intelligenceData, missionId, teamName, team?.report_submitted]);

     // Handle chat auto-scrolling
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages, isChatOpen]);

    const handleInputChange = (path: string, value: any) => {
        setIntelligenceData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData));
            const keys = path.split('.');
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const addRow = (path: string, emptyRow: any) => {
        setIntelligenceData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData));
            const keys = path.split('.');
            let current = newData;
            for (let i = 0; i < keys.length; i++) {
                current = current[keys[i]];
            }
            if(Array.isArray(current)) {
                current.push({ ...emptyRow });
            }
            return newData;
        });
    };

    const removeRow = (path: string, index: number) => {
        setIntelligenceData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData));
            const keys = path.split('.');
            let current = newData;
            for (let i = 0; i < keys.length; i++) {
                current = current[keys[i]];
            }
            if(Array.isArray(current) && current.length > 0) {
                current.splice(index, 1);
            }
            return newData;
        });
    };

    const onAiAssist = (fieldPath: string, fieldLabel: string) => {
        setAiAssistQueue(prev => [...prev, {fieldPath, fieldLabel}]);
    }

    // Process AI Assist Queue
    useEffect(() => {
        const processQueue = async () => {
            if (aiAssistQueue.length > 0 && !isProcessingQueueRef.current) {
                isProcessingQueueRef.current = true;
                const { fieldPath, fieldLabel } = aiAssistQueue[0];
                
                setAiLoadingFields(prev => new Set(prev).add(fieldPath));

                const result = await fetchAiAssistedData(intelligenceData.companyName, fieldLabel);

                if (result) {
                    handleInputChange(fieldPath, result);
                }

                setAiLoadingFields(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(fieldPath);
                    return newSet;
                });
                
                setAiAssistQueue(prev => prev.slice(1));
                isProcessingQueueRef.current = false;
            }
        };
        processQueue();
    }, [aiAssistQueue, intelligenceData.companyName]);
    
    useEffect(() => {
        const newProgress: Record<string, number> = {};
        Object.keys(BATTLE_CONFIGS).forEach(battleKey => {
            const dataKey = battleKey as keyof IntelligenceData;
            if (typeof intelligenceData[dataKey] === 'object' && intelligenceData[dataKey] !== null) {
                newProgress[battleKey] = getCompletionPercentage(intelligenceData[dataKey]);
            }
        });
        setBattleProgress(newProgress);
    }, [intelligenceData]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;
        
        const message: ChatMessage = {
            id: `msg-${Date.now()}`,
            userId: currentUser.id,
            userDisplayName: currentUser.displayName,
            message: newMessage.trim(),
            timestamp: new Date().toISOString()
        };
        const updatedMessages = [...chatMessages, message];
        setChatMessages(updatedMessages);
        
        const chatKey = `war_room_chat_${missionId}_${teamName}`;
        localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
        
        setNewMessage('');
    };

    // Chat Mention Logic
    useEffect(() => {
        if (mentionQuery !== null) {
            const suggestions = team?.members.filter(m => 
                m.display_name.toLowerCase().startsWith(mentionQuery.toLowerCase()) && 
                m.email !== currentUser?.email
            ) || [];
            setMentionSuggestions(suggestions);
            setIsMentionBoxOpen(suggestions.length > 0);
        } else {
            setIsMentionBoxOpen(false);
        }
    }, [mentionQuery, team, currentUser]);

    const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewMessage(value);

        const mentionMatch = value.match(/@(\w*)$/);
        if (mentionMatch) {
            setMentionQuery(mentionMatch[1]);
        } else {
            setMentionQuery(null);
        }
    };

    const handleMentionSelect = (displayName: string) => {
        setNewMessage(prev => prev.replace(/@(\w*)$/, `@${displayName} `));
        setMentionQuery(null);
        chatInputRef.current?.focus();
    };

    const isBattleEditable = (battleKey: keyof Omit<IntelligenceData, 'companyName' | 'companyBrief'>): boolean => {
        if(team?.report_submitted) return false;
        if(isLeader) return true;
        if (!userRole) return false;
        return ROLE_BATTLE_MAP[userRole] === battleKey;
    };
    
    if (!currentUser || !mission || !team) {
        return <div className="p-6 text-center">Loading Mission...</div>;
    }
    
    const teamColorClass = teamName === 'alpha' ? 'text-team-alpha' : 'text-team-beta';

    return (
        <div className="flex h-screen bg-background text-primary-text">
            {/* Main War Room Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex-shrink-0 bg-panel border-b border-panel-border p-4 flex justify-between items-center z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-primary-text">Mission: <span className="text-accent">{mission.title}</span></h1>
                        <p className="text-sm text-gray-400">Target: <span className="font-medium text-primary-text">{mission.target_company}</span> | Team: <span className={`font-bold text-${teamColorClass}`}>{team.team_name.toUpperCase()}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`font-mono text-2xl font-bold ${getTimerColor(timeLeft)} flex items-center gap-2`}>
                           <Clock/> {formatTime(timeLeft)}
                        </div>
                        {isLeader && !team.report_submitted && (
                            <Button onClick={() => setConfirmSubmitModalOpen(true)}>Submit Final Report</Button>
                        )}
                        {team.report_submitted && <span className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-md text-sm font-semibold">Report Submitted</span>}
                    </div>
                </header>

                <div className="p-6 border-b border-panel-border">
                    <label htmlFor="companyBrief" className="block text-sm font-semibold text-gray-300 mb-2">Company Brief</label>
                    <textarea
                        id="companyBrief"
                        rows={3}
                        value={intelligenceData.companyBrief}
                        onChange={(e) => handleInputChange('companyBrief', e.target.value)}
                        disabled={team?.report_submitted}
                        className="w-full bg-secondary border border-panel-border rounded-md px-3 py-2 text-primary-text placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent disabled:bg-panel disabled:cursor-not-allowed"
                        placeholder="Provide a concise overview of the target company..."
                    />
                </div>
                
                <div className="flex-shrink-0 bg-secondary border-b border-panel-border flex items-center justify-between px-6">
                    <nav className="flex space-x-2">
                        {Object.entries(BATTLE_CONFIGS).map(([key, config], index) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(`B${index + 1}`)}
                                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors duration-200 ${
                                    activeTab === `B${index + 1}` ? `border-accent ${config.color}` : 'border-transparent text-gray-400 hover:text-primary-text'
                                }`}
                            >
                                {config.name.split(':')[0]}
                            </button>
                        ))}
                    </nav>
                     <div className="text-sm text-gray-400 flex items-center gap-2">
                        {saveStatus === 'saving' && <><Loader className="w-4 h-4 animate-spin"/><span>Saving...</span></>}
                        {saveStatus === 'saved' && <span>All changes saved.</span>}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <AnimatePresence mode="wait">
                    {activeTab === 'B1' && (
                        <motion.div key="b1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                           <SectionHeader progress={battleProgress['battle1_leadership'] || 0}>
                               {BATTLE_CONFIGS.battle1_leadership.name}
                           </SectionHeader>
                           <SubSection title="Founders">
                                <QuickTools companyName={intelligenceData.companyName} topic="founders"/>
                                <EditableTable data={intelligenceData.battle1_leadership.founders} columns={intelligenceData.battle1_leadership.founders.map((_, i) => `Founder ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle1_leadership')} path="battle1_leadership.founders" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'fullName', label: 'Full Name'}, {key: 'foundingYear', label: 'Founding Year'}, {key: 'currentRole', label: 'Current Role'}, {key: 'previousVentures', label: 'Previous Ventures'}, {key: 'contactEmail', label: 'Contact Email'}, {key: 'linkedinUrl', label: 'LinkedIn URL'}, {key: 'phoneNo', label: 'Phone No.'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'notes', label: 'Notes'} ]} />
                                {isBattleEditable('battle1_leadership') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle1_leadership.founders', emptyFounder)}><Plus className="w-4 h-4 mr-1"/>Add Founder</Button>}
                            </SubSection>
                           <SubSection title="Key Executives">
                                <QuickTools companyName={intelligenceData.companyName} topic="key executives"/>
                                <EditableTable data={intelligenceData.battle1_leadership.executives} columns={intelligenceData.battle1_leadership.executives.map((_, i) => `Executive ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle1_leadership')} path="battle1_leadership.executives" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'name', label: 'Name'}, {key: 'title', label: 'Title'}, {key: 'function', label: 'Function'}, {key: 'yearsWithFirm', label: 'Yrs w/ Firm'}, {key: 'contactEmail', label: 'Contact Email'}, {key: 'linkedinUrl', label: 'LinkedIn URL'}, {key: 'phoneNo', label: 'Phone No.'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'notes', label: 'Notes'} ]} />
                                {isBattleEditable('battle1_leadership') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle1_leadership.executives', emptyExecutive)}><Plus className="w-4 h-4 mr-1"/>Add Executive</Button>}
                            </SubSection>
                            <SubSection title="Market Share">
                                <QuickTools companyName={intelligenceData.companyName} topic="market size TAM SAM SOM"/>
                                <EditableForm data={intelligenceData.battle1_leadership.marketSize} onInputChange={handleInputChange} isEditable={isBattleEditable('battle1_leadership')} path="battle1_leadership.marketSize" aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} fields={[ { key: 'tam', label: 'TAM (USD)' }, { key: 'sam', label: 'SAM (USD)' }, { key: 'som', label: 'SOM (USD)' }, { key: 'annualGrowthRate', label: 'Annual Growth Rate %' }, { key: 'notes', label: 'Notes', fullWidth: true }, { key: 'sourceLink', label: 'Source Link', fullWidth: true } ]}/>
                            </SubSection>
                            <SubSection title="Competitive Position">
                                <QuickTools companyName={intelligenceData.companyName} topic="competitive position"/>
                                <EditableTable data={intelligenceData.battle1_leadership.competitivePosition} columns={intelligenceData.battle1_leadership.competitivePosition.map((c, i) => c.company || `Competitor ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle1_leadership')} path="battle1_leadership.competitivePosition" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'rank', label: 'Rank'}, {key: 'company', label: 'Company'}, {key: 'share', label: 'Share %'}, {key: 'differentiators', label: 'Differentiators'}, {key: 'benchmarks', label: 'Benchmarks'}, {key: 'sourceLink', label: 'Source Link'} ]}/>
                                {isBattleEditable('battle1_leadership') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle1_leadership.competitivePosition', emptyCompetitivePosition)}><Plus className="w-4 h-4 mr-1"/>Add Competitor</Button>}
                            </SubSection>
                            <SubSection title="Geographic Footprint">
                                <QuickTools companyName={intelligenceData.companyName} topic="geographic footprint offices"/>
                                <EditableTable data={intelligenceData.battle1_leadership.geographicFootprint} columns={intelligenceData.battle1_leadership.geographicFootprint.map((_, i) => `Office ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle1_leadership')} path="battle1_leadership.geographicFootprint" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'location', label: 'Location'}, {key: 'openedYear', label: 'Opened Year'}, {key: 'facilityType', label: 'Facility Type'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'notes', label: 'Notes'} ]}/>
                                {isBattleEditable('battle1_leadership') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle1_leadership.geographicFootprint', emptyGeographicFootprint)}><Plus className="w-4 h-4 mr-1"/>Add Office</Button>}
                            </SubSection>
                        </motion.div>
                    )}
                    {activeTab === 'B2' && (
                        <motion.div key="b2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                           <SectionHeader progress={battleProgress['battle2_products'] || 0}>
                               {BATTLE_CONFIGS.battle2_products.name}
                           </SectionHeader>
                           <SubSection title="Products / Services">
                                <QuickTools companyName={intelligenceData.companyName} topic="product lines"/>
                                <EditableTable data={intelligenceData.battle2_products.productLines} columns={intelligenceData.battle2_products.productLines.map((p, i) => p.productName || `Product ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle2_products')} path="battle2_products.productLines" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'productName', label: 'Product Name'}, {key: 'productType', label: 'Product Type'}, {key: 'launchDate', label: 'Launch Date'}, {key: 'category', label: 'Category'}, {key: 'targetSegment', label: 'Target Segment'}, {key: 'keyFeatures', label: 'Key Features'}, {key: 'pricingModel', label: 'Pricing Model'}, {key: 'price', label: 'Price'}, {key: 'reviewsScore', label: 'Reviews Score'}, {key: 'primaryCompetitors', label: 'Primary Competitors'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'notes', label: 'Notes'} ]}/>
                                {isBattleEditable('battle2_products') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle2_products.productLines', emptyProductLine)}><Plus className="w-4 h-4 mr-1"/>Add Product</Button>}
                           </SubSection>
                           <SubSection title="Pricing Changes">
                                <QuickTools companyName={intelligenceData.companyName} topic="pricing changes history"/>
                                <EditableTable data={intelligenceData.battle2_products.pricingChanges} columns={intelligenceData.battle2_products.pricingChanges.map((_, i) => `Change ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle2_products')} path="battle2_products.pricingChanges" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'date', label: 'Date'}, {key: 'oldPrice', label: 'Old Price'}, {key: 'newPrice', label: 'New Price'}, {key: 'reason', label: 'Reason'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'notes', label: 'Notes'} ]}/>
                                {isBattleEditable('battle2_products') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle2_products.pricingChanges', emptyPricingChange)}><Plus className="w-4 h-4 mr-1"/>Add Change</Button>}
                           </SubSection>
                           <SubSection title="Social Presence">
                                <QuickTools companyName={intelligenceData.companyName} topic="social media presence"/>
                                <EditableTable data={intelligenceData.battle2_products.platforms} columns={intelligenceData.battle2_products.platforms.map((p, i) => p.platformName || `Platform ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle2_products')} path="battle2_products.platforms" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'platformName', label: 'Platform Name'}, {key: 'pageLink', label: 'Page Link'}, {key: 'followers', label: 'Followers'}, {key: 'engagementRate', label: 'Engagement Rate %'}, {key: 'runningAds', label: 'No. of Running Ads'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'notes', label: 'Notes'} ]}/>
                                {isBattleEditable('battle2_products') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle2_products.platforms', emptyPlatform)}><Plus className="w-4 h-4 mr-1"/>Add Platform</Button>}
                           </SubSection>
                           <SubSection title="Influencer Partnerships">
                                <QuickTools companyName={intelligenceData.companyName} topic="influencer partnerships"/>
                                <EditableTable data={intelligenceData.battle2_products.influencerPartnerships} columns={intelligenceData.battle2_products.influencerPartnerships.map((p, i) => p.influencerName || `Influencer ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle2_products')} path="battle2_products.influencerPartnerships" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'influencerName', label: 'Influencer Name'}, {key: 'totalFollowers', label: 'Total Followers'}, {key: 'platforms', label: 'Platforms'}, {key: 'campaign', label: 'Campaign'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'notes', label: 'Notes'} ]}/>
                                {isBattleEditable('battle2_products') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle2_products.influencerPartnerships', emptyInfluencerPartnership)}><Plus className="w-4 h-4 mr-1"/>Add Influencer</Button>}
                           </SubSection>
                        </motion.div>
                    )}
                    {activeTab === 'B3' && (
                        <motion.div key="b3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                           <SectionHeader progress={battleProgress['battle3_funding'] || 0}>
                               {BATTLE_CONFIGS.battle3_funding.name}
                           </SectionHeader>
                            <SubSection title="Funding & Revenue">
                                <QuickTools companyName={intelligenceData.companyName} topic="investment funding"/>
                                <EditableForm data={intelligenceData.battle3_funding.getInvestment} onInputChange={handleInputChange} isEditable={isBattleEditable('battle3_funding')} path="battle3_funding.getInvestment" aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} fields={[ {key: 'yesNo', label: 'Get Investment (Yes/No)'}, {key: 'amount', label: 'Total Amount (USD)'}, {key: 'rounds', label: 'No. of Rounds'}, {key: 'sourceLink', label: 'Source Link'} ]}/>
                            </SubSection>
                            <SubSection title="Funding Rounds">
                                <QuickTools companyName={intelligenceData.companyName} topic="funding rounds"/>
                                <EditableTable data={intelligenceData.battle3_funding.fundingRounds} columns={intelligenceData.battle3_funding.fundingRounds.map((r, i) => r.series || `Round ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle3_funding')} path="battle3_funding.fundingRounds" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'date', label: 'Date'}, {key: 'series', label: 'Series'}, {key: 'amount', label: 'Amount (USD)'}, {key: 'numberOfInvestors', label: 'No. of Investors'}, {key: 'investors', label: 'Investors'}, {key: 'leadInvestor', label: 'Lead Investor'}, {key: 'notes', label: 'Notes'} ]}/>
                                {isBattleEditable('battle3_funding') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle3_funding.fundingRounds', emptyFundingRound)}><Plus className="w-4 h-4 mr-1"/>Add Round</Button>}
                            </SubSection>
                            <SubSection title="Investors 📌">
                                <QuickTools companyName={intelligenceData.companyName} topic="investors"/>
                                <EditableTable data={intelligenceData.battle3_funding.investors} columns={intelligenceData.battle3_funding.investors.map((inv, i) => inv.name || `Investor ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle3_funding')} path="battle3_funding.investors" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'name', label: 'Name'}, {key: 'type', label: 'Type (VC/PE/Angel)'}, {key: 'stake', label: 'Stake %'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'notes', label: 'Notes'} ]}/>
                                {isBattleEditable('battle3_funding') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle3_funding.investors', emptyInvestor)}><Plus className="w-4 h-4 mr-1"/>Add Investor</Button>}
                            </SubSection>
                             <SubSection title="Revenue & Valuation">
                                <QuickTools companyName={intelligenceData.companyName} topic="revenue and valuation"/>
                                <EditableForm data={intelligenceData.battle3_funding.revenueValuation} onInputChange={handleInputChange} isEditable={isBattleEditable('battle3_funding')} path="battle3_funding.revenueValuation" aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} fields={[ {key: 'revenue', label: 'Revenue (USD)'}, {key: 'growthRate', label: 'Growth rate'}, {key: 'latestValuation', label: 'Latest Valuation (USD)'}, {key: 'notes', label: 'Notes', fullWidth: true}, {key: 'sourceLink', label: 'Source Link', fullWidth: true} ]}/>
                            </SubSection>
                        </motion.div>
                    )}
                    {activeTab === 'B4' && (
                        <motion.div key="b4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                           <SectionHeader progress={battleProgress['battle4_customers'] || 0}>
                               {BATTLE_CONFIGS.battle4_customers.name}
                           </SectionHeader>
                            <SubSection title="Customer Segments">
                                <QuickTools companyName={intelligenceData.companyName} topic="B2C customer segments"/>
                                <EditableTable data={intelligenceData.battle4_customers.b2cSegments} columns={intelligenceData.battle4_customers.b2cSegments.map((_, i) => `Persona ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle4_customers')} path="battle4_customers.b2cSegments" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'age', label: 'Age'}, {key: 'income', label: 'Income'}, {key: 'educationalLevel', label: 'Educational Level'}, {key: 'interestsLifestyle', label: 'Interests & Lifestyle'}, {key: 'behavior', label: 'Behavior'}, {key: 'needsPainPoints', label: 'Needs/Pain Points'}, {key: 'location', label: 'Location'}, {key: 'revenueShare', label: 'Revenue Share (%)'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'notes', label: 'Notes'} ]}/>
                                {isBattleEditable('battle4_customers') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle4_customers.b2cSegments', emptyB2CSegment)}><Plus className="w-4 h-4 mr-1"/>Add Persona</Button>}
                            </SubSection>
                            <SubSection title="B2B Segments">
                                <QuickTools companyName={intelligenceData.companyName} topic="B2B customer segments"/>
                                <EditableTable data={intelligenceData.battle4_customers.b2bSegments} columns={intelligenceData.battle4_customers.b2bSegments.map((_, i) => `Segment ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle4_customers')} path="battle4_customers.b2bSegments" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'businessSize', label: 'Business Size'}, {key: 'industry', label: 'Industry'}, {key: 'revenueTargeted', label: 'Revenue of Targeted Co.'}, {key: 'technographic', label: 'Technographic'}, {key: 'behavior', label: 'Behavior'}, {key: 'needsPainPoints', label: 'Needs/Pain Points'}, {key: 'revenueShare', label: 'Revenue Share (%)'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'notes', label: 'Notes'} ]}/>
                                {isBattleEditable('battle4_customers') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle4_customers.b2bSegments', emptyB2BSegment)}><Plus className="w-4 h-4 mr-1"/>Add Segment</Button>}
                            </SubSection>
                            <SubSection title="Reviews (overview)">
                                <QuickTools companyName={intelligenceData.companyName} topic="customer reviews"/>
                                <EditableForm data={intelligenceData.battle4_customers.reviews} onInputChange={handleInputChange} isEditable={isBattleEditable('battle4_customers')} path="battle4_customers.reviews" aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} fields={[ {key: 'avgRating', label: 'Avg Rating'}, {key: 'positive', label: 'Positive %'}, {key: 'negative', label: 'Negative %'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'commonThemes', label: 'Common Themes', fullWidth: true} ]}/>
                            </SubSection>
                            <SubSection title="Pain Points">
                                <QuickTools companyName={intelligenceData.companyName} topic="customer pain points"/>
                                <EditableTable data={intelligenceData.battle4_customers.painPoints} columns={intelligenceData.battle4_customers.painPoints.map((_, i) => `Pain Point ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle4_customers')} path="battle4_customers.painPoints" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'description', label: 'Description'}, {key: 'impact', label: 'Impact'}, {key: 'frequency', label: 'Frequency'}, {key: 'suggestedFix', label: 'Suggested Fix'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'notes', label: 'Notes'} ]}/>
                                {isBattleEditable('battle4_customers') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle4_customers.painPoints', emptyPainPoint)}><Plus className="w-4 h-4 mr-1"/>Add Pain Point</Button>}
                            </SubSection>
                        </motion.div>
                    )}
                    {activeTab === 'B5' && (
                        <motion.div key="b5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                           <SectionHeader progress={battleProgress['battle5_alliances'] || 0}>
                               {BATTLE_CONFIGS.battle5_alliances.name}
                           </SectionHeader>
                            <SubSection title="Partnerships / Supply Chain / Growth Trajectory">
                                <QuickTools companyName={intelligenceData.companyName} topic="strategic partners"/>
                                <EditableTable data={intelligenceData.battle5_alliances.strategicPartners} columns={intelligenceData.battle5_alliances.strategicPartners.map((p, i) => p.name || `Partner ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle5_alliances')} path="battle5_alliances.strategicPartners" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'name', label: 'Name'}, {key: 'type', label: 'Type'}, {key: 'region', label: 'Region'}, {key: 'startDate', label: 'Start Date'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'notes', label: 'Notes'} ]}/>
                                {isBattleEditable('battle5_alliances') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle5_alliances.strategicPartners', emptyStrategicPartner)}><Plus className="w-4 h-4 mr-1"/>Add Partner</Button>}
                            </SubSection>
                            <SubSection title="Key Suppliers">
                                <QuickTools companyName={intelligenceData.companyName} topic="key suppliers"/>
                                <EditableTable data={intelligenceData.battle5_alliances.keySuppliers} columns={intelligenceData.battle5_alliances.keySuppliers.map((s, i) => s.name || `Supplier ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle5_alliances')} path="battle5_alliances.keySuppliers" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'name', label: 'Name'}, {key: 'commodity', label: 'Commodity'}, {key: 'region', label: 'Region'}, {key: 'contractValue', label: 'Contract Value'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'notes', label: 'Notes'} ]}/>
                                {isBattleEditable('battle5_alliances') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle5_alliances.keySuppliers', emptyKeySupplier)}><Plus className="w-4 h-4 mr-1"/>Add Supplier</Button>}
                            </SubSection>
                            <SubSection title="Growth Rates (for the Past Year)">
                                <QuickTools companyName={intelligenceData.companyName} topic="growth rates"/>
                                <EditableForm data={intelligenceData.battle5_alliances.growthRates} onInputChange={handleInputChange} isEditable={isBattleEditable('battle5_alliances')} path="battle5_alliances.growthRates" aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} fields={[ {key: 'period', label: 'Period'}, {key: 'revenueGrowth', label: 'Revenue Growth %'}, {key: 'userGrowth', label: 'User Growth %'}, {key: 'sourceLink', label: 'Source Link', fullWidth: true} ]}/>
                            </SubSection>
                            <SubSection title="Expansions (Projections)">
                                <QuickTools companyName={intelligenceData.companyName} topic="expansion plans"/>
                                <EditableTable data={intelligenceData.battle5_alliances.expansions} columns={intelligenceData.battle5_alliances.expansions.map((_, i) => `Expansion ${i+1}`)} onInputChange={handleInputChange} isEditable={isBattleEditable('battle5_alliances')} path="battle5_alliances.expansions" onRemoveRow={removeRow} aiLoadingFields={aiLoadingFields} onAiAssist={onAiAssist} rows={[ {key: 'type', label: 'Type (Geo/Product)'}, {key: 'regionMarket', label: 'Region/Market'}, {key: 'date', label: 'Date'}, {key: 'investment', label: 'Investment'}, {key: 'sourceLink', label: 'Source Link'}, {key: 'notes', label: 'Notes'} ]}/>
                                {isBattleEditable('battle5_alliances') && <Button size="sm" variant="outline" className="mt-2" onClick={() => addRow('battle5_alliances.expansions', emptyExpansion)}><Plus className="w-4 h-4 mr-1"/>Add Expansion</Button>}
                            </SubSection>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Sidebar */}
             <aside className={`transition-all duration-300 ease-in-out bg-panel border-l border-panel-border flex flex-col ${isChatOpen ? 'w-80' : 'w-20'}`}>
                <div className="p-2 border-b border-panel-border flex flex-col items-center">
                    <h3 className={`text-xs uppercase font-semibold text-gray-400 mb-2 ${!isChatOpen ? 'transform -rotate-90' : ''}`}>{isChatOpen ? 'Team Intel' : 'Team'}</h3>
                    <div className={`flex ${isChatOpen ? 'flex-row gap-2' : 'flex-col gap-3'}`}>
                    {team.members.map(member => {
                        const battleConfig = member.battle_role ? BATTLE_CONFIGS[ROLE_BATTLE_MAP[member.battle_role]] : null;
                        const IconComponent = battleConfig?.icon;
                        return (
                        <div key={member.email} className="relative group" title={member.display_name}>
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`} alt="avatar" className="w-10 h-10 rounded-full"/>
                           {IconComponent && <IconComponent className={`absolute -bottom-1 -right-1 w-5 h-5 p-1 rounded-full bg-secondary ${battleConfig?.color}`} />}
                        </div>
                    )})}
                    </div>
                </div>
                <div className="flex-grow flex flex-col">
                    <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-full p-2 text-center text-gray-400 hover:bg-secondary border-b border-panel-border text-xs flex items-center justify-center gap-1">
                        <MessageCircleIcon className="w-4 h-4" /> {isChatOpen && 'Team Chat'}
                    </button>
                    <AnimatePresence>
                    {isChatOpen && (
                        <motion.div initial={{ opacity: 0}} animate={{ opacity: 1}} exit={{opacity: 0}} className="flex-grow flex flex-col overflow-hidden">
                            <div ref={chatContainerRef} className="flex-grow p-3 space-y-3 overflow-y-auto">
                                {chatMessages.map(msg => (
                                    <div key={msg.id} className={`flex items-start gap-2 ${msg.userId === currentUser.id ? 'flex-row-reverse' : ''}`}>
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.userId}`} alt="avatar" className="w-6 h-6 rounded-full"/>
                                        <div className={`px-3 py-2 rounded-lg max-w-xs text-sm ${msg.userId === currentUser.id ? 'bg-accent text-background' : 'bg-secondary'}`}>
                                            <div className="font-bold text-xs mb-0.5">{msg.userDisplayName}</div>
                                            <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                            <div className="text-right text-xs opacity-70 mt-1">{formatRelativeTime(msg.timestamp)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 border-t border-panel-border relative">
                                {isMentionBoxOpen && (
                                    <motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} className="absolute bottom-full left-3 right-3 bg-panel border border-panel-border rounded-t-lg shadow-lg max-h-40 overflow-y-auto">
                                        {mentionSuggestions.map(s => (
                                            <button key={s.email} onClick={() => handleMentionSelect(s.display_name)} className="w-full text-left px-3 py-2 hover:bg-secondary flex items-center gap-2">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.email}`} alt="avatar" className="w-6 h-6 rounded-full"/>
                                                {s.display_name}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                                <form onSubmit={handleSendMessage} className="relative">
                                    <Input ref={chatInputRef} value={newMessage} onChange={handleNewMessageChange} placeholder="Type message..." className="pr-10 !bg-background !border-panel-border" />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-accent"><Send className="w-5 h-5"/></button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
             </aside>

            <Modal isOpen={isConfirmSubmitModalOpen} onClose={() => setConfirmSubmitModalOpen(false)} title="Confirm Submission">
                <p className="text-gray-300 mb-6">Are you sure you want to submit your team's final intelligence report? This action is irreversible.</p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setConfirmSubmitModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmitReport}>Confirm & Submit</Button>
                </div>
            </Modal>
        </div>
    );
}

export default WarRoomScreen;