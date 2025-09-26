import React, { useState, useEffect } from 'react';
import Card from '../ui/Card.tsx';
import Input from '../ui/Input.tsx';
import Button from '../ui/Button.tsx';
import { User, UserRole } from '../../types.ts';
import { Crown, UserCheck, Shield, Upload, Save, LogOut } from '../../constants.tsx';
import { db } from '../../db.ts';
import { useNavigate } from 'react-router-dom';

const SettingsScreen: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const storedUser = localStorage.getItem('war-room-user');
        if (storedUser) {
            const parsedUser: User = JSON.parse(storedUser);
            setUser(parsedUser);
            setDisplayName(parsedUser.displayName);
            setAvatarUrl(parsedUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${parsedUser.email}`);
        }
    }, []);

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setAvatarUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleSaveChanges = () => {
        if (user) {
            const updatedUser = { ...user, displayName, avatarUrl: avatarUrl || user.avatarUrl };
            db.updateUser(updatedUser);
            localStorage.setItem('war-room-user', JSON.stringify(updatedUser)); // also update session
            alert('Changes saved! Profile will update on next login.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('war-room-user');
        navigate('/login');
    };
    
    const getRoleIcon = (role: UserRole) => {
        switch (role) {
          case UserRole.ADMIN: return <Crown className="w-5 h-5 text-accent" />;
          case UserRole.TEAM_LEADER: return <UserCheck className="w-5 h-5 text-blue-400" />;
          default: return <Shield className="w-5 h-5 text-green-400" />;
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-background p-6 flex justify-center items-start">
            <Card className="w-full max-w-4xl mt-8">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-accent mb-8">Agent Settings</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center col-span-1">
                            {avatarUrl && <img src={avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full mb-4 object-cover border-2 border-accent" />}
                            <input type="file" id="avatarUpload" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                            <label htmlFor="avatarUpload" className="cursor-pointer bg-secondary text-primary-text px-4 py-2 rounded-md hover:bg-secondary-hover transition-colors mb-2 w-full text-center">
                                <Upload className="w-4 h-4 mr-2 inline-block"/> Upload Image
                            </label>
                             <div className="flex items-center gap-2 p-2 bg-secondary rounded-md w-full justify-center">
                                {getRoleIcon(user.role)}
                                <span>{user.role}</span>
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <Input id="displayName" label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                            <Input id="email" label="Email Address" value={user.email} disabled />
                            <fieldset className="border border-panel-border p-4 rounded-md">
                                <legend className="px-2 font-semibold">Change Password</legend>
                                <div className="space-y-4">
                                    <Input id="currentPassword" label="Current Password" type="password" placeholder="********" />
                                    <Input id="newPassword" label="New Password" type="password" placeholder="********" />
                                    <Input id="confirmPassword" label="Confirm New Password" type="password" placeholder="********" />
                                </div>
                            </fieldset>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-between">
                        <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/20" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" /> Sign Out
                        </Button>
                        <Button onClick={handleSaveChanges}>
                            <Save className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SettingsScreen;