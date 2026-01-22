import React, { useState, useEffect } from 'react';
import { User } from './types';
import { getCurrentUser, logoutUser } from './services/api';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { HistoryPage } from './pages/History';
import { Appointments } from './pages/Appointments';
import { Navbar } from './components/Navbar';
import { AddMedicine } from './pages/AddMedicine';

type View = 'login' | 'register' | 'dashboard' | 'history' | 'appointments' | 'add-medicine';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('login');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setCurrentView('dashboard');
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setCurrentView('login');
  };

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <Login onLogin={handleLogin} onNavigate={() => setCurrentView('register')} />;
      case 'register':
        return <Register onRegister={handleLogin} onNavigate={() => setCurrentView('login')} />;
      case 'dashboard':
        return <Dashboard onAddMedicine={() => setCurrentView('add-medicine')} />;
      case 'add-medicine':
        return <AddMedicine onCancel={() => setCurrentView('dashboard')} onSave={() => setCurrentView('dashboard')} />;
      case 'history':
        return <HistoryPage />;
      case 'appointments':
        return <Appointments />;
      default:
        return <Dashboard onAddMedicine={() => setCurrentView('add-medicine')} />;
    }
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center text-blue-600">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-50 font-sans">{renderView()}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-16 sm:pb-0">
      <Navbar 
        currentPage={currentView} 
        onNavigate={(page) => setCurrentView(page as View)} 
        onLogout={handleLogout}
        userEmail={user.email}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
