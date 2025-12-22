'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getBackgroundImageUrl } from '@/lib/imageUtils';

interface AuthFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onSignup: (username: string, email: string, password: string) => Promise<void>;
}

export default function AuthForm({ onLogin, onSignup }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    if (mode === 'signup') {
      if (!email.trim()) {
        setError('이메일을 입력해주세요.');
        return;
      }
      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }
      if (password.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(username, password);
      } else {
        await onSignup(username, email, password);
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 이미지 - 원본 사이즈 고정 */}
      <div 
        className="absolute inset-0 z-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${getBackgroundImageUrl('background/start.jpg')})`,
          backgroundSize: 'auto',
        }}
      />

      {/* 로그인 폼 */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#16213e]/90 backdrop-blur-sm border-4 border-[#8b5cf6] rounded-2xl p-8 shadow-2xl shadow-[#8b5cf6]/30">
          {/* 로고 영역 */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎮</div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Archive World
            </h1>
            <p className="text-[#8b5cf6] text-sm">엔티티를 수집하고 성장시키세요</p>
          </div>

          {/* 탭 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                mode === 'login'
                  ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/50'
                  : 'bg-[#1a1a2e] text-[#e5e7eb] hover:bg-[#8b5cf6]/20'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/50'
                  : 'bg-[#1a1a2e] text-[#e5e7eb] hover:bg-[#8b5cf6]/20'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 아이디 */}
            <div>
              <label className="block text-[#e5e7eb] text-sm font-bold mb-2">
                아이디
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="w-full px-4 py-3 bg-[#1a1a2e] border-2 border-[#8b5cf6]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6] transition-all"
                disabled={loading}
              />
            </div>

            {/* 이메일 (회원가입 시만) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[#e5e7eb] text-sm font-bold mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  className="w-full px-4 py-3 bg-[#1a1a2e] border-2 border-[#8b5cf6]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6] transition-all"
                  disabled={loading}
                />
              </div>
            )}

            {/* 비밀번호 */}
            <div>
              <label className="block text-[#e5e7eb] text-sm font-bold mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 bg-[#1a1a2e] border-2 border-[#8b5cf6]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6] transition-all"
                disabled={loading}
              />
            </div>

            {/* 비밀번호 확인 (회원가입 시만) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[#e5e7eb] text-sm font-bold mb-2">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="w-full px-4 py-3 bg-[#1a1a2e] border-2 border-[#8b5cf6]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6] transition-all"
                  disabled={loading}
                />
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-3">
                <p className="text-red-200 text-sm text-center">{error}</p>
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#8b5cf6] text-white font-bold rounded-lg hover:bg-[#a78bfa] transition-all shadow-lg shadow-[#8b5cf6]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
