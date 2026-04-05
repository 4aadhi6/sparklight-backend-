import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';
import { Sun, Moon, LogOut, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              SPARK LIGHT
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/services" className="text-zinc-600 dark:text-zinc-300 hover:text-blue-600 transition-colors">Services</Link>
            {user && user.role === 'user' && (
              <Link to="/emergency" className="text-red-600 font-bold hover:text-red-700 transition-colors animate-pulse">Emergency</Link>
            )}
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-zinc-600" />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-500/20 group-hover:border-blue-500 transition-colors">
                    <img 
                      src={user.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium hidden lg:block">{user.name}</span>
                </Link>
                <Link to={user.role === 'admin' ? '/admin' : user.role === 'worker' ? '/worker' : '/dashboard'}>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User size={18} />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-zinc-600" />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-600 dark:text-zinc-300">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glass border-t border-white/10 p-4 space-y-4"
          >
            <Link to="/services" className="block text-zinc-600 dark:text-zinc-300 px-4 py-2">Services</Link>
            {user && user.role === 'user' && (
              <Link to="/emergency" className="block text-red-600 font-bold px-4 py-2">Emergency Help</Link>
            )}
            {user ? (
              <>
                <Link to="/dashboard" className="block text-zinc-600 dark:text-zinc-300 px-4 py-2">Dashboard</Link>
                <button onClick={handleLogout} className="w-full text-left text-red-500 px-4 py-2">Logout</button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Link to="/login">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
