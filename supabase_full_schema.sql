-- ====================================
-- Archive World - 전체 데이터베이스 스키마
-- ====================================

-- 1. 엔티티 마스터 테이블 (52종)
CREATE TABLE entities (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  element TEXT NOT NULL CHECK (element IN ('water', 'fire', 'forest', 'electric', 'stone', 'chaos')),
  attack_type TEXT NOT NULL CHECK (attack_type IN ('physical', 'magic')),
  rarity TEXT NOT NULL CHECK (rarity IN ('normal', 'rare', 'unique', 'legend')),
  image_open TEXT NOT NULL,
  image_close TEXT NOT NULL,
  min_hp INTEGER NOT NULL,
  max_hp INTEGER NOT NULL,
  min_atk INTEGER NOT NULL,
  max_atk INTEGER NOT NULL,
  min_def INTEGER NOT NULL,
  max_def INTEGER NOT NULL,
  min_matk INTEGER NOT NULL,
  max_matk INTEGER NOT NULL,
  min_mdef INTEGER NOT NULL,
  max_mdef INTEGER NOT NULL
);

-- 2. 맵 정보 테이블
CREATE TABLE maps (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  min_entity_id INTEGER NOT NULL,
  max_entity_id INTEGER NOT NULL,
  unlock_percentage INTEGER DEFAULT 0,
  description TEXT
);

-- 3. 사용자 프로필 테이블
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 사용자 보유 엔티티 테이블 (가방)
CREATE TABLE user_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entity_id INTEGER REFERENCES entities(id),
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

-- 5. 도감 기록 테이블
CREATE TABLE archives (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entity_id INTEGER REFERENCES entities(id),
  status TEXT NOT NULL CHECK (status IN ('close', 'open')),
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, entity_id)
);

-- ====================================
-- RLS (Row Level Security) 활성화
-- ====================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE archives ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own entities" ON user_entities
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own archives" ON archives
  FOR ALL USING (user_id = auth.uid());

-- ====================================
-- 회원가입 시 프로필 자동 생성 트리거
-- ====================================
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

-- ====================================
-- 엔티티 마스터 데이터 삽입 (52종)
-- ====================================

-- WATER TYPE (1~10)
INSERT INTO entities VALUES
(1, 'water_otter', 'Water Otter', 'water', 'physical', 'normal', '1.png', '1.png', 50, 70, 8, 12, 6, 10, 4, 6, 7, 11),
(2, 'water_turtle', 'Water Turtle', 'water', 'physical', 'normal', '2.png', '2.png', 60, 80, 6, 10, 10, 15, 3, 5, 9, 13),
(3, 'water_fish', 'Water Fish', 'water', 'magic', 'normal', '3.png', '3.png', 45, 65, 5, 8, 5, 8, 10, 15, 8, 12),
(4, 'water_seal', 'Water Seal', 'water', 'physical', 'rare', '4.png', '4.png', 70, 95, 12, 18, 10, 15, 6, 10, 10, 15),
(5, 'water_dolphin', 'Water Dolphin', 'water', 'magic', 'rare', '5.png', '5.png', 65, 90, 8, 12, 8, 12, 15, 22, 12, 18),
(6, 'water_jellyfish', 'Water Jellyfish', 'water', 'magic', 'normal', '6.png', '6.png', 40, 60, 4, 7, 4, 7, 12, 18, 10, 15),
(7, 'water_crab', 'Water Crab', 'water', 'physical', 'normal', '7.png', '7.png', 55, 75, 10, 15, 12, 18, 3, 5, 6, 10),
(8, 'water_whale', 'Water Whale', 'water', 'physical', 'unique', '8.png', '8.png', 100, 140, 15, 25, 15, 25, 10, 15, 15, 25),
(9, 'water_octopus', 'Water Octopus', 'water', 'magic', 'rare', '9.png', '9.png', 60, 85, 7, 11, 7, 11, 16, 24, 14, 20),
(10, 'water_shark', 'Water Shark', 'water', 'physical', 'rare', '10.png', '10.png', 75, 100, 18, 26, 10, 15, 5, 8, 8, 12);

-- FIRE TYPE (11~20)
INSERT INTO entities VALUES
(11, 'fire_fox', 'Fire Fox', 'fire', 'physical', 'normal', '11.png', '11.png', 45, 65, 12, 18, 5, 8, 8, 12, 6, 10),
(12, 'fire_lizard', 'Fire Lizard', 'fire', 'physical', 'normal', '12.png', '12.png', 50, 70, 14, 20, 6, 10, 6, 10, 5, 8),
(13, 'fire_bird', 'Fire Bird', 'fire', 'magic', 'normal', '13.png', '13.png', 40, 60, 8, 12, 4, 7, 14, 20, 7, 11),
(14, 'fire_wolf', 'Fire Wolf', 'fire', 'physical', 'rare', '14.png', '14.png', 65, 90, 18, 26, 8, 12, 10, 15, 8, 12),
(15, 'fire_tiger', 'Fire Tiger', 'fire', 'physical', 'rare', '15.png', '15.png', 70, 95, 20, 28, 10, 15, 8, 12, 9, 14),
(16, 'fire_snake', 'Fire Snake', 'fire', 'magic', 'normal', '16.png', '16.png', 45, 65, 6, 10, 5, 8, 12, 18, 8, 12),
(17, 'fire_bat', 'Fire Bat', 'fire', 'physical', 'normal', '17.png', '17.png', 35, 55, 15, 22, 4, 7, 7, 11, 5, 8),
(18, 'fire_dragon', 'Fire Dragon', 'fire', 'physical', 'unique', '18.png', '18.png', 95, 130, 25, 35, 12, 20, 15, 22, 12, 18),
(19, 'fire_phoenix', 'Fire Phoenix', 'fire', 'magic', 'unique', '19.png', '19.png', 80, 110, 12, 18, 10, 15, 28, 38, 18, 25),
(20, 'fire_lion', 'Fire Lion', 'fire', 'physical', 'rare', '20.png', '20.png', 75, 100, 22, 30, 12, 18, 8, 12, 10, 15);

-- FOREST TYPE (21~30)
INSERT INTO entities VALUES
(21, 'forest_rabbit', 'Forest Rabbit', 'forest', 'physical', 'normal', '21.png', '21.png', 40, 60, 10, 15, 6, 10, 5, 8, 7, 11),
(22, 'forest_deer', 'Forest Deer', 'forest', 'physical', 'normal', '22.png', '22.png', 55, 75, 8, 12, 8, 12, 6, 10, 10, 15),
(23, 'forest_owl', 'Forest Owl', 'forest', 'magic', 'normal', '23.png', '23.png', 45, 65, 6, 10, 5, 8, 12, 18, 9, 14),
(24, 'forest_bear', 'Forest Bear', 'forest', 'physical', 'rare', '24.png', '24.png', 80, 110, 16, 24, 14, 20, 6, 10, 10, 15),
(25, 'forest_wolf', 'Forest Wolf', 'forest', 'physical', 'rare', '25.png', '25.png', 65, 90, 15, 22, 10, 15, 8, 12, 9, 14),
(26, 'forest_squirrel', 'Forest Squirrel', 'forest', 'physical', 'normal', '26.png', '26.png', 35, 55, 12, 18, 5, 8, 4, 7, 6, 10),
(27, 'forest_hawk', 'Forest Hawk', 'forest', 'physical', 'normal', '27.png', '27.png', 42, 62, 14, 20, 6, 10, 6, 10, 7, 11),
(28, 'forest_treant', 'Forest Treant', 'forest', 'physical', 'unique', '28.png', '28.png', 100, 140, 18, 28, 20, 30, 8, 12, 18, 26),
(29, 'forest_fairy', 'Forest Fairy', 'forest', 'magic', 'rare', '29.png', '29.png', 50, 75, 6, 10, 6, 10, 18, 26, 15, 22),
(30, 'forest_elk', 'Forest Elk', 'forest', 'physical', 'rare', '30.png', '30.png', 70, 95, 14, 20, 12, 18, 8, 12, 12, 18);

-- ELECTRIC TYPE (31~40)
INSERT INTO entities VALUES
(31, 'electric_mouse', 'Electric Mouse', 'electric', 'magic', 'normal', '31.png', '31.png', 40, 60, 6, 10, 5, 8, 12, 18, 8, 12),
(32, 'electric_cat', 'Electric Cat', 'electric', 'magic', 'normal', '32.png', '32.png', 45, 65, 7, 11, 6, 10, 14, 20, 10, 15),
(33, 'electric_eagle', 'Electric Eagle', 'electric', 'magic', 'normal', '33.png', '33.png', 50, 70, 8, 12, 6, 10, 15, 22, 9, 14),
(34, 'electric_wolf', 'Electric Wolf', 'electric', 'magic', 'rare', '34.png', '34.png', 65, 90, 10, 15, 8, 12, 18, 26, 12, 18),
(35, 'electric_dragon', 'Electric Dragon', 'electric', 'magic', 'unique', '35.png', '35.png', 85, 120, 12, 18, 10, 15, 28, 38, 18, 26),
(36, 'electric_snake', 'Electric Snake', 'electric', 'magic', 'normal', '36.png', '36.png', 42, 62, 6, 10, 5, 8, 13, 19, 9, 14),
(37, 'electric_tiger', 'Electric Tiger', 'electric', 'magic', 'rare', '37.png', '37.png', 70, 95, 12, 18, 10, 15, 20, 28, 14, 20),
(38, 'electric_bird', 'Electric Bird', 'electric', 'magic', 'normal', '38.png', '38.png', 38, 58, 5, 9, 4, 7, 14, 20, 8, 12),
(39, 'electric_unicorn', 'Electric Unicorn', 'electric', 'magic', 'rare', '39.png', '39.png', 68, 93, 10, 15, 9, 14, 22, 30, 16, 23),
(40, 'electric_fox', 'Electric Fox', 'electric', 'magic', 'rare', '40.png', '40.png', 60, 85, 9, 14, 7, 11, 19, 27, 13, 19);

-- STONE TYPE (41~50)
INSERT INTO entities VALUES
(41, 'stone_golem', 'Stone Golem', 'stone', 'physical', 'normal', '41.png', '41.png', 70, 95, 10, 15, 18, 26, 3, 5, 15, 22),
(42, 'stone_turtle', 'Stone Turtle', 'stone', 'physical', 'normal', '42.png', '42.png', 80, 110, 8, 12, 20, 28, 4, 6, 18, 25),
(43, 'stone_bear', 'Stone Bear', 'stone', 'physical', 'rare', '43.png', '43.png', 90, 120, 14, 20, 22, 32, 5, 8, 18, 26),
(44, 'stone_rhino', 'Stone Rhino', 'stone', 'physical', 'rare', '44.png', '44.png', 85, 115, 18, 26, 20, 30, 4, 6, 16, 24),
(45, 'stone_crab', 'Stone Crab', 'stone', 'physical', 'normal', '45.png', '45.png', 65, 90, 12, 18, 16, 24, 3, 5, 14, 20),
(46, 'stone_scorpion', 'Stone Scorpion', 'stone', 'physical', 'normal', '46.png', '46.png', 60, 85, 14, 20, 14, 22, 4, 6, 12, 18),
(47, 'stone_guardian', 'Stone Guardian', 'stone', 'physical', 'unique', '47.png', '47.png', 110, 150, 16, 24, 28, 40, 6, 10, 24, 35),
(48, 'stone_dragon', 'Stone Dragon', 'stone', 'physical', 'unique', '48.png', '48.png', 100, 140, 20, 30, 25, 38, 8, 12, 22, 32),
(49, 'stone_elephant', 'Stone Elephant', 'stone', 'physical', 'rare', '49.png', '49.png', 95, 125, 16, 24, 24, 35, 5, 8, 20, 28),
(50, 'stone_titan', 'Stone Titan', 'stone', 'physical', 'rare', '50.png', '50.png', 88, 118, 18, 26, 26, 36, 6, 10, 22, 30);

-- CHAOS/LEGEND TYPE (51~52)
INSERT INTO entities VALUES
(51, 'chaos_dragon', 'Chaos Dragon', 'chaos', 'physical', 'legend', '51.png', '51.png', 150, 200, 35, 50, 30, 45, 35, 50, 30, 45),
(52, 'void_serpent', 'Void Serpent', 'chaos', 'magic', 'legend', '52.png', '52.png', 140, 190, 30, 45, 25, 40, 40, 55, 35, 50);

-- ====================================
-- 맵 정보 데이터 삽입 (6개)
-- ====================================
INSERT INTO maps VALUES
('water', 'Water 맵', 1, 10, 0, '물 속성 엔티티가 출몰하는 맵'),
('fire', 'Fire 맵', 11, 20, 0, '불 속성 엔티티가 출몰하는 맵'),
('forest', 'Forest 맵', 21, 30, 0, '숲 속성 엔티티가 출몰하는 맵'),
('electric', 'Electric 맵', 31, 40, 0, '전기 속성 엔티티가 출몰하는 맵'),
('stone', 'Stone 맵', 41, 50, 0, '돌 속성 엔티티가 출몰하는 맵'),
('chaos', 'Chaos 맵', 1, 52, 80, '모든 엔티티가 출몰하며, 레전드 확률이 500배 증가하는 특수 맵');

-- ====================================
-- 완료!
-- ====================================
-- 이제 Supabase Authentication 설정에서:
-- 1. "Enable Email Confirmations" 비활성화
-- 2. Site URL: http://localhost:3000
-- 를 설정하면 모든 준비 완료!
