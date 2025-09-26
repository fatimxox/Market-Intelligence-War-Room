import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../ui/Card.tsx';
import Input from '../ui/Input.tsx';
import Button from '../ui/Button.tsx';
import { UserRole } from '../../types.ts';
import { db } from '../../db.ts';

const RegisterScreen: React.FC = () => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayName || !email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        
        if (db.getUsers().some(u => u.email.toLowerCase() === email.toLowerCase())) {
            setError('An account with this email already exists.');
            return;
        }

        const newUser = {
            id: `user-${Date.now()}`,
            displayName,
            email,
            password, // In a real app, this should be hashed.
            role: UserRole.PLAYER,
            total_missions: 0,
            missions_won: 0,
        };

        db.addUser(newUser);
        localStorage.setItem('war-room-user', JSON.stringify(newUser));
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md p-8">
                <h1 className="text-3xl font-bold text-center text-accent mb-6">Create Your Operative Profile</h1>
                <form onSubmit={handleRegister} className="space-y-6">
                    <Input
                        id="displayName"
                        label="Display Name"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                    />
                    <Input
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <Button type="submit" variant="primary" className="w-full !mt-8">
                        Register
                    </Button>
                </form>
                <p className="text-center mt-6 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-accent hover:underline">
                        Login here
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default RegisterScreen;