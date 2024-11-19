import React, { memo } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
  required?: boolean;
  error?: string;
}

export const PasswordInput = memo(({ 
  value, 
  onChange, 
  placeholder,
  showPassword,
  onToggleVisibility,
  required = false,
  error
}: PasswordInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    onChange(e);
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2 bg-black/20 rounded-lg border text-white placeholder-gray-500 pr-10 ${
            error ? 'border-red-500' : 'border-white/10'
          }`}
          required={required}
          autoComplete={placeholder.includes('確認') ? 'new-password' : undefined}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleVisibility();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});