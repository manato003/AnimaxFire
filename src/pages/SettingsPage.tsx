import React, { useState } from 'react';
import { Settings2, Flag, User, Mail, Lock, Trash2, LogOut } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';
import { auth } from '../config/firebase';
import { 
  updateEmail, 
  updatePassword, 
  deleteUser, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  sendEmailVerification 
} from 'firebase/auth';
import { PasswordInput } from '../components/PasswordInput';
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator';
import { DeleteAccountModal } from '../components/DeleteAccountModal';

export const SettingsPage: React.FC = () => {
  const { showOnlyJapanese, setShowOnlyJapanese } = useSettingsStore();
  const { user, signOut } = useAuthStore();
  
  const [emailChangeForm, setEmailChangeForm] = useState({
    currentPassword: '',
    newEmail: '',
    showPassword: false
  });

  const [passwordChangeForm, setPasswordChangeForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleReauthenticate = async (password: string) => {
    if (!user?.email) return false;
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      setError('現在のパスワードが正しくありません');
      return false;
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) return;
    
    try {
      if (await handleReauthenticate(emailChangeForm.currentPassword)) {
        await updateEmail(user, emailChangeForm.newEmail);
        await sendEmailVerification(user);
        setSuccess('新しいメールアドレスに確認メールを送信しました。メールのリンクをクリックして変更を完了してください。');
        setEmailChangeForm({
          currentPassword: '',
          newEmail: '',
          showPassword: false
        });
      }
    } catch (error) {
      setError('メールアドレスの更新に失敗しました');
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) return;
    if (passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword) {
      setError('新しいパスワードが一致しません');
      return;
    }

    try {
      if (await handleReauthenticate(passwordChangeForm.currentPassword)) {
        await updatePassword(user, passwordChangeForm.newPassword);
        setSuccess('パスワードを更新しました');
        setPasswordChangeForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          showCurrentPassword: false,
          showNewPassword: false,
          showConfirmPassword: false
        });
      }
    } catch (error) {
      setError('パスワードの更新に失敗しました');
    }
  };

  const handleAccountDelete = async (password: string) => {
    if (!user) return;

    try {
      if (await handleReauthenticate(password)) {
        await deleteUser(user);
        setShowDeleteModal(false);
        setSuccess('アカウントを削除しました');
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings2 className="w-8 h-8 text-purple-400" />
        <h1 className="text-3xl font-bold">設定</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 text-green-400 rounded-lg">
          {success}
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold">アカウント管理</h2>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleEmailUpdate} className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                メールアドレスの変更
              </h3>
              <input
                type="email"
                value={emailChangeForm.newEmail}
                onChange={(e) => setEmailChangeForm(prev => ({ ...prev, newEmail: e.target.value }))}
                placeholder="新しいメールアドレス"
                className="w-full px-4 py-2 bg-black/20 rounded-lg border border-white/10 text-white placeholder-gray-500"
              />
              <PasswordInput
                value={emailChangeForm.currentPassword}
                onChange={(e) => setEmailChangeForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="現在のパスワード"
                showPassword={emailChangeForm.showPassword}
                onToggleVisibility={() => setEmailChangeForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              />
              <button
                type="submit"
                className="btn bg-purple-600 hover:bg-purple-700 text-white"
              >
                メールアドレスを更新
              </button>
            </form>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                パスワードの変更
              </h3>
              <PasswordInput
                value={passwordChangeForm.currentPassword}
                onChange={(e) => setPasswordChangeForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="現在のパスワード"
                showPassword={passwordChangeForm.showCurrentPassword}
                onToggleVisibility={() => setPasswordChangeForm(prev => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }))}
              />
              <div className="space-y-2">
                <PasswordInput
                  value={passwordChangeForm.newPassword}
                  onChange={(e) => setPasswordChangeForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="新しいパスワード"
                  showPassword={passwordChangeForm.showNewPassword}
                  onToggleVisibility={() => setPasswordChangeForm(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                />
                <PasswordStrengthIndicator password={passwordChangeForm.newPassword} />
              </div>
              <PasswordInput
                value={passwordChangeForm.confirmPassword}
                onChange={(e) => setPasswordChangeForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="新しいパスワード（確認）"
                showPassword={passwordChangeForm.showConfirmPassword}
                onToggleVisibility={() => setPasswordChangeForm(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                error={
                  passwordChangeForm.confirmPassword && 
                  passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword
                    ? 'パスワードが一致しません'
                    : undefined
                }
              />
              <button
                type="submit"
                className="btn bg-purple-600 hover:bg-purple-700 text-white"
                disabled={
                  passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword ||
                  !passwordChangeForm.newPassword
                }
              >
                パスワードを更新
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <button
                onClick={signOut}
                className="btn w-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                ログアウト
              </button>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                アカウントを削除
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">表示設定</h2>
          
          <div>
            <h3 className="font-medium mb-3">コンテンツフィルター</h3>
            <button
              onClick={() => setShowOnlyJapanese(!showOnlyJapanese)}
              className="flex items-center gap-3 cursor-pointer w-full"
            >
              <div
                className={`w-14 h-8 rounded-full p-1 transition-colors ${
                  showOnlyJapanese ? 'bg-purple-600' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    showOnlyJapanese ? 'translate-x-6' : ''
                  }`}
                />
              </div>
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-purple-400" />
                日本のアニメのみ表示
              </div>
            </button>
            <p className="text-sm text-gray-400 mt-2 ml-[4.5rem]">
              オンにすると、日本で制作されたアニメのみが表示されます
            </p>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleAccountDelete}
        />
      )}
    </div>
  );
};