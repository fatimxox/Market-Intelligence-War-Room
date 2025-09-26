import React from 'react';
import Card from '../ui/Card.tsx';
import Button from '../ui/Button.tsx';
import { useNavigate } from 'react-router-dom';

const ResultsScreen: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-full bg-background text-primary-text flex flex-col items-center justify-center p-6">
            <Card className="bg-panel border-panel-border">
                <div className="p-8 text-center">
                    <h1 className="text-3xl font-bold text-accent mb-4">Mission Results</h1>
                    <p className="text-gray-400 mb-6">This page is temporarily unavailable while we upgrade our charting library.</p>
                    <Button onClick={() => navigate('/dashboard')} variant="primary">
                        Return to Dashboard
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ResultsScreen;