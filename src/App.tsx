import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/screens/LoginScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import DashboardScreen from './components/screens/PlayerDashboardScreen';
import MissionHubScreen from './components/screens/AdminHubScreen';
import StrategyRoomScreen from './components/screens/StrategyRoomScreen';
import WarRoomScreen from './components/screens/WarRoomScreen';
import ResultsScreen from './components/screens/ResultsScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import MyCareerScreen from './components/screens/MyCareerScreen';
import UsersScreen from './components/screens/UsersScreen';
import RulesAndRolesScreen from './components/screens/RulesAndRolesScreen';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import { UserRole } from './types';
import MissionLobbyScreen from './components/screens/MissionLobbyScreen';

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
              <Route path="/lobby/:missionId" element={<MissionLobbyScreen />} />
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
