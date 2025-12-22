'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 이미 로그인되어 있으면 게임 페이지로 리다이렉트
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push('/explore');
    } else {
      setLoading(false);
    }
  };

  // 로그인
  const handleLogin = async (username: string, password: string) => {
    // 1. profiles 테이블에서 username으로 실제 이메일 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username)
      .single();

    if (profileError || !profile) {
      throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    // 2. 조회한 이메일로 로그인
    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (error) {
      throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    router.push('/explore');
  };

  // 회원가입
  const handleSignup = async (username: string, email: string, password: string) => {
    // username을 메타데이터로 저장
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/explore`,
        data: {
          username: username,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // 회원가입 성공 시 자동으로 로그인 세션이 생성됨
    alert('회원가입이 완료되었습니다! 🎉');
    router.push('/explore');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] flex items-center justify-center">
        <div className="text-white text-2xl">로딩 중...</div>
      </div>
    );
  }

  return <AuthForm onLogin={handleLogin} onSignup={handleSignup} />;
}
