import React from 'react';
import { Crown, Crosshair, DollarSign, Eye, Shield, FileText, Lock, Target } from '../../constants.tsx';

const ROLES_DATA = [
  { id: 'market_commander', name: 'Market Commander', icon: Crown, color: 'text-red-400', objective: "Uncover intelligence on the target's leadership, corporate structure, and market position.", battleSection: 'BATTLE 1: Leadership Recon & Market Dominance' },
  { id: 'arsenal_ranger', name: 'Arsenal Ranger', icon: Crosshair, color: 'text-blue-400', objective: "Analyze the target's products, services, pricing, and social media presence.", battleSection: 'BATTLE 2: Product Arsenal & Social Signals Strike' },
  { id: 'capital_quartermaster', name: 'Capital Quartermaster', icon: DollarSign, color: 'text-green-400', objective: 'Track the flow of money, including funding, investments, revenue, and company valuation.', battleSection: 'BATTLE 3: Funding Fortification' },
  { id: 'customer_analyst', name: 'Customer Analyst', icon: Eye, color: 'text-purple-400', objective: "Identify and understand the target company's customers, including their demographics and needs.", battleSection: 'BATTLE 4: Customer Frontlines' },
  { id: 'alliance_broker', name: 'Alliance Broker', icon: Shield, color: 'text-orange-400', objective: "Investigate partnerships, supply chains, and the target's strategic growth plans.", battleSection: 'BATTLE 5: Alliance Forge & Growth Offensive' },
];

const RulesAndRolesScreen = () => {
  return (
    <div className="p-6">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full mb-4">
            <FileText className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-4xl font-bold text-primary-text mb-2">Operations Manual</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Review the rules of engagement and master your assigned battle role. Success depends on specialization and coordination.
          </p>
        </header>

        <div className="space-y-4 max-w-3xl mx-auto">
          {ROLES_DATA.map((role) => (
             <details key={role.id} className="bg-panel border border-panel-border rounded-lg p-6 group transition-all" open={role.id === 'market_commander'}>
                <summary className="list-none flex items-center gap-4 cursor-pointer">
                    <role.icon className={`w-8 h-8 flex-shrink-0 ${role.color}`} />
                    <div>
                        <h2 className={`text-xl font-bold ${role.color}`}>{role.name}</h2>
                        <p className="text-gray-400 text-sm mt-1">{role.objective}</p>
                    </div>
                    <div className="ml-auto transform transition-transform duration-200 group-open:rotate-90 text-gray-400 text-xl font-bold">&gt;</div>
                </summary>
                <div className="mt-6 pt-4 border-t border-panel-border text-sm">
                     <div className="space-y-4">
                        <div>
                            <h3 className="text-xs uppercase font-semibold text-gray-500 mb-1 flex items-center gap-2"><Target/>BATTLE SECTION</h3>
                            <p>{role.battleSection}</p>
                        </div>
                         <div>
                            <h3 className="text-xs uppercase font-semibold text-gray-500 mb-1 flex items-center gap-2"><Lock/>EDITING PERMISSIONS</h3>
                            <p>You are exclusively locked to editing data fields within your assigned battle section in the War Room.</p>
                        </div>
                     </div>
                </div>
            </details>
          ))}
        </div>
    </div>
  );
};

export default RulesAndRolesScreen;