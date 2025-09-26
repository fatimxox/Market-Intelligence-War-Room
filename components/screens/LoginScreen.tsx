import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../ui/Card.tsx';
import Input from '../ui/Input.tsx';
import Button from '../ui/Button.tsx';
import { db } from '../../db.ts';

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        const user = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            setError('User not found. Please register.');
            return;
        }
        
        if (user.password !== password) {
            setError('Invalid password.');
            return;
        }
        
        localStorage.setItem('war-room-user', JSON.stringify(user));

        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md p-8">
                <h1 className="text-3xl font-bold text-center text-accent mb-2">Intel Wars</h1>
                <p className="text-center text-gray-400 mb-8">Welcome, Agent. Please authenticate.</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <Input
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g., ateffatim@gmail.com"
                        required
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="e.g., password123"
                        required
                    />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <Button type="submit" variant="primary" className="w-full !mt-8">
                        Login
                    </Button>
                </form>
                <p className="text-center mt-6 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-accent hover:underline">
                        Register here
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default LoginScreen;