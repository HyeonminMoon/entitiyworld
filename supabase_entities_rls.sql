-- entities 테이블에 RLS 활성화 및 인증된 사용자만 읽기 권한 추가
-- Supabase SQL Editor에서 실행하세요

-- RLS 활성화
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자만 entities를 읽을 수 있도록 정책 추가
CREATE POLICY "Authenticated users can read entities" 
  ON entities 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- maps 테이블도 인증된 사용자만 읽기 권한 추가
ALTER TABLE maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read maps" 
  ON maps 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- 참고:
-- ✅ entities, maps: 게임 마스터 데이터 (인증된 유저만 READ-ONLY)
-- ✅ user_entities: 개인 엔티티 (자신의 것만 접근, 이미 설정됨)
-- ✅ archives: 개인 도감 (자신의 것만 접근, 이미 설정됨)
-- ✅ profiles: 개인 프로필 (자신의 것만 접근, 이미 설정됨)
