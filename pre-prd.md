# [PRD] 아카이브 월드 (Archive World)

**문서 버전**: v1.0 (Final)  
**작성 일자**: 2025. 12. 17  
**작성자**: PM & Gemini

---

## 1. 개요 (Project Overview)

### 1.1 제품 정의
**"붕괴된 아카이브의 데이터를 복원하라."**

2000년대 레트로 웹 게임 감성을 재해석한 반응형 클리커 & 수집형 RPG.

### 1.2 기획 배경 및 의도
- **피로도 제거**: 복잡한 현대 게임의 숙제(Daily Quest)와 가챠 스트레스를 제거.
- **직관적 보상**: '클릭(노력)'과 '확률(운)'이 적절히 조화된 정직한 성장 체감 제공.
- **수집 본능**: 미지의 데이터(Entity)를 발견하고 도감을 채우는 원초적 재미 추구.

---

## 2. 세계관 (Worldview)

- **The Archive**: 세상의 모든 지식과 생명체가 기록된 거대한 데이터 도서관.
- **The Event**: 원인 불명의 오류로 아카이브가 붕괴, 기록된 생명체들이 '데이터 파편'이 되어 흩어짐.
- **Role**: 플레이어는 관리자가 되어 흩어진 파편을 모아 **'엔티티(Entity)'**로 실체화(복원)해야 함.

---

## 3. 핵심 플레이 루프 (Core Loop)

1. **Gather (훈련)**: 반응형 클릭으로 데이터 조각(포인트) 확보.
2. **Grow (성장)**: 포인트로 엔티티의 5대 스탯 강화 (무한 성장).
3. **Explore (탐색)**: 속성별 사냥터에서 자동 전투 및 데이터 파밍.
4. **Restore (복원)**: 전투 승리 후 획득한 코어로 엔티티 복원 → 도감 등록.

---

## 4. 상세 시스템 기획 (Functional Specs)

### 4.1 훈련 및 재화 시스템

- **기본 액션**: 중앙 엔티티 클릭 시 +1 Point.
- **리액션 이벤트 (Reaction)**: 랜덤 위치에 [데이터 큐브] 팝업 (1.5초 지속).
  - **성공 시**: +30 Point (Critical).
  - **실패 시**: 큐브 소멸.
- **목적**: 지루한 반복 클릭을 방지하고 '순발력' 게임의 재미 부여.

### 4.2 맵 및 사냥터 구조 (Map Progression)

사냥터는 순차적으로 해금되며, 각 맵은 특정 ID 대역의 엔티티가 출몰합니다.

| 순서 | 지역명 (Zone) | 특징 | 출몰 엔티티 ID 대역 |
|------|---------------|------|---------------------|
| 1 | Forest (숲) | 기본 밸런스형 | 21 ~ 30 (Forest Type) |
| 2 | Fire (불) | 공격력 중심 | 11 ~ 20 (Fire Type) |
| 3 | Water (물) | 방어/체력 중심 | 00 ~ 10 (Water Type) |
| 4 | Electric (전기) | 마법공격 중심 | 31 ~ 40 (Electric Type) |
| 5 | Stone (돌) | 고방어력 (Tanker) | 41 ~ 50 (Rock Type) |
| 6 | Chaos (혼돈) | End Content | ALL (00~50) + Legend |

### 4.3 엔티티 출현 로직 (Spawn Logic)

- **스탯 생성**: DB에 정의된 Min ~ Max 값 사이에서 랜덤 결정.
  - 예: Water Otter (Min_ATK: 10, Max_ATK: 15) → 출현 시 13 부여.
  
- **희귀도 가중치 (Rarity Weights)**: 총합 10 기준 확률.
  - **Normal (6.0)**: 60%
  - **Rare (3.0)**: 30%
  - **Unique (0.999)**: 9.99%
  - **Legend (0.001)**: 0.01% (극악의 확률)
  
- **Chaos 맵 특전**: Legend 확률 10배 상승 (0.01 → 0.1).

### 4.4 성장 및 경험치 (Leveling)

- **레벨 제한**: 없음 (Infinite Leveling).
- **경험치 테이블**: 레벨이 오를수록 요구 경험치가 기하급수적 증가.
  - 공식: `ReqXP = Base * (Multiplier ^ (Lv-1))`

### 4.5 아카이브(도감) 상태

- **None**: 미발견 (리스트에 없음).
- **Close (실루엣)**: 조우했으나 포획 실패. (회색 실루엣 + 이름 ???)
- **Open (등록)**: 포획 성공. (풀 컬러 + 상세 정보 해금)

---

## 5. 데이터베이스 설계 (Schema Strategy)

Supabase (PostgreSQL) 사용 기준.

### 5.1 Entity Master (Static Data)

게임에 등장하는 모든 몬스터의 원본 데이터.

```json
{
  "id": 1, 
  "name": "_water_otter",
  "element": "water", 
  "min_stats": {"atk": 5, "hp": 50...},
  "max_stats": {"atk": 10, "hp": 60...},
  "rarity": "normal",
  "image_url": "/assets/entities/001._water_otter.png"
}
```

### 5.2 User Collection (Dynamic Data)

유저가 획득한 엔티티 정보.

```json
{
  "user_id": "uuid",
  "entity_id": 1,
  "status": "open", // or "close"
  "current_level": 5,
  "current_stats": {"atk": 12, "hp": 100...} // 성장치 반영
}
```

---

## 6. UI/UX 디자인 가이드

- **컨셉**: 2000년대 초반 '포켓몬 게임 랜드', '에듀몬' 스타일.
- **레이아웃**: 3단 고정형 (좌:메뉴 / 중:플레이 / 우:도감).
- **컬러**: Deep Navy, Cyber Purple, Neon Green (포인트).
- **폰트**: 픽셀(Pixel) 폰트 또는 돋움체 계열.

---

## 7. 기술 스택 (Tech Stack)

### Frontend:
- **Framework**: Next.js (React) + TypeScript
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

### Backend:
- **BaaS**: Supabase (Auth, Database, Realtime)
