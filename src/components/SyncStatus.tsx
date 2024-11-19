import React from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useUserStore } from '../store/userStore';

export const SyncStatus: React.FC = () => {
  const { isOnline, isSyncing, lastSynced, syncUserData } = useUserStore();

  const formatLastSynced = (date: Date | null) => {
    if (!date) return '未同期';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return '今';
    if (minutes < 60) return `${minutes}分前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}時間前`;
    return `${Math.floor(hours / 24)}日前`;
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <Cloud className="w-4 h-4 text-green-400" />
      ) : (
        <CloudOff className="w-4 h-4 text-yellow-400" />
      )}
      <span className={isOnline ? 'text-green-400' : 'text-yellow-400'}>
        {isOnline ? 'オンライン' : 'オフライン'}
      </span>
      {isOnline && (
        <>
          <span className="text-gray-400">•</span>
          <span className="text-gray-400">
            最終同期: {formatLastSynced(lastSynced)}
          </span>
          <button
            onClick={() => syncUserData()}
            disabled={isSyncing}
            className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            title="同期"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </>
      )}
    </div>
  );
};