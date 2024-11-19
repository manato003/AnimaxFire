import React, { useState } from 'react';
import { LogIn, Mail, List, CheckCircle2, BarChart2, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { PasswordInput } from './PasswordInput';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { ResetPasswordForm } from './ResetPasswordForm';

const BENEFITS = [
  {
    icon: <List className="w-5 h-5 text-purple-400" />,
    title: 'ウォッチリスト管理',
    description: '気になるアニメを保存して、後で視聴できます'
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    title: '視聴履歴の記録',
    description: '視聴したアニメを記録し、振り返ることができます'
  },
  {
    icon: <BarChart2 className="w-5 h-5 text-yellow-400" />,
    title: '詳細な評価機能',
    description: 'アニメを12項目で評価し、自分だけの記録を残せます'
  },
  {
    icon: <Sparkles className="w-5 h-5 text-blue-400" />,
    title: 'AIによるおすすめ',
    description: 'あなたの好みを分析し、おすすめアニメを提案します'
  }
];

export const LoginPrompt: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, error: authError } = useAuthStore();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false
  });

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (isRegistering && formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    try {
      await signInWithEmail(formData.email, formData.password, isRegistering);
      if (isRegistering) {
        setSuccessMessage('入力されたメールアドレスに確認メールを送信しました。メールに記載されたリンクをクリックすることであなたのメールアドレスが認証されログインが可能になります。');
      }
    } catch (error) {
      setError('認証に失敗しました');
    }
  };

  const handleBack = () => {
    setShowResetForm(false);
    setShowEmailForm(false);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false
    });
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
      <div className="max-w-4xl w-full mx-4 grid md:grid-cols-2 gap-8">
        {/* 左側: ログインフォーム */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center">
          {showResetForm ? (
            <ResetPasswordForm onBack={handleBack} />
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6">
                {isRegistering ? 'アカウント登録' : 'ログイン'}
              </h2>
              
              {authError && (
                <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-lg">
                  {authError}
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-lg">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-green-500/10 text-green-400 rounded-lg">
                  {successMessage}
                </div>
              )}

              {showEmailForm ? (
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="メールアドレス"
                    className="w-full px-4 py-2 bg-black/20 rounded-lg border border-white/10 text-white placeholder-gray-500"
                    required
                  />
                  <div className="space-y-2">
                    <PasswordInput
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="パスワード"
                      showPassword={formData.showPassword}
                      onToggleVisibility={() => setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                      required
                    />
                    {isRegistering && <PasswordStrengthIndicator password={formData.password} />}
                  </div>
                  {isRegistering && (
                    <PasswordInput
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="パスワード（確認）"
                      showPassword={formData.showConfirmPassword}
                      onToggleVisibility={() => setFormData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                      required
                      error={
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'パスワードが一致しません'
                          : undefined
                      }
                    />
                  )}
                  <button
                    type="submit"
                    className="w-full btn bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={isRegistering && formData.password !== formData.confirmPassword}
                  >
                    {isRegistering ? '新規登録' : 'ログイン'}
                  </button>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(!isRegistering);
                        setFormData(prev => ({
                          ...prev,
                          password: '',
                          confirmPassword: '',
                          showPassword: false,
                          showConfirmPassword: false
                        }));
                        setError(null);
                      }}
                      className="w-full text-purple-400 hover:text-purple-300 font-medium"
                    >
                      {isRegistering 
                        ? 'すでにアカウントをお持ちの方はこちら'
                        : 'アカウントをお持ちでない方は新規登録'
                      }
                    </button>

                    {!isRegistering && (
                      <button
                        type="button"
                        onClick={() => setShowResetForm(true)}
                        className="w-full text-purple-400 hover:text-purple-300"
                      >
                        パスワードをお忘れの方はこちら
                      </button>
                    )}

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="text-gray-400 hover:text-gray-300 text-sm"
                      >
                        戻る
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={signInWithGoogle}
                    className="btn w-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Googleでログイン
                  </button>
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="btn w-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    メールアドレスでログイン
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 右側: メリット説明 */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8">
          <h3 className="text-xl font-bold mb-6 text-center">
            アカウント登録のメリット
          </h3>
          <div className="space-y-6">
            {BENEFITS.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-lg">
                    {benefit.title}
                  </h4>
                  <p className="text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};