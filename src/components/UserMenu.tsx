import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { LogOut, User } from 'lucide-react';
import { SyncStatus } from './SyncStatus';

export const UserMenu: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <User className="w-8 h-8 p-1 rounded-full bg-white/10" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-xl shadow-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <p className="font-medium truncate">{user.displayName}</p>
            <p className="text-sm text-gray-400 truncate">{user.email}</p>
            <div className="mt-2">
              <SyncStatus />
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center gap-2 text-red-400"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
};