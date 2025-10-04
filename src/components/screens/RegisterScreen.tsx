import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { UserRole } from '../../types';
import { db } from '../../lib/db';
import { Target, UserIcon, MailIcon, Lock } from '../icons';

const RegisterScreen: React.FC = () => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!displayName || !email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        const users = await db.getUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            setError('An account with this email already exists.');
            return;
        }

        const newUser = {
            id: `user-${Date.now()}`,
            displayName,
            email,
            password,
            role: UserRole.PLAYER,
            total_missions: 0,
            missions_won: 0,
        };

        try {
            await db.addUser(newUser);
            localStorage.setItem('war-room-user', JSON.stringify(newUser));
            navigate('/dashboard');
        } catch (error) {
            setError('Failed to create account. Please try again.');
        }
    };
    
    const formVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.15,
          delayChildren: 0.2,
        },
      },
    };

    const itemVariants: Variants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <Card className="w-full max-w-md p-8 border animate-glow-border">
                  <motion.div 
                    className="text-center mb-8"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring' }}
                  >
                    <div className="w-16 h-16 bg-accent/10 rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-accent/30">
                      <Target className="w-8 h-8 text-accent animate-glow" />
                    </div>
                    <h1 className="text-3xl font-bold text-accent">Enlist in the Intel Wars</h1>
                    <p className="text-gray-400 mt-2">Create your operative profile to begin.</p>
                  </motion.div>
                  
                  <motion.form 
                    onSubmit={handleRegister} 
                    className="space-y-6"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                  >
                      <motion.div variants={itemVariants}>
                        <Input
                            id="displayName"
                            label="Display Name"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                            placeholder="e.g., Agent Smith"
                            icon={<UserIcon className="w-5 h-5" />}
                        />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Input
                            id="email"
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="agent@intel.com"
                            icon={<MailIcon className="w-5 h-5" />}
                        />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            icon={<Lock className="w-5 h-5" />}
                        />
                      </motion.div>

                      {error && <p className="text-danger text-sm text-center !mt-4">{error}</p>}
                      
                      <motion.div variants={itemVariants}>
                        <div className="w-full !mt-8">
                            <Button 
                              type="submit" 
                              variant="primary" 
                              className="w-full"
                            >
                                Create Profile & Enter Hub
                            </Button>
                        </div>
                      </motion.div>
                  </motion.form>
                  <motion.p 
                    className="text-center mt-6 text-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                      Already have an account?{' '}
                      <Link to="/login" className="font-semibold text-accent hover:underline">
                          Authenticate Here
                      </Link>
                  </motion.p>
              </Card>
            </motion.div>
        </div>
    );
};

export default RegisterScreen;