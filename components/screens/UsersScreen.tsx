import React, { useState, useEffect } from "react";
import { User } from "../../types.ts";
import Card from "../ui/Card.tsx";
import Input from "../ui/Input.tsx";
// FIX: Corrected icon import path
import { Crown, UserCheck, Shield, Search } from "../../src/components/icons.tsx";
// FIX: Corrected db import path
import { db } from "../../src/lib/db.ts";

const UsersScreen = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const usersFromDb = db.getUsers();
    setAllUsers(usersFromDb);
    setFilteredUsers(usersFromDb);
  }, []);

  useEffect(() => {
    const filtered = allUsers.filter(user =>
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, allUsers]);

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'Admin': return { icon: <Crown className="w-4 h-4 text-accent" />, color: 'bg-accent/20 text-accent border-accent/30' };
      case 'Team Leader': return { icon: <UserCheck className="w-4 h-4 text-blue-400" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      default: return { icon: <Shield className="w-4 h-4 text-green-400" />, color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    }
  };

  return (
    <div className="p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-400">View and manage all registered operatives.</p>
        </header>

        <Card className="mb-8 bg-panel border-panel-border">
          <div className="p-4 relative">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name or email..."
              className="pl-10 bg-secondary border-none focus:bg-secondary"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => {
            const roleInfo = getRoleInfo(user.role);
            return (
              <Card key={user.id} className="bg-panel border-panel-border text-center p-6">
                <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-panel-border bg-accent/20"/>
                <h3 className="text-lg font-bold truncate">{user.displayName}</h3>
                <p className="text-sm text-gray-400 mb-3 truncate">{user.email}</p>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${roleInfo.color}`}>
                  {roleInfo.icon} {user.role}
                </span>
                <div className="text-sm space-y-2 mt-4 text-left">
                  <div className="flex justify-between"><span className="text-gray-400">Missions:</span> <span className="font-medium">{user.total_missions || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Win Rate:</span> <span className="font-medium">{user.total_missions ? Math.round(((user.missions_won || 0) / user.total_missions) * 100) : 0}%</span></div>
                </div>
              </Card>
            );
          })}
        </div>
    </div>
  );
};

export default UsersScreen;