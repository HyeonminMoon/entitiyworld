# [PRD] 아카이브 월드 (Archive World)

**문서 버전**: v2.0 (Final)  
**작성 일자**: 2025. 12. 17  
**작성자**: PM & Development Team

---

## 1. 개요 (Project Overview)

### 1.1 제품 정의
**"붕괴된 아카이브의 데이터를 복원하라."**

2000년대 레트로 웹 게임 감성을 재해석한 반응형 클리커 & 수집형 RPG.

### 1.2 기획 배경 및 의도
- **피로도 제거**: 복잡한 현대 게임의 숙제(Daily Quest)와 가챠 스트레스를 제거.
- **직관적 보상**: '클릭(노력)'과 '확률(운)'이 적절히 조화된 정직한 성장 체감 제공.
- **수집 본능**: 미지의 데이터(Entity)를 발견하고 도감을 채우는 원초적 재미 추구.

### 1.3 개발 범위 (MVP)
- **맵**: 6개 전체 (Forest, Fire, Water, Electric, Stone, Chaos)
- **엔티티**: 52종 (타입별 10종 + 레전드 2종)
- **핵심 시스템**: 훈련, 전투, 성장, 포획, 도감

---

## 2. 세계관 (Worldview)

- **The Archive**: 세상의 모든 지식과 생명체가 기록된 거대한 데이터 도서관.
- **The Event**: 원인 불명의 오류로 아카이브가 붕괴, 기록된 생명체들이 '데이터 파편'이 되어 흩어짐.
- **Role**: 플레이어는 관리자가 되어 흩어진 파편을 모아 **'엔티티(Entity)'**로 실체화(복원)해야 함.

---

## 3. 핵심 플레이 루프 (Core Loop)

1. **Gather (훈련)**: 반응형 클릭으로 데이터 조각(포인트) 확보.
2. **Grow (성장)**: 포인트로 엔티티의 5대 스탯 강화 (무한 성장).
3. **Explore (탐색)**: 속성별 사냥터에서 턴제 전투 및 데이터 파밍.
4. **Capture (포획)**: 전투 승리 후 확률에 따라 엔티티 포획 → 도감 등록 & 가방 보관.

---

## 4. 상세 시스템 기획 (Functional Specs)

### 4.1 엔티티 스탯 시스템

#### **5대 스탯 정의**
| 스탯명 | 영문 | 역할 |
|--------|------|------|
| 체력 | HP (Hit Points) | 전투 생존력. 0이 되면 패배 |
| 공격력 | ATK (Attack) | 물리 데미지 |
| 방어력 | DEF (Defense) | 물리 데미지 감소 |
| 마법공격력 | MATK (Magic Attack) | 마법 데미지 |
| 마법방어력 | MDEF (Magic Defense) | 마법 데미지 감소 |

#### **엔티티 속성**
각 엔티티는 다음 속성을 가집니다:
```json
{
  "id": 1,
  "name": "water_otter",
  "display_name": "Water Otter",
  "element": "water",
  "attack_type": "physical", // or "magic"
  "rarity": "normal", // normal, rare, unique, legend
  "min_stats": {
    "hp": 50,
    "atk": 5,
    "def": 3,
    "matk": 2,
    "mdef": 4
  },
  "max_stats": {
    "hp": 60,
    "atk": 10,
    "def": 8,
    "matk": 5,
    "mdef": 9
  },
  "image_id": 1 // open/1.png, close/1.png
}
```

#### **개체값 생성 로직**
- 엔티티 출현 시 `min_stats`와 `max_stats` 사이 랜덤 값 부여
- 예: Water Otter 출현 → HP: 55, ATK: 8, DEF: 6... (매번 다름)

---

### 4.2 훈련 및 재화 시스템

#### **기본 액션**
- 중앙 엔티티 클릭 시: **+1 Point**

#### **리액션 이벤트 (Reaction)**
- 랜덤 위치에 **[데이터 큐브]** 팝업 (1.5초 지속)
- **성공 시**: +30 Point (Critical)
- **실패 시**: 큐브 소멸
- **목적**: 지루한 반복 클릭 방지 + 순발력 게임

#### **포인트 사용처**
1. 엔티티 스탯 강화 (레벨업)
2. 전투 패배 시 HP 회복

---

### 4.3 전투 시스템

#### **전투 방식**
- **턴제 전투**: 플레이어 → 적 → 플레이어 순으로 번갈아 공격
- **전투 중 교체 불가**: 선택한 엔티티로만 싸워야 함

#### **데미지 계산 공식**
```
최종 데미지 = (공격자 ATK - 방어자 DEF) + (공격자 MATK - 방어자 MDEF)

※ 음수 방지: 각 계산 결과가 0 미만이면 0으로 처리
※ 최소 데미지 보장: 최종 데미지가 0이면 1로 고정
```

**예시:**
- 공격자: ATK 20, MATK 15
- 방어자: DEF 8, MDEF 10
- 계산: (20-8) + (15-10) = 12 + 5 = **17 데미지**

#### **승리/패배/도망**
| 상황 | 조건 | 결과 |
|------|------|------|
| 승리 | 적 HP 0 | 포획 확률 판정 + 경험치 획득 |
| 패배 | 내 HP 0 | 포인트 소모하여 HP 회복 필요 |
| 도망 | 버튼 클릭 | 아무것도 얻지 못함 |

#### **패배 시 페널티**
- **포인트 보유 시**: 포인트로 HP 전체 회복 (비용: 현재 레벨 * 10 Point)
- **포인트 부족 시**: 6시간 실시간 대기 후 자동 회복

---

### 4.4 포획 시스템

#### **포획 확률 (Capture Rate)**
| 희귀도 | 기본 확률 | Chaos 맵 |
|--------|-----------|----------|
| Normal | 80% | 90% |
| Rare | 50% | 65% |
| Unique | 25% | 40% |
| Legend | 5% | 15% |

#### **포획 성공 시**
1. **도감 등록**: 해당 엔티티가 도감에 "Open" 상태로 등록
2. **가방 추가**: 개체값이 부여된 엔티티가 가방에 보관됨
3. **중복 가능**: 같은 종류의 엔티티를 여러 마리 보유 가능 (개체값은 다름)

#### **포획 실패 시**
- 도감에 **"Close"** 상태로 등록 (실루엣만 표시, 이름 ???)
- 가방에는 추가되지 않음
- 경험치는 획득

---

### 4.5 도감 & 가방 시스템

#### **도감 (Archive)**
- **목적**: 발견한 엔티티의 종류 기록
- **상태**:
  - `None`: 미발견 (리스트에 표시 안 됨)
  - `Close`: 조우했으나 포획 실패 (실루엣 + ???)
  - `Open`: 포획 성공 (컬러 이미지 + 상세 정보)

#### **가방 (Bag)**
- **목적**: 실제로 보유한 엔티티 관리
- **특징**:
  - 같은 종류 엔티티 중복 보유 가능
  - 각 엔티티는 고유한 개체값 & 레벨 보유
  - 전투 시 가방에서 1마리 선택

---

### 4.6 성장 및 경험치 (Leveling)

#### **레벨 시스템**
- **레벨 제한**: 없음 (Infinite Leveling)
- **경험치 획득**: 전투 승리 시
- **레벨업 효과**: 5대 스탯 모두 +1씩 증가

#### **경험치 테이블**
```
레벨업 필요 경험치 = 100 * (1.2 ^ (현재레벨 - 1))

예시:
Lv 1 → 2: 100 XP
Lv 2 → 3: 120 XP
Lv 3 → 4: 144 XP
Lv 10 → 11: 516 XP
```

#### **스탯 강화 (포인트 소모)**
- 포인트를 소모하여 개별 스탯 강화 가능
- 강화 비용: `현재 스탯값 * 5 Point`
- 예: ATK 10 → 11 강화 시 50 Point 소모

---

### 4.7 맵 및 사냥터 구조 (Map Progression)

#### **맵 목록**
| 순서 | 지역명 (Zone) | 특징 | 출몰 엔티티 ID 대역 | 해금 조건 |
|------|---------------|------|---------------------|-----------|
| 1 | Forest (숲) | 기본 밸런스형 | 21 ~ 30 (Forest Type) | 기본 해금 |
| 2 | Fire (불) | 공격력 중심 | 11 ~ 20 (Fire Type) | Forest 도감 80% |
| 3 | Water (물) | 방어/체력 중심 | 1 ~ 10 (Water Type) | Fire 도감 80% |
| 4 | Electric (전기) | 마법공격 중심 | 31 ~ 40 (Electric Type) | Water 도감 80% |
| 5 | Stone (돌) | 고방어력 (Tanker) | 41 ~ 50 (Rock Type) | Electric 도감 80% |
| 6 | Chaos (혼돈) | End Content | ALL (1~50) + Legend | Stone 도감 80% |

#### **맵 해금 로직**
- 이전 맵의 도감을 80% 이상 채워야 다음 맵 진입 가능
- 예: Forest에 10종이 있다면 8종 이상 포획 시 Fire 맵 해금

---

### 4.8 엔티티 출현 로직 (Spawn Logic)

#### **스탯 생성**
- DB에 정의된 `min_stats` ~ `max_stats` 사이에서 랜덤 결정
- 예: Water Otter (Min_ATK: 5, Max_ATK: 10) → 출현 시 7 부여

#### **희귀도 가중치 (Rarity Weights)**
총합 10 기준 확률:

| 희귀도 | 가중치 | 확률 | Chaos 맵 |
|--------|--------|------|----------|
| Normal | 6.0 | 60% | 50% |
| Rare | 3.0 | 30% | 30% |
| Unique | 0.999 | 9.99% | 15% |
| Legend | 0.001 | 0.01% | 5% |

**Chaos 맵 특전**: Legend 확률 500배 상승 (0.01% → 5%)

---

### 4.9 초기 설정

#### **게임 시작 시**
1. 랜덤으로 Normal 등급 엔티티 1마리 지급
2. Forest 맵에서 시작
3. 초기 포인트: 100 Point

---

## 5. 데이터베이스 설계 (Schema Strategy)

### 5.1 Supabase 테이블 구조

#### **entities (Master Data)**
엔티티 원본 데이터 (Static)

```sql
CREATE TABLE entities (
  id INT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL, -- 예: water_otter
  display_name VARCHAR(100) NOT NULL, -- 예: Water Otter
  element VARCHAR(20) NOT NULL, -- water, fire, forest, electric, stone
  attack_type VARCHAR(20) NOT NULL, -- physical, magic
  rarity VARCHAR(20) NOT NULL, -- normal, rare, unique, legend
  min_hp INT NOT NULL,
  min_atk INT NOT NULL,
  min_def INT NOT NULL,
  min_matk INT NOT NULL,
  min_mdef INT NOT NULL,
  max_hp INT NOT NULL,
  max_atk INT NOT NULL,
  max_def INT NOT NULL,
  max_matk INT NOT NULL,
  max_mdef INT NOT NULL,
  image_id INT NOT NULL, -- 1 → open/1.png, close/1.png
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **user_entities (User Data)**
유저가 보유한 엔티티 (Dynamic)

```sql
CREATE TABLE user_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  entity_id INT NOT NULL REFERENCES entities(id),
  current_level INT DEFAULT 1,
  current_hp INT NOT NULL,
  current_atk INT NOT NULL,
  current_def INT NOT NULL,
  current_matk INT NOT NULL,
  current_mdef INT NOT NULL,
  current_xp INT DEFAULT 0,
  acquired_at TIMESTAMP DEFAULT NOW()
);
```

#### **user_archive (도감)**
유저의 도감 상태

```sql
CREATE TABLE user_archive (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  entity_id INT NOT NULL REFERENCES entities(id),
  status VARCHAR(10) NOT NULL, -- 'close' or 'open'
  first_seen_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, entity_id)
);
```

#### **user_profile (유저 정보)**
유저의 게임 진행 상황

```sql
CREATE TABLE user_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  points INT DEFAULT 100,
  current_map VARCHAR(20) DEFAULT 'forest',
  unlocked_maps TEXT[] DEFAULT ARRAY['forest'],
  main_entity_id UUID REFERENCES user_entities(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 5.2 이미지 저장 전략

#### **파일명 규칙**
```
open/1.png, open/2.png, ... open/52.png
close/1.png, close/2.png, ... close/52.png
```

- **순수 숫자 ID** 사용
- DB의 `entities.image_id`로 매핑
- 간결하고 충돌 없음

#### **저장 위치 (Phase별)**
**Phase 1 (MVP)**: Next.js `public/assets/entities/`
```
public/
└── assets/
    └── entities/
        ├── open/
        │   ├── 1.png
        │   ├── 2.png
        │   └── ...
        └── close/
            ├── 1.png
            ├── 2.png
            └── ...
```

**Phase 2 (확장)**: Supabase Storage로 마이그레이션
```
bucket: entity-images/
├── open/
│   ├── 1.png
│   └── ...
└── close/
    ├── 1.png
    └── ...
```

---

### 5.3 데이터 저장 정책

#### **자동 저장 시점**
- ✅ **전투 종료 시** (승리/패배/도망)
- ✅ **엔티티 포획 성공 시**
- ✅ **레벨업 시**
- ✅ **스탯 강화 시**

#### **실시간 저장 제외**
- ❌ 전투 중 매 턴
- ❌ 클릭할 때마다
- ❌ 리액션 이벤트 발생 시

#### **세션 종료**
- 전투 중 새로고침/종료 시 **진행 중인 전투는 무효**
- 마지막 저장 시점으로 복구

---

## 6. UI/UX 디자인 가이드

### 6.1 레이아웃 구조

```
┌──────────────────────────────────────────┐
│  [로고]    Archive World    [포인트: 150] │
├───────┬────────────────────┬──────────────┤
│       │                    │              │
│  메뉴  │   메인 플레이 영역   │    도감/가방   │
│       │                    │              │
│ 훈련  │  [중앙 엔티티 이미지] │   [리스트]    │
│ 탐색  │   리액션 이벤트 영역  │              │
│ 성장  │                    │              │
│ 도감  │                    │              │
│       │                    │              │
└───────┴────────────────────┴──────────────┘
```

### 6.2 디자인 컨셉
- **시대**: 2000년대 초반 플래시 게임
- **레퍼런스**: 포켓몬 게임 랜드, 에듀몬, 네오펫
- **컬러 팔레트**:
  - Primary: `#1a1a2e` (Deep Navy)
  - Secondary: `#8b5cf6` (Cyber Purple)
  - Accent: `#10b981` (Neon Green)
  - Text: `#e5e7eb` (Light Gray)

### 6.3 폰트
- **헤더**: DungGeunMo (둥근모꼴) 또는 Galmuri (갈무리)
- **본문**: Pretendard 또는 Noto Sans KR

---

## 7. 기술 스택 (Tech Stack)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand or Context API
- **Hosting**: Vercel

### Backend
- **BaaS**: Supabase
  - Authentication
  - PostgreSQL Database
  - Realtime (Optional)
  - Storage (Phase 2)

### Development Tools
- **Linting**: ESLint
- **Formatting**: Prettier
- **Version Control**: Git + GitHub

---

## 8. 개발 로드맵

### Phase 1: MVP (1주)
- [x] 기본 레이아웃
- [ ] 훈련 시스템 (클릭 + 리액션)
- [ ] 전투 시스템 (턴제)
- [ ] 포획 시스템
- [ ] 도감 & 가방 UI
- [ ] Forest 맵 (10종)

### Phase 2: 확장 (1주)
- [ ] 나머지 5개 맵 구현
- [ ] 전체 52종 엔티티 추가
- [ ] 성장 시스템 (레벨업, 스탯 강화)
- [ ] Supabase 연동

### Phase 3: 폴리싱 (3일)
- [ ] 사운드 효과
- [ ] 애니메이션 개선
- [ ] 모바일 반응형 최적화
- [ ] 밸런스 조정

---

## 9. 성공 지표 (KPI)

### 초기 목표 (출시 1개월)
- **DAU**: 100명
- **평균 플레이 타임**: 20분/세션
- **도감 완성률**: 30% 이상
- **7일 리텐션**: 40%

### 게임 밸런스 지표
- 첫 맵 클리어 시간: 30분 ~ 1시간
- 전체 도감 완성: 20시간 이상
- Legend 엔티티 획득: 극저확률 유지 (희소성)

---

## 10. 주요 리스크 & 대응 방안

| 리스크 | 대응 |
|--------|------|
| 클릭 피로도 | 리액션 이벤트로 변화 제공 |
| 전투 지루함 | 빠른 턴 속도 + 애니메이션 |
| 희귀 엔티티 좌절 | Chaos 맵에서 확률 상승 |
| 밸런스 붕괴 | 초기 테스트 플레이 필수 |

---

## 부록: 엔티티 목록 예시

| ID | Name | Display Name | Element | Rarity |
|----|------|--------------|---------|--------|
| 1 | water_otter | Water Otter | Water | Normal |
| 2 | flame_fox | Flame Fox | Fire | Normal |
| 21 | forest_wolf | Forest Wolf | Forest | Normal |
| 51 | chaos_dragon | Chaos Dragon | Chaos | Legend |
| 52 | void_serpent | Void Serpent | Chaos | Legend |

*(전체 52종 리스트는 별도 엑셀 관리)*

---

**문서 끝**
