import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, animate } from 'framer-motion';
import Card from '../ui/Card.tsx';
import Button from '../ui/Button.tsx';
import { Mission, Team, MissionStatus, User, AIScoreResult, BattleWinner, Report } from '../../types.ts';
import { db } from '../../lib/db.ts';
import { scoreReports } from '../../services/geminiService.ts';
import { Award, BarChart3, Zap, Loader, FileText, Code } from '../icons.tsx';
import { BATTLE_CONFIGS } from '../../constants.ts';

type TeamStatus = 'pending' | 'submitted' | 'scoring' | 'scored';
type Tab = 'overview' | 'battles' | 'verdict' | 'reports';

const AnimatedCounter: React.FC<{ to: number; className?: string }> = ({ to, className }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(0, to, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate(value) {
                node.textContent = String(Math.round(value));
            }
        });
        return () => controls.stop();
    }, [to]);

    return <span ref={nodeRef} className={className} />;
};

const ComparisonBar: React.FC<{
    label: string;
    valueA: number;
    valueB: number;
    max: number;
}> = ({ label, valueA, valueB, max }) => {
    const percentA = (valueA / max) * 100;
    const percentB = (valueB / max) * 100;

    return (
        <div>
            <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-semibold text-team-alpha">{valueA.toFixed(0)}</span>
                <span className="text-gray-300">{label}</span>
                <span className="font-semibold text-team-beta">{valueB.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-1 w-full">
                <div className="w-full bg-secondary rounded-full h-2.5" dir="rtl">
                    <motion.div
                        className="bg-team-alpha h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentA}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                    <motion.div
                        className="bg-team-beta h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentB}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </div>
            </div>
        </div>
    );
};


const ResultsScreen: React.FC = () => {
    const { missionId } = useParams<{ missionId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("Accessing Mission Archives...");
    const [error, setError] = useState<string | null>(null);
    const [mission, setMission] = useState<Mission | null>(null);
    const [winner, setWinner] = useState<'alpha' | 'beta' | 'tie' | null>(null);
    
    const [alphaScore, setAlphaScore] = useState<AIScoreResult['team_alpha_score'] | null>(null);
    const [betaScore, setBetaScore] = useState<AIScoreResult['team_beta_score'] | null>(null);
    const [alphaStatus, setAlphaStatus] = useState<TeamStatus>('pending');
    const [betaStatus, setBetaStatus] = useState<TeamStatus>('pending');
    const [reports, setReports] = useState<{ alpha: Report | null, beta: Report | null }>({ alpha: null, beta: null });

    const [aiReasoning, setAiReasoning] = useState('');
    const [battleWinners, setBattleWinners] = useState<BattleWinner[]>([]);
    const [pollTrigger, setPollTrigger] = useState(0);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const isScoringRef = useRef(false);

    useEffect(() => {
        const userJson = localStorage.getItem('war-room-user');
        if (userJson) setCurrentUser(JSON.parse(userJson));
    }, []);

    const setScoresFromDetails = useCallback((details: AIScoreResult) => {
        setAiReasoning(details.winning_team_reasoning);
        setBattleWinners(details.battle_winners || []);
        
        setAlphaScore(details.team_alpha_score);
        setBetaScore(details.team_beta_score);
        setAlphaStatus('scored');
        setBetaStatus('scored');

        const alphaTotal = Object.values(details.team_alpha_score).filter((v): v is number => typeof v === 'number').reduce((s, v) => s + v, 0);
        const betaTotal = Object.values(details.team_beta_score).filter((v): v is number => typeof v === 'number').reduce((s, v) => s + v, 0);
        
        let missionWinner: 'alpha' | 'beta' | 'tie' = 'tie';
        if (alphaTotal > betaTotal) missionWinner = 'alpha';
        if (betaTotal > alphaTotal) missionWinner = 'beta';
        
        setTimeout(() => setWinner(missionWinner), 1600); // Delay winner reveal for animation
    }, []);

    const processResults = useCallback(async () => {
        if (!missionId) { setError("Mission ID not found."); setLoading(false); return; }
        const missionData = db.getMissions().find(m => m.id === missionId);
        if (!missionData) { setError("Mission not found."); setLoading(false); return; }
        setMission(missionData);

        const allTeams = db.getTeams();
        const teamAlpha = allTeams.find(t => t.mission_id === missionId && t.team_name === 'alpha');
        const teamBeta = allTeams.find(t => t.mission_id === missionId && t.team_name === 'beta');

        const allReports = db.getReports();
        const reportAlpha = allReports.find(r => r.mission_id === missionId && r.team_name === 'alpha');
        const reportBeta = allReports.find(r => r.mission_id === missionId && r.team_name === 'beta');
        setReports({ alpha: reportAlpha || null, beta: reportBeta || null });
        
        if (missionData.score_details && teamAlpha && teamBeta) {
            setLoadingMessage("Loading finalized scores...");
            setScoresFromDetails(missionData.score_details);
            setLoading(false);
            return;
        }
        
        if (!reportAlpha || !reportBeta) {
            setLoading(false);
            setAlphaStatus(reportAlpha ? 'submitted' : 'pending');
            setBetaStatus(reportBeta ? 'submitted' : 'pending');
            const waitingFor = !reportAlpha && !reportBeta ? "teams to submit reports" : reportAlpha ? "Team Beta" : "Team Alpha";
            setLoadingMessage(`Awaiting ${waitingFor}...`);
            setTimeout(() => setPollTrigger(p => p + 1), 5000);
            return;
        }

        if (reportAlpha && reportBeta && teamAlpha && teamBeta && !isScoringRef.current) {
            isScoringRef.current = true;
            setLoading(true);
            setLoadingMessage("AI Analyst is comparing reports...");
            setAlphaStatus('scoring');
            setBetaStatus('scoring');
            
            if (!missionData.mission_start_time || !teamAlpha.submission_timestamp || !teamBeta.submission_timestamp) {
                setError("Mission or team submission timestamps are missing."); setLoading(false); isScoringRef.current = false; return;
            }

            const finalScores = await scoreReports(missionData.target_company, reportAlpha.battle_data, reportBeta.battle_data, missionData, teamAlpha, teamBeta);

            if (!finalScores) {
                setError("AI final comparison failed."); setLoading(false); isScoringRef.current = false; return;
            }
            
            setScoresFromDetails(finalScores);
            
            if (missionData.status !== MissionStatus.COMPLETED) {
                const alphaTotal = Math.round(Object.values(finalScores.team_alpha_score).filter((v): v is number => typeof v === 'number').reduce((s, v) => s + v, 0));
                const betaTotal = Math.round(Object.values(finalScores.team_beta_score).filter((v): v is number => typeof v === 'number').reduce((s, v) => s + v, 0));
                let finalWinner: 'alpha' | 'beta' | 'tie' = 'tie';
                if (alphaTotal > betaTotal) finalWinner = 'alpha';
                if (betaTotal > alphaTotal) finalWinner = 'beta';

                db.updateMissions(db.getMissions().map(m => m.id === missionId ? { ...m, status: MissionStatus.COMPLETED, winner_team: finalWinner, team_alpha_score: alphaTotal, team_beta_score: betaTotal, score_details: finalScores } : m));
                
                const winningTeamEmails = finalWinner !== 'tie' ? (finalWinner === 'alpha' ? teamAlpha.members : teamBeta.members).map(m => m.email) : [];
                const allParticipantEmails = new Set([...teamAlpha.members.map(m => m.email), ...teamBeta.members.map(m => m.email)]);

                const usersInDb = db.getUsers();
                usersInDb.forEach(user => {
                    if (allParticipantEmails.has(user.email)) {
                        const updatedUser = { ...user, total_missions: (user.total_missions || 0) + 1, missions_won: (user.missions_won || 0) + (winningTeamEmails.includes(user.email) ? 1 : 0) };
                        db.updateUser(updatedUser);
                        if (currentUser && currentUser.id === updatedUser.id) localStorage.setItem('war-room-user', JSON.stringify(updatedUser));
                    }
                });
            }
            setLoading(false);
        }

    }, [missionId, pollTrigger, currentUser, setScoresFromDetails]);

    useEffect(() => {
        processResults();
    }, [processResults]);

    const alphaTotal = alphaScore ? Math.round(Object.values(alphaScore).filter((v): v is number => typeof v === 'number').reduce((s, v) => s + v, 0)) : 0;
    const betaTotal = betaScore ? Math.round(Object.values(betaScore).filter((v): v is number => typeof v === 'number').reduce((s, v) => s + v, 0)) : 0;

    const TABS: { id: Tab, label: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
        { id: 'overview', label: 'Score Breakdown', icon: BarChart3 },
        { id: 'battles', label: 'Battlefield Analysis', icon: Zap },
        { id: 'verdict', label: 'AI Verdict', icon: FileText },
        { id: 'reports', label: 'View Reports', icon: Code },
    ];

    if (loading || (!alphaScore && !error)) return (
        <div className="flex flex-col gap-4 justify-center items-center h-full">
            <Loader className="w-16 h-16 text-accent animate-spin" />
            <p className="text-xl font-semibold text-gray-300">{loadingMessage}</p>
        </div>
    );
    if (error) return <div className="p-6 text-center text-red-400">{error}</div>;

    return (
        <div className="p-8 min-h-screen">
            <motion.header initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                <div className="inline-block bg-accent/10 p-4 rounded-full mb-4"><Award className="w-12 h-12 text-accent" /></div>
                <h1 className="text-4xl font-bold">Mission Debriefing</h1>
                <p className="text-gray-400">Target: <span className="font-medium text-accent">{mission?.target_company}</span></p>
            </motion.header>
            
            <Card className="max-w-5xl mx-auto bg-panel/80 border-panel-border backdrop-blur-sm">
                <div className="p-8">
                    <div className="grid grid-cols-3 items-center text-center mb-8">
                        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1, transition: { delay: 0.5 } }} className={`p-4 rounded-lg ${winner === 'alpha' ? 'bg-secondary' : ''}`}>
                            <h2 className="text-3xl font-bold text-team-alpha">Team Alpha</h2>
                            <AnimatePresence>
                                {winner === 'alpha' && <motion.p initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} className="text-lg font-bold text-accent tracking-widest">WINNER</motion.p>}
                            </AnimatePresence>
                        </motion.div>

                        <div className="font-mono flex items-baseline justify-center gap-4">
                            <AnimatedCounter to={alphaTotal} className="text-7xl font-bold text-team-alpha" />
                            <span className="text-4xl text-gray-500">:</span>
                            <AnimatedCounter to={betaTotal} className="text-7xl font-bold text-team-beta" />
                        </div>

                        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1, transition: { delay: 0.5 } }} className={`p-4 rounded-lg ${winner === 'beta' ? 'bg-secondary' : ''}`}>
                             <h2 className="text-3xl font-bold text-team-beta">Team Beta</h2>
                            <AnimatePresence>
                                {winner === 'beta' && <motion.p initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} className="text-lg font-bold text-accent tracking-widest">WINNER</motion.p>}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    <div className="border-b border-panel-border flex justify-center mb-6">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative px-4 py-3 text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab === tab.id ? 'text-accent' : 'text-gray-400 hover:text-primary-text'}`}>
                                <tab.icon className="w-4 h-4" /> {tab.label}
                                {activeTab === tab.id && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" layoutId="underline" />}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                            {activeTab === 'overview' && alphaScore && betaScore && (
                                <div className="space-y-6 mt-4">
                                    <ComparisonBar label="Accuracy & Insight" valueA={alphaScore.accuracy_score} valueB={betaScore.accuracy_score} max={60} />
                                    <ComparisonBar label="Sources" valueA={alphaScore.sources_score} valueB={betaScore.sources_score} max={15} />
                                    <ComparisonBar label="Presentation" valueA={alphaScore.presentation_score} valueB={betaScore.presentation_score} max={15} />
                                    <ComparisonBar label="Speed" valueA={alphaScore.speed_score} valueB={betaScore.speed_score} max={10} />
                                </div>
                            )}
                            {activeTab === 'battles' && (
                                <div className="space-y-3 mt-4">
                                    {battleWinners.map(bw => {
                                        const config = BATTLE_CONFIGS[bw.battle as keyof typeof BATTLE_CONFIGS];
                                        return (
                                            <div key={bw.battle} className="bg-secondary p-3 rounded-lg flex items-center gap-4">
                                                <config.icon className={`w-6 h-6 flex-shrink-0 ${config.color}`} />
                                                <div className="flex-grow"><h4 className="font-semibold">{config.name.split(':')[1]}</h4><p className="text-xs text-gray-400 italic">"{bw.reasoning}"</p></div>
                                                <div className={`text-right flex-shrink-0 w-28 font-bold text-sm ${bw.winner === 'alpha' ? 'text-team-alpha' : bw.winner === 'beta' ? 'text-team-beta' : 'text-gray-400'}`}>Team {bw.winner.toUpperCase()}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                             {activeTab === 'verdict' && (
                                <div className="mt-4 space-y-6">
                                    <div>
                                        <h4 className="font-bold text-accent text-lg mb-2">Final Verdict</h4>
                                        <p className="text-gray-300 leading-relaxed">{aiReasoning}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-secondary p-4 rounded-lg">
                                            <h5 className="font-semibold text-team-alpha mb-1">Team Alpha Analysis</h5>
                                            <p className="text-sm text-gray-400 italic">"{alphaScore?.reasoning}"</p>
                                        </div>
                                         <div className="bg-secondary p-4 rounded-lg">
                                            <h5 className="font-semibold text-team-beta mb-1">Team Beta Analysis</h5>
                                            <p className="text-sm text-gray-400 italic">"{betaScore?.reasoning}"</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'reports' && (
                                <div className="mt-4 grid grid-cols-2 gap-4 h-[400px]">
                                    <div className="bg-secondary rounded-lg p-2 flex flex-col">
                                        <h4 className="font-bold text-team-alpha p-2">Team Alpha Report</h4>
                                        <pre className="text-xs overflow-auto flex-grow bg-background rounded p-2 font-mono">{JSON.stringify(reports.alpha?.battle_data, null, 2)}</pre>
                                    </div>
                                    <div className="bg-secondary rounded-lg p-2 flex flex-col">
                                        <h4 className="font-bold text-team-beta p-2">Team Beta Report</h4>
                                        <pre className="text-xs overflow-auto flex-grow bg-background rounded p-2 font-mono">{JSON.stringify(reports.beta?.battle_data, null, 2)}</pre>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </Card>

            <div className="text-center mt-12">
                <Button onClick={() => navigate('/dashboard')} variant="primary" size="lg">Return to Dashboard</Button>
            </div>
        </div>
    );
};

export default ResultsScreen;