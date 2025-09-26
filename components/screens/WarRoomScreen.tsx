import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IntelligenceData, User, Team, Mission, BattleRole, ChatMessage } from '../../types.ts';
import { BATTLE_CONFIGS, initializeBattleData, MagicWandIcon, Send, ROLE_BATTLE_MAP, ChatBubble } from '../../constants.tsx';
import Input from '../ui/Input.tsx';
import Button from '../ui/Button.tsx';
import Modal from '../ui/Modal.tsx';
import { fetchAiAssistedData } from '../../services/geminiService.ts';
import Card from '../ui/Card.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../db.ts';


const WarRoomScreen: React.FC = () => {
    const { missionId, teamName } = useParams();
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [team, setTeam] = useState<Team | null>(null);
    const [mission, setMission] = useState<Mission | null>(null);
    const [userRole, setUserRole] = useState<BattleRole | null>(null);
    
    const [timeLeft, setTimeLeft] = useState(0);
    const [intelligenceData, setIntelligenceData] = useState<IntelligenceData>(initializeBattleData());
    const [isAiModalOpen, setAiModalOpen] = useState(false);
    const [aiAssistField, setAiAssistField] = useState<{ fieldName: string } | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [hasUsedAiAssist, setHasUsedAiAssist] = useState(false);

    // Chat state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('war-room-user') || '{}');
        setCurrentUser(user);
        
        const foundMission = db.getMissions().find(m => m.id === missionId);
        const foundTeam = db.getTeams().find(t => t.mission_id === missionId && t.team_name === teamName);
        setMission(foundMission || null);
        setTeam(foundTeam || null);

        if (foundTeam && user) {
            const member = foundTeam.members.find(m => m.email === user.email);
            setUserRole(member?.battle_role || null);
        }

        if (foundMission && foundMission.mission_start_time) {
            const startTime = new Date(foundMission.mission_start_time);
            const totalDuration = foundMission.time_limit_minutes * 60;
            const elapsed = (Date.now() - startTime.getTime()) / 1000;
            setTimeLeft(Math.max(0, totalDuration - elapsed));
        }

        // Load chat messages
        if (missionId && teamName) {
            const key = `chat_${missionId}_${teamName}`;
            const storedMessages = localStorage.getItem(key);
            if (storedMessages) {
                setChatMessages(JSON.parse(storedMessages));
            }
        }

    }, [missionId, teamName]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        if (isChatOpen && chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages, isChatOpen]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !missionId || !teamName) return;

        const message: ChatMessage = {
            id: Date.now().toString(),
            userId: currentUser.id,
            userDisplayName: currentUser.displayName,
            message: newMessage,
            timestamp: new Date().toISOString(),
        };

        const updatedMessages = [...chatMessages, message];
        setChatMessages(updatedMessages);
        localStorage.setItem(`chat_${missionId}_${teamName}`, JSON.stringify(updatedMessages));
        setNewMessage('');
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleInputChange = (path: string, value: string) => {
        const keys = path.split('.');
        setIntelligenceData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            let current: any = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

     const handleAiAssistClick = (fieldName: string) => {
        setAiAssistField({ fieldName });
        setAiModalOpen(true);
    };

    const confirmAiAssist = async () => {
        if (!aiAssistField || !mission) return;
        setIsAiLoading(true);
        setAiModalOpen(false);

        const result = await fetchAiAssistedData(mission.target_company, aiAssistField.fieldName);
        
        alert(`AI Suggestion for ${aiAssistField.fieldName}: ${result}`);
        
        setHasUsedAiAssist(true);
        setIsAiLoading(false);
        setAiAssistField(null);
    };
    
    const canEditBattle = (battleKey: keyof IntelligenceData) => {
        if (!userRole) return false;
        return ROLE_BATTLE_MAP[userRole] === battleKey;
    };

    const renderField = (label: string, path: string, type: string = 'text', isEditable: boolean) => (
         <div className="relative">
            <Input
                label={label}
                type={type}
                value={(path.split('.').reduce((o: any, i) => o?.[i], intelligenceData) as string) || ''}
                onChange={(e) => handleInputChange(path, e.target.value)}
                disabled={!isEditable || isAiLoading}
            />
             {isEditable && !hasUsedAiAssist && (
                <button 
                    onClick={() => handleAiAssistClick(label)} 
                    className="absolute top-7 right-0 px-3 flex items-center text-gray-400 hover:text-accent disabled:opacity-50"
                    disabled={isAiLoading}
                    title="Use one-time AI Assist"
                >
                    <MagicWandIcon className="w-5 h-5" />
                </button>
            )}
        </div>
    );

    const isLeader = currentUser?.email === team?.team_leader_email;

    return (
        <div className="min-h-screen bg-background text-primary-text flex flex-col">
            <header className="sticky top-0 z-40 bg-panel/80 backdrop-blur-sm border-b border-panel-border p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">War Room - Team {team?.team_name.toUpperCase()}</h1>
                        <p className="text-gray-400">Target: <span className="text-accent">{mission?.target_company}</span></p>
                    </div>
                    <div className={`text-5xl font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-accent'}`}>{formatTime(timeLeft)}</div>
                    <div>
                        {isLeader && <Button onClick={() => navigate(`/mission-results/${missionId}`)}><Send className="w-4 h-4 mr-2"/>Submit Intelligence</Button>}
                    </div>
                </div>
            </header>
            
            <main className="flex-grow w-full max-w-4xl mx-auto p-6">
                {Object.entries(BATTLE_CONFIGS).map(([key, config]) => {
                    const battleKey = key as keyof IntelligenceData;
                    const isEditable = canEditBattle(battleKey);
                    return (
                        <div key={battleKey} id={battleKey} className="mb-8">
                        <Card className={`bg-panel border ${isEditable ? 'border-accent shadow-accent/20' : 'border-panel-border'}`}>
                             <div className="p-6">
                                <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${config.color}`}>
                                    <config.icon className="w-6 h-6"/> {config.name} {isEditable && <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">YOUR BATTLE</span>}
                                </h2>
                                
                                {battleKey === 'battle1_leadership' && (
                                <div className="space-y-6">
                                    {renderField("Founder Name", "battle1_leadership.founders.0.fullName", 'text', isEditable)}
                                    {renderField("Market Size (TAM)", "battle1_leadership.marketSize.tam", 'text', isEditable)}
                                </div>
                                )}
                                {battleKey === 'battle2_products' && (
                                <div className="space-y-6">
                                    {renderField("Product Name", "battle2_products.productLines.0.productName", 'text', isEditable)}
                                    {renderField("Pricing Model", "battle2_products.productLines.0.pricingModel", 'text', isEditable)}
                                </div>
                                )}
                                 {battleKey === 'battle3_funding' && (
                                <div className="space-y-6">
                                    {renderField("Total Funding", "battle3_funding.getInvestment.amount", 'text', isEditable)}
                                    {renderField("Latest Valuation", "battle3_funding.revenueValuation.latestValuation", 'text', isEditable)}
                                </div>
                                )}
                                {battleKey === 'battle4_customers' && (
                                <div className="space-y-6">
                                    {renderField("B2C Age Segment", "battle4_customers.b2cSegments.0.age", 'text', isEditable)}
                                    {renderField("Avg. Review Rating", "battle4_customers.reviews.avgRating", 'text', isEditable)}
                                </div>
                                )}
                                {battleKey === 'battle5_alliances' && (
                                <div className="space-y-6">
                                    {renderField("Strategic Partner Name", "battle5_alliances.strategicPartners.0.name", 'text', isEditable)}
                                    {renderField("Revenue Growth %", "battle5_alliances.growthRates.revenueGrowth", 'text', isEditable)}
                                </div>
                                )}
                             </div>
                        </Card>
                        </div>
                    );
                })}
            </main>
            
            <div className="fixed bottom-6 right-6 z-50">
                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className="w-80 h-96 bg-panel border border-panel-border rounded-lg shadow-2xl flex flex-col mb-4"
                        >
                            <header className="p-3 border-b border-panel-border flex justify-between items-center">
                                <h3 className="font-bold text-accent">Team Chat</h3>
                                <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                            </header>
                            <div ref={chatContainerRef} className="flex-1 p-3 space-y-3 overflow-y-auto">
                                {chatMessages.map(msg => (
                                    <div key={msg.id} className={`flex flex-col ${msg.userId === currentUser?.id ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[80%] p-2 rounded-lg ${msg.userId === currentUser?.id ? 'bg-accent text-background' : 'bg-secondary'}`}>
                                            <p className="text-xs font-bold mb-1 opacity-80">{msg.userDisplayName}</p>
                                            <p className="text-sm break-words">{msg.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSendMessage} className="p-3 border-t border-panel-border flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1"
                                    autoComplete="off"
                                />
                                <Button type="submit" size="icon" disabled={!newMessage.trim()}><Send className="w-4 h-4"/></Button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
                <Button
                    onClick={() => setIsChatOpen(prev => !prev)}
                    className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center"
                    aria-label="Toggle Chat"
                >
                    <ChatBubble className="w-8 h-8"/>
                </Button>
            </div>

             <Modal isOpen={isAiModalOpen} onClose={() => setAiModalOpen(false)} title="AI Assist">
                <p>Use your one-time AI assist to get data for "{aiAssistField?.fieldName}"?</p>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={() => setAiModalOpen(false)}>Cancel</Button>
                    <Button onClick={confirmAiAssist}>Confirm</Button>
                </div>
            </Modal>
        </div>
    );
};

export default WarRoomScreen;