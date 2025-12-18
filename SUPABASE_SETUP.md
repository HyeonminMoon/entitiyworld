# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성
1. https://supabase.com 접속
2. "Start your project" 클릭
3. 프로젝트 이름, 비밀번호, 리전(Northeast Asia - Seoul) 선택
4. 프로젝트 생성 완료 대기 (1-2분)

## 2. API 키 복사
1. 좌측 메뉴에서 ⚙️ Settings → API 클릭
2. **Project URL** 복사
3. **anon public** 키 복사

## 3. 환경변수 설정
`.env.local` 파일에 복사한 값 입력:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-key
```

## 4. 데이터베이스 테이블 생성
Supabase SQL Editor에서 아래 SQL 실행:

```sql
-- 사용자 프로필 테이블
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 보유 엔티티 테이블
CREATE TABLE user_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entity_id INTEGER NOT NULL,
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  current_hp INTEGER NOT NULL,
  stat_hp INTEGER NOT NULL,
  stat_atk INTEGER NOT NULL,
  stat_def INTEGER NOT NULL,
  stat_matk INTEGER NOT NULL,
  stat_mdef INTEGER NOT NULL,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 도감 기록 테이블
CREATE TABLE archives (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entity_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('close', 'open')),
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, entity_id)
);

-- RLS (Row Level Security) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE archives ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (사용자는 자신의 데이터만 접근)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own entities" ON user_entities
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own archives" ON archives
  FOR ALL USING (user_id = auth.uid());

-- 회원가입 시 자동 프로필 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 5. Auth 설정
1. Supabase → Authentication → Settings
2. "Enable Email Confirmations" **비활성화** (이메일 인증 제거)
3. Site URL: `http://localhost:3000` 입력

## 완료!
이제 `.env.local` 파일을 저장하고 개발 서버를 재시작하세요.
