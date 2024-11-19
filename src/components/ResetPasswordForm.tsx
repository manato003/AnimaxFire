import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';

interface ResetPasswordFormProps {
  onBack: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setError('このメールアドレスのアカウントは存在しません');
      } else {
        setError('パスワードリセットメールの送信に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <Mail className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-4">
          パスワードリセットメールを送信しました
        </h3>
        <p className="text-gray-400 mb-6">
          メールに記載されたリンクをクリックして、パスワードを再設定してください。
        </p>
        <button
          onClick={onBack}
          className="btn bg-purple-600 hover:bg-purple-700 text-white"
        >
          ログイン画面に戻る
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">パスワードをリセット</h3>
      <p className="text-gray-400 mb-6">
        登録したメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          className="w-full px-4 py-2 bg-black/20 rounded-lg border border-white/10 text-white placeholder-gray-500"
          required
        />
        <div className="space-y-3">
          <button
            type="submit"
            className="w-full btn bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? '送信中...' : 'リセットメールを送信'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full text-gray-400 hover:text-gray-300"
          >
            戻る
          </button>
        </div>
      </form>
    </div>
  );
};