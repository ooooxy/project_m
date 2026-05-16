
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { KanbanPage } from './pages/KanbanPage';
import { StoriesPage } from './pages/StoriesPage';
import { TeamPage } from './pages/TeamPage';
import { LoginPage } from './pages/LoginPage';
import { useStore } from './store/useStore';

const AppContent: React.FC = () => {
  const { activeView, setActiveView, user } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveView('kanban');
    } else if (path === '/kanban') {
      setActiveView('kanban');
    } else if (path === '/stories') {
      setActiveView('stories');
    } else if (path === '/team') {
      setActiveView('team');
    }
  }, [location.pathname, setActiveView]);

  useEffect(() => {
    if (location.pathname !== '/login') {
      navigate(`/${activeView === 'kanban' ? '' : activeView}`);
    }
  }, [activeView, navigate]);

  const renderPage = () => {
    switch (activeView) {
      case 'kanban':
        return <KanbanPage />;
      case 'stories':
        return <StoriesPage />;
      case 'team':
        return <TeamPage />;
      default:
        return <KanbanPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-7xl mx-auto">
        {renderPage()}
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
