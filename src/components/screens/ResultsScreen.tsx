import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Mission, Team, MissionStatus, User, AIScoreResult, BattleWinner } from '../../types';
import { db } from '../../lib/db';
import { scoreReports } from '../../services/geminiService';
import { Award, Trophy, BarChart3, Zap, Clock, Loader, FileText } from '../icons';
import { BATTLE_CONFIGS } from '../../constants';

interface ScoreBreakdown {
    accuracy: number;
    sources: number;
    presentation: number;
    speed: number;
}

interface TeamScore {
    total: number;
    breakdown: ScoreBreakdown;
    reasoning: string;
    timeTaken: number; // in seconds
}

type TeamStatus = 'pending' | 'submitted' | 'scoring' | 'scored';

const ScoreBar = ({ value, maxValue, colorClass }: { value: number, maxValue: number, colorClass: string}) => {
    const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));
    return (
        <div className="w-full bg-secondary rounded-full h-4 relative overflow-hidden">
            <motion.div 
                className={`${colorClass} h-4 rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-background mix-blend-lighten">{Math.round(value)} / {maxValue}</span>
        </div>
    );
};

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TimeBar = ({ timeTaken, totalDuration, colorClass }: { timeTaken: number, totalDuration: number, colorClass: string}) => {
    const percentage = Math.max(0, Math.min(100, (timeTaken / totalDuration) * 100));
    return (
        <div className="w-full bg-secondary rounded-full h-4 relative overflow-hidden">
            <motion.div 
                className={`${colorClass} h-4 rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-background mix-blend-lighten">{formatTime(timeTaken)} / {formatTime(totalDuration)}</span>
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
    
    const [alphaScore, setAlphaScore] = useState<TeamScore | null>(null);
    const [betaScore, setBetaScore] = useState<TeamScore | null>(null);
    const [alphaStatus, setAlphaStatus] = useState<TeamStatus>('pending');
    const [betaStatus, setBetaStatus] = useState<TeamStatus>('pending');

    const [aiReasoning, setAiReasoning] = useState('');
    const [battleWinners, setBattleWinners] = useState<BattleWinner[]>([]);
    const [pollTrigger, setPollTrigger] = useState(0);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isScoring, setIsScoring] = useState(false);

    useEffect(() => {
        const userJson = localStorage.getItem('war-room-user');
        if (userJson) {
            setCurrentUser(JSON.parse(userJson));
        }
    }, []);

    const setScoresFromDetails = useCallback((details: AIScoreResult, missionData: Mission, teamAlpha: Team, teamBeta: Team) => {
        setAiReasoning(details.winning_team_reasoning);
        setBattleWinners(details.battle_winners || []);
        
        const missionStartTime = new Date(missionData.mission_start_time!).getTime();
        const alphaTimeTaken = new Date(teamAlpha.submission_timestamp!).getTime() - missionStartTime;
        const betaTimeTaken = new Date(teamBeta.submission_timestamp!).getTime() - missionStartTime;
        
        const finalAlphaBreakdown: ScoreBreakdown = { 
            accuracy: details.team_alpha_score.accuracy_score, 
            sources: details.team_alpha_score.sources_score, 
            presentation: details.team_alpha_score.presentation_score, 
            speed: details.team_alpha_score.speed_score
        };
        const finalAlphaTotal = Object.values(finalAlphaBreakdown).reduce((sum, val) => sum + (Number.isFinite(val) ? val : 0), 0);
        setAlphaScore({ total: finalAlphaTotal, breakdown: finalAlphaBreakdown, reasoning: details.team_alpha_score.reasoning, timeTaken: Math.round(alphaTimeTaken/1000) });
        setAlphaStatus('scored');

        const finalBetaBreakdown: ScoreBreakdown = {
            accuracy: details.team_beta_score.accuracy_score,
            sources: details.team_beta_score.sources_score,
            presentation: details.team_beta_score.presentation_score,
            speed: details.team_beta_score.speed_score
        };
        const finalBetaTotal = Object.values(finalBetaBreakdown).reduce((sum, val) => sum + (Number.isFinite(val) ? val : 0), 0);
        setBetaScore({ total: finalBetaTotal, breakdown: finalBetaBreakdown, reasoning: details.team_beta_score.reasoning, timeTaken: Math.round(betaTimeTaken/1000) });
        setBetaStatus('scored');

        let missionWinner: 'alpha' | 'beta' | 'tie' = 'tie';
        if (finalAlphaTotal > finalBetaTotal) missionWinner = 'alpha';
        if (finalBetaTotal > finalAlphaTotal) missionWinner = 'beta';
        setWinner(missionWinner);
    }, []);

    const processResults = useCallback(async () => {
        if (!missionId) {
            setError("Mission ID not found.");
            setLoading(false);
            return;
        }

        const missionData = db.getMissions().find(m => m.id === missionId);
        if (!missionData) {
            setError("Mission not found.");
            setLoading(false);
            return;
        }
        setMission(missionData);

        const allTeams = db.getTeams();
        const teamAlpha = allTeams.find(t => t.mission_id === missionId && t.team_name === 'alpha');
        const teamBeta = allTeams.find(t => t.mission_id === missionId && t.team_name === 'beta');

        const allReports = db.getReports();
        const reportAlpha = allReports.find(r => r.mission_id === missionId && r.team_name === 'alpha');
        const reportBeta = allReports.find(r => r.mission_id === missionId && r.team_name === 'beta');

        // Check for pre-existing score details
        if (missionData.score_details && teamAlpha?.submission_timestamp && teamBeta?.submission_timestamp) {
            setLoadingMessage("Loading finalized scores...");
            setScoresFromDetails(missionData.score_details, missionData, teamAlpha, teamBeta);
            setLoading(false);
            return;
        }
        
        // --- Status Update & Polling ---
        if (!reportAlpha || !reportBeta) {
            setLoading(false);
            setAlphaStatus(reportAlpha ? 'submitted' : 'pending');
            setBetaStatus(reportBeta ? 'submitted' : 'pending');
            const waitingFor = !reportAlpha && !reportBeta ? "teams to submit reports" : reportAlpha ? "Team Beta" : "Team Alpha";
            setLoadingMessage(`Awaiting ${waitingFor}...`);
            setTimeout(() => setPollTrigger(p => p + 1), 5000); // Poll for reports
            return;
        }

        // --- Final Evaluation (only when both reports are in and not yet scored) ---
        if (reportAlpha && reportBeta && teamAlpha && teamBeta && !isScoring) {
            setIsScoring(true);
            setLoading(true);
            setLoadingMessage("AI Analyst is comparing reports...");
            setAlphaStatus('scoring');
            setBetaStatus('scoring');
            
            if (!missionData.mission_start_time || !teamAlpha.submission_timestamp || !teamBeta.submission_timestamp) {
                setError("Mission or team submission timestamps are missing, cannot calculate final scores accurately.");
                setLoading(false);
                setIsScoring(false);
                return;
            }

            const finalScores = await scoreReports(missionData.target_company, reportAlpha.battle_data, reportBeta.battle_data, missionData, teamAlpha, teamBeta);

            if (!finalScores) {
                setError("AI final comparison failed.");
                setLoading(false);
                setIsScoring(false);
                return;
            }
            
            setScoresFromDetails(finalScores, missionData, teamAlpha, teamBeta);
            
            if (missionData.status !== MissionStatus.COMPLETED) {
                const alphaTotal = Object.values(finalScores.team_alpha_score).reduce((s: number, v) => typeof v === 'number' ? s + v : s, 0);
                const betaTotal = Object.values(finalScores.team_beta_score).reduce((s: number, v) => typeof v === 'number' ? s + v : s, 0);
                let finalWinner: 'alpha' | 'beta' | 'tie' = 'tie';
                if (alphaTotal > betaTotal) finalWinner = 'alpha';
                if (betaTotal > alphaTotal) finalWinner = 'beta';

                db.updateMissions(db.getMissions().map(m => m.id === missionId ? { ...m, status: MissionStatus.COMPLETED, winner_team: finalWinner, team_alpha_score: Math.round(alphaTotal), team_beta_score: Math.round(betaTotal), score_details: finalScores } : m));
                
                const winningTeamEmails = finalWinner !== 'tie' ? (finalWinner === 'alpha' ? teamAlpha.members : teamBeta.members).map(m => m.email) : [];
                const allParticipantEmails = new Set([...teamAlpha.members.map(m => m.email), ...teamBeta.members.map(m => m.email)]);

                const usersInDb = db.getUsers();
                usersInDb.forEach(user => {
                    if (allParticipantEmails.has(user.email)) {
                        const updatedUser = {
                            ...user,
                            // FIX: Explicitly convert to Number to prevent type errors with string concatenation.
                            total_missions: Number(user.total_missions || 0) + 1,
                            // FIX: Explicitly convert to Number to prevent type errors with string concatenation.
                            missions_won: Number(user.missions_won || 0) + (winningTeamEmails.includes(user.email) ? 1 : 0)
                        };
                        db.updateUser(updatedUser);

                        if (currentUser && currentUser.id === updatedUser.id) {
                            localStorage.setItem('war-room-user', JSON.stringify(updatedUser));
                        }
                    }
                });
            }
            setLoading(false);
        }

    }, [missionId, pollTrigger, currentUser, isScoring, setScoresFromDetails]);

    useEffect(() => {
        processResults();
    }, [processResults]);

    const TeamResultCard: React.FC<{ teamName: 'Alpha' | 'Beta', score: TeamScore | null, status: TeamStatus, isWinner: boolean, hasWinner: boolean, mission: Mission }> = ({ teamName, score, status, isWinner, hasWinner, mission }) => {
        const teamSpecificClasses = {
            Alpha: {
                border: 'border-team-alpha shadow-team-alpha/20',
                bg: 'bg-team-alpha',
                text: 'text-team-alpha',
                winner_bg: 'bg-team-alpha',
                score_bar_400: 'bg-blue-400',
                score_bar_500: 'bg-blue-500',
                score_bar_600: 'bg-blue-600',
                score_bar_700: 'bg-blue-700',
            },
            Beta: {
                border: 'border-team-beta shadow-team-beta/20',
                bg: 'bg-team-beta',
                text: 'text-team-beta',
                winner_bg: 'bg-team-beta',
                score_bar_400: 'bg-red-400',
                score_bar_500: 'bg-red-500',
                score_bar_600: 'bg-red-600',
                score_bar_700: 'bg-red-700',
            }
        };
        const styles = teamSpecificClasses[teamName];

        return (
            <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: teamName === 'Alpha' ? 0.1 : 0.2 }}
                className="group"
            >
            <Card className={`bg-panel border-2 ${isWinner ? styles.border : 'border-panel-border'} ${hasWinner && !isWinner ? 'opacity-60 saturate-50 group-hover:opacity-100 group-hover:saturate-100' : ''} min-h-[620px] flex flex-col transition-all duration-500`}>
                <div className="p-6 relative flex-grow flex flex-col">
                    <AnimatePresence>
                    {isWinner && (
                        <motion.div 
                          initial={{scale:0, rotate: -20, y: -20}} 
                          animate={{scale:1, rotate:0, y: 0}} 
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                          className={`absolute -top-5 -left-5 ${styles.winner_bg} text-background px-4 py-2 rounded-lg text-sm font-bold transform -rotate-12 flex items-center gap-2 z-10`}
                        >
                          <Trophy/> WINNER
                        </motion.div>
                    )}
                    </AnimatePresence>

                    <h2 className={`text-3xl font-bold ${styles.text} mb-2`}>Team {teamName}</h2>

                    {status === 'pending' && <div className="flex-grow flex flex-col items-center justify-center text-gray-500"><Clock className="w-8 h-8 mb-2"/><span>Waiting for submission...</span></div>}
                    {status === 'submitted' && <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-400"><FileText className="w-8 h-8 mb-2"/><span>Report Submitted.<br/>Awaiting opponent.</span></div>}
                    {status === 'scoring' && <div className="flex-grow flex flex-col items-center justify-center text-accent"><Loader className="w-8 h-8 mb-2 animate-spin"/><span>AI analysis in progress...</span></div>}
                    
                    {status === 'scored' && score && (
                        <>
                            <p className="text-5xl font-bold mb-6">{Math.round(score.total)} <span className="text-2xl text-gray-400">/ 100</span></p>

                            <div className="mb-6">
                                <p className="text-sm font-medium mb-1 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /><span>Time Utilized</span></p>
                                <TimeBar timeTaken={score.timeTaken} totalDuration={mission.time_limit_minutes * 60} colorClass={`bg-gray-500`} />
                            </div>

                            <div className="space-y-4">
                                <div><p className="text-sm font-medium mb-1 flex justify-between">Data Accuracy & Completeness <span className="text-gray-400">60%</span></p><ScoreBar value={score.breakdown.accuracy} maxValue={60} colorClass={styles.score_bar_400} /></div>
                                <div><p className="text-sm font-medium mb-1 flex justify-between">Source Links <span className="text-gray-400">15%</span></p><ScoreBar value={score.breakdown.sources} maxValue={15} colorClass={styles.score_bar_500} /></div>
                                <div><p className="text-sm font-medium mb-1 flex justify-between">Teamwork & Presentation <span className="text-gray-400">15%</span></p><ScoreBar value={score.breakdown.presentation} maxValue={15} colorClass={styles.score_bar_600} /></div>
                                <div><p className="text-sm font-medium mb-1 flex justify-between">Speed Score <span className="text-gray-400">10%</span></p><ScoreBar value={score.breakdown.speed} maxValue={10} colorClass={styles.score_bar_700} /></div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-panel-border"><h4 className="font-semibold text-gray-400 text-sm mb-2">AI Analyst's Notes:</h4><p className="text-sm text-gray-300 italic">"{score.reasoning}"</p></div>
                        </>
                    )}
                </div>
            </Card>
            </motion.div>
        );
    };

    if (loading) return (
        <div className="flex flex-col gap-4 justify-center items-center h-full">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Zap className="w-16 h-16 text-accent" />
            </motion.div>
            <p className="text-xl font-semibold text-gray-300">{loadingMessage}</p>
        </div>
    );
    if (error) return <div className="p-6 text-center text-red-400">{error}</div>;

    const hasWinner = winner !== null && winner !== 'tie';

    return (
        <div className="p-6">
            <header className="text-center mb-8">
                <div className="inline-block bg-accent/10 p-4 rounded-full mb-4"><Award className="w-12 h-12 text-accent" /></div>
                <h1 className="text-4xl font-bold">Mission Debriefing</h1>
                <p className="text-gray-400">Target: <span className="font-medium text-accent">{mission?.target_company}</span></p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {mission && <TeamResultCard teamName="Alpha" score={alphaScore} status={alphaStatus} isWinner={winner === 'alpha'} hasWinner={hasWinner} mission={mission}/>}
                {mission && <TeamResultCard teamName="Beta" score={betaScore} status={betaStatus} isWinner={winner === 'beta'} hasWinner={hasWinner} mission={mission} />}
            </div>

            {winner === 'tie' && <p className="text-center text-2xl font-bold text-accent mt-8">Mission Result: TIE</p>}
            
            <AnimatePresence>
            {winner && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card className="max-w-4xl mx-auto mt-8 bg-panel border-panel-border">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-accent mb-3 flex items-center gap-2"><BarChart3/>Battlefield Breakdown</h3>
                            <div className="space-y-4 mt-4">
                                {battleWinners.map(bw => {
                                    const config = BATTLE_CONFIGS[bw.battle as keyof typeof BATTLE_CONFIGS];
                                    const IconComponent = config.icon;
                                    const winnerColor = bw.winner === 'alpha' ? 'text-team-alpha' : bw.winner === 'beta' ? 'text-team-beta' : 'text-gray-400';
                                    return (
                                        <div key={bw.battle} className="bg-secondary p-4 rounded-lg flex items-center gap-4">
                                            <IconComponent className={`w-8 h-8 flex-shrink-0 ${config.color}`} />
                                            <div className="flex-grow"><h4 className="font-bold">{config.name.split(':')[1]}</h4><p className="text-sm text-gray-400 italic">"{bw.reasoning}"</p></div>
                                            <div className="text-right flex-shrink-0 w-24"><p className="text-xs text-gray-500">WINNER</p><p className={`font-bold ${winnerColor}`}>Team {bw.winner.toUpperCase()}</p></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>

                    {aiReasoning && (
                        <Card className="max-w-4xl mx-auto mt-8 bg-panel border-panel-border">
                            <div className="p-6"><h3 className="text-xl font-bold text-accent mb-3 flex items-center gap-2"><Zap/>AI's Final Verdict</h3><p className="text-gray-300">{aiReasoning}</p></div>
                        </Card>
                    )}
                </motion.div>
            )}
            </AnimatePresence>

            <div className="text-center mt-12">
                <Button onClick={() => navigate('/dashboard')} variant="primary" size="lg">Return to Dashboard</Button>
            </div>
        </div>
    );
};

export default ResultsScreen;