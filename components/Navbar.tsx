import React from 'react';
import { LayoutDashboard, History, Calendar, LogOut, Pill } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userEmail: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onLogout, userEmail }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <Pill className="h-8 w-8 text-blue-600 mr-2" />
              <span className="font-bold text-xl text-gray-800 tracking-tight">MediTrack</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors duration-200`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-4 hidden md:block">{userEmail}</span>
            <button
              onClick={onLogout}
              className="text-gray-500 hover:text-red-600 transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="sm:hidden border-t border-gray-200 bg-gray-50 flex justify-around p-2 fixed bottom-0 w-full left-0 z-50">
          {navItems.map((item) => {
             const Icon = item.icon;
             const isActive = currentPage === item.id;
             return (
               <button
                 key={item.id}
                 onClick={() => onNavigate(item.id)}
                 className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
               >
                 <Icon className="h-6 w-6 mb-1" />
                 <span className="text-xs">{item.label}</span>
               </button>
             )
          })}
      </div>
    </nav>
  );
};