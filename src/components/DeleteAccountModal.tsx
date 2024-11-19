import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PasswordInput } from './PasswordInput';

interface DeleteAccountModalProps {
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onConfirm(password);
    } catch (error) {
      setError('パスワードが正しくありません');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gray-900 rounded-xl p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">アカウントの削除</h2>
        <p className="text-gray-400 mb-6">
          アカウントを削除すると、すべてのデータが完全に削除され、この操作は取り消せません。
          続行するには、パスワードを入力してください。
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワードを入力"
            showPassword={showPassword}
            onToggleVisibility={() => setShowPassword(!showPassword)}
            required
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn bg-white/10 hover:bg-white/20 text-white"
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 btn bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
              disabled={!password || isLoading}
            >
              {isLoading ? '処理中...' : '削除する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};