import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/screens/LoginScreen.tsx';
import RegisterScreen from './components/screens/RegisterScreen.tsx';
import DashboardScreen from './components/screens/PlayerDashboardScreen.tsx';
import MissionHubScreen from './components/screens/AdminHubScreen.tsx';
import StrategyRoomScreen from './components/screens/StrategyRoomScreen.tsx';
import WarRoomScreen from './components/screens/WarRoomScreen.tsx';
import ResultsScreen from './components/screens/ResultsScreen.tsx';
import SettingsScreen from './components/screens/SettingsScreen.tsx';
import MyCareerScreen from './components/screens/MyCareerScreen.tsx';
import UsersScreen from './components/screens/UsersScreen.tsx';
import RulesAndRolesScreen from './components/screens/RulesAndRolesScreen.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import Layout from './components/layout/Layout.tsx';
import { UserRole } from './types.ts';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Protected routes wrapped in the new Layout */}
        <Route element={<Layout />}>
          <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardScreen />} />
              <Route path="/strategy/:missionId/:teamName" element={<StrategyRoomScreen />} />
              <Route path="/war-room/:missionId/:teamName" element={<WarRoomScreen />} />
              <Route path="/mission-results/:missionId" element={<ResultsScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/my-career" element={<MyCareerScreen />} />
              <Route path="/rules" element={<RulesAndRolesScreen />} />
          </Route>

          {/* Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
            <Route path="/admin/mission-hub" element={<MissionHubScreen />} />
            <Route path="/admin/users" element={<UsersScreen />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;