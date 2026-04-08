# Comedian 패러디 UI · 동적 줌 구현 요약

## 목적

Maurizio Cattelan *Comedian* 풍의 전시 연출: Art-Speak, 보안선, 판매 레드 닷, COA(두루마리), 테이프된 과일 기준 바운딩 박스 줌, **미테이프 종료 시 허구 낙찰**.

## 파일별 변경

### `index.html`

- `film-grain`, `security-line`, `art-label-wrap` + `sold-dot`.
- `art-label`: `art-label-artist` / `art-label-title-line` / `art-label-medium` 구조(종료 시에만 표시·내용은 JS).
- `#end-screen`: `void-placard`, `end-screen__footer`(리셋 버튼), `coa-scroll-dock` = 접힌 `certificate--panel` + `coa-scroll-roll` 버튼.
- COA 본문에 작품 설명(`coa-description`), 벽면 노트(`coa-wall-note`), 에디션(`coa-edition`), 보증 문구(`coa-guarantee`).

### `style.css`

- `#end-screen`: `justify-content: flex-end`로 하단 버튼 정렬(공통 `#start-screen, #end-screen`의 center 덮어씀).
- `.coa-scroll-dock`: 오른쪽 밖에서 슬라인 인(`--shown`). 미펼침 시 약한 펄스(`coa-roll-hint`).
- `.coa-scroll-roll`: 원통형 캡 + 종이 막대, 세로 `COA` / `펼치기|접기`.
- `.certificate--panel`: `max-width` 0 ↔ `min(420px,88vw)` 전환으로 펼침. `--open` 시에만 본문 표시.
- `.certificate--void`: 미테이프 걸작용 황동 톤 테두리·가격 색.
- `.void-placard`: 미테이프 시 좌상단 벽면 라벨.
- `.art-label-wrap` z-index 110, `clamp` 기반 큰 서체; `.art-label--void` 제목 톤.

### `game.js`

- **전시 라벨(`art-label`)**: 플레이 중에는 숨김(`triggerContemporaryArtEffects`에서 라벨 표시 제거). `endGame`에서 `fillArtLabel` 후 줌·미테이프 분기의 `setTimeout` 안에서만 `.visible`. `clearArtLabel`은 `startGame` 시 내용 비우기 + 숨김.
- `fillArtLabel(taped)`: 테이프된 과일 배열 기준. 1점이 **바나나만**이면 `BANANA_SINGLE_TITLES`에서 제목, 그 외 단일 과일은 기존 한 줄 제목. 세 번째 줄은 재료만 (`VOID` / `SINGLE` / `GREED` 배열).
- `VOID_COA_PRICE = 999999999`, 제목/설명/벽면 노트 배열 + `pickCoaLine`.
- `tapedCount === 0`: 가격 `$999,999,999`, 무작위 허구 카피, `certificate--void`, 플래카드, 보증 문구 변형, `Edition ∞/∞`.
- `tapedCount > 0`: 실제 `score` 기반 가격, 일반 설명/벽면 노트, 일반 보증.
- `setCoaScrollOpen` / `revealCoaScrollDock`: 종료 시 두루마리만 등장, 클릭으로 패널 펼침.
- `computeZoomForTapedFruits`, `fillCertificate`, `startGame` 초기화(독·플래카드·void 클래스).

## 검증 가이드 (수동)

1. 테이프 없이 종료: 우측 두루마리 등장 → 클릭 시 보증서 펼침, 가격 999,999,999, 좌상단 플래카드.
2. 테이프 후 종료: 레드 닷·줌 후 동일 두루마리, 일반 스타일 COA.
3. 펼친 뒤 다시 클릭 시 접힘(힌트 `접기`).
4. `resetGame` 후 두루마리·플래카드·펼침 상태 리셋.
