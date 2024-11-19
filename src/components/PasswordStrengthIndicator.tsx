import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const getStrength = (): { strength: number; label: string; color: string; requirements: string[] } => {
    let strength = 0;
    const requirements: string[] = [];
    
    if (password.length >= 8) {
      strength++;
      requirements.push('✓ 8文字以上');
    } else {
      requirements.push('✗ 8文字以上');
    }
    
    if (/[A-Z]/.test(password)) {
      strength++;
      requirements.push('✓ 大文字を含む');
    } else {
      requirements.push('✗ 大文字を含む');
    }
    
    if (/[a-z]/.test(password)) {
      strength++;
      requirements.push('✓ 小文字を含む');
    } else {
      requirements.push('✗ 小文字を含む');
    }
    
    if (/[0-9]/.test(password)) {
      strength++;
      requirements.push('✓ 数字を含む');
    } else {
      requirements.push('✗ 数字を含む');
    }
    
    if (/[^A-Za-z0-9]/.test(password)) {
      strength++;
      requirements.push('✓ 記号を含む');
    } else {
      requirements.push('✗ 記号を含む');
    }

    const strengthMap = {
      0: { label: '弱すぎます', color: 'bg-red-500' },
      1: { label: '弱い', color: 'bg-orange-500' },
      2: { label: '普通', color: 'bg-yellow-500' },
      3: { label: '強い', color: 'bg-green-500' },
      4: { label: 'とても強い', color: 'bg-blue-500' },
      5: { label: '最強', color: 'bg-purple-500' }
    };

    return {
      strength,
      label: strengthMap[strength as keyof typeof strengthMap].label,
      color: strengthMap[strength as keyof typeof strengthMap].color,
      requirements
    };
  };

  const { strength, label, color, requirements } = getStrength();
  const segments = Array.from({ length: 5 }, (_, i) => i < strength);

  if (!password) return null;

  return (
    <div className="space-y-2 bg-black/20 rounded-lg p-3">
      <div className="space-y-1">
        <div className="flex gap-1">
          {segments.map((active, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                active ? color : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-400">
          パスワードの強度: <span className={`font-medium ${color.replace('bg-', 'text-')}`}>{label}</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={`${
              req.startsWith('✓') ? 'text-green-400' : 'text-gray-400'
            }`}
          >
            {req}
          </div>
        ))}
      </div>
    </div>
  );
};