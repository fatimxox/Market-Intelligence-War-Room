import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Crosshair, DollarSign, Eye, Shield, FileText, Lock, Target, ChevronRight } from '../icons';

const ROLES_DATA = [
  { id: 'market_commander', name: 'Market Commander', icon: Crown, color: 'text-red-400', objective: "Uncover intelligence on the target's leadership, corporate structure, and market position.", battleSection: 'BATTLE 1: Leadership Recon & Market Dominance' },
  { id: 'arsenal_ranger', name: 'Arsenal Ranger', icon: Crosshair, color: 'text-blue-400', objective: "Analyze the target's products, services, pricing, and social media presence.", battleSection: 'BATTLE 2: Product Arsenal & Social Signals Strike' },
  { id: 'capital_quartermaster', name: 'Capital Quartermaster', icon: DollarSign, color: 'text-green-400', objective: 'Track the flow of money, including funding, investments, revenue, and company valuation.', battleSection: 'BATTLE 3: Funding Fortification' },
  { id: 'customer_analyst', name: 'Customer Analyst', icon: Eye, color: 'text-purple-400', objective: "Identify and understand the target company's customers, including their demographics and needs.", battleSection: 'BATTLE 4: Customer Frontlines' },
  { id: 'alliance_broker', name: 'Alliance Broker', icon: Shield, color: 'text-orange-400', objective: "Investigate partnerships, supply chains, and the target's strategic growth plans.", battleSection: 'BATTLE 5: Alliance Forge & Growth Offensive' },
];

const RoleAccordion: React.FC<{ role: typeof ROLES_DATA[0]; isExpanded: boolean; onToggle: () => void }> = ({ role, isExpanded, onToggle }) => {
    return (
        <motion.div
            layout
            className="bg-panel border border-panel-border rounded-lg overflow-hidden transition-all hover:border-accent/30"
            initial={{ borderRadius: "0.5rem" }}
        >
            <motion.header
                layout
                onClick={onToggle}
                className="flex items-center gap-4 p-6 cursor-pointer"
                initial={false}
            >
                <role.icon className={`w-8 h-8 flex-shrink-0 ${role.color}`} />
                <div className="flex-grow">
                    <h2 className={`text-xl font-bold ${role.color}`}>{role.name}</h2>
                    <p className="text-gray-400 text-sm mt-1">{role.objective}</p>
                </div>
                <motion.div
                    className="ml-auto text-gray-400"
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                    <ChevronRight className="w-6 h-6"/>
                </motion.div>
            </motion.header>
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.section
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 pt-4 border-t border-panel-border text-sm">
                             <div className="space-y-4">
                                <div>
                                    <h3 className="text-xs uppercase font-semibold text-gray-500 mb-1 flex items-center gap-2"><Target/>BATTLE SECTION</h3>
                                    <p className="text-gray-300">{role.battleSection}</p>
                                </div>
                                 <div>
                                    <h3 className="text-xs uppercase font-semibold text-gray-500 mb-1 flex items-center gap-2"><Lock/>EDITING PERMISSIONS</h3>
                                    <p className="text-gray-300">You are exclusively locked to editing data fields within your assigned battle section in the War Room.</p>
                                </div>
                             </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const RulesAndRolesScreen = () => {
    const [expandedRoleId, setExpandedRoleId] = useState<string | null>('market_commander');

    const handleToggle = (id: string) => {
        setExpandedRoleId(expandedRoleId === id ? null : id);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="p-6">
            <motion.header 
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full mb-4 border-2 border-accent/20">
                <FileText className="w-10 h-10 text-accent animate-glow" />
              </div>
              <h1 className="text-4xl font-bold text-primary-text mb-2">Operations Manual</h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Review the rules of engagement and master your assigned battle role. Success depends on specialization and coordination.
              </p>
            </motion.header>
    
            <motion.div 
                className="space-y-4 max-w-3xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
              {ROLES_DATA.map((role) => (
                 <motion.div variants={itemVariants} key={role.id}>
                    <RoleAccordion
                        role={role}
                        isExpanded={expandedRoleId === role.id}
                        onToggle={() => handleToggle(role.id)}
                    />
                 </motion.div>
              ))}
            </motion.div>
        </div>
      );
};

export default RulesAndRolesScreen;