# Cynefin Sense-Making Engine 사용자 매뉴얼

## 1. 제품 개요

Cynefin Sense-Making Engine은 조직의 복잡한 변화, 전략, 혁신, 리스크 이슈를 다루기 위한 Sense-Making 도구입니다.

이 앱은 사용자가 다음 흐름을 반복하도록 돕습니다.

1. 현장의 이야기와 약한 신호를 Story로 수집한다.
2. 수집된 이슈를 Cynefin 도메인 분포로 해석한다.
3. Complex 성격이 강한 이슈에 대해 Safe-to-Fail Probe를 설계한다.
4. 실행 중 관찰되는 Signal을 기록한다.
5. Probe와 Signal을 Learning Memory로 축적한다.

현재 MVP는 백엔드 데이터베이스 없이 브라우저 `localStorage`에 데이터를 저장합니다. 같은 브라우저에서는 새로고침 후에도 데이터가 유지되지만, 다른 기기와 자동 동기화되지는 않습니다.

---

## 2. 화면 구성

### 2.1 왼쪽 메뉴

왼쪽 사이드바에는 주요 기능이 있습니다.

| 메뉴 | 목적 |
|---|---|
| Dashboard | 전체 현황 요약 |
| Story Bank | 현장 이야기, 관찰, 약한 신호 입력 |
| Cynefin Map | 도메인 후보 분포 조정 |
| Probe Portfolio | Safe-to-Fail 실험 설계와 상태 관리 |
| Signal Dashboard | 실행 중 관찰 신호 기록 |
| Learning Memory | 완료된 실험과 신호를 학습 카드로 확인 |

### 2.2 상단 검색

상단 검색창은 Story 목록을 필터링합니다.

검색 대상:
- Story 제목
- Story 본문
- Story 태그
- Story 유형

---

## 3. Dashboard 사용법

Dashboard는 현재 워크스페이스의 상태를 한눈에 보는 화면입니다.

### 주요 지표

#### Stories
현재 브라우저에 저장된 Story 수입니다.

#### Active Probes
등록된 Probe 수와 Running 상태의 Probe 수를 보여줍니다.

#### Dominant Domain
Cynefin Map에서 가장 높은 비율을 가진 후보 도메인입니다.

주의: Dominant Domain은 확정 판정이 아니라 현재 입력값 기준의 후보입니다.

#### Risk Signals
Direction이 Negative이고 Strength가 4 이상인 Signal 수입니다.

---

## 4. Story Bank 사용법

Story Bank는 Sense-Making의 출발점입니다. 해결책을 바로 정하기 전에 현장에서 실제로 무슨 일이 일어나고 있는지 수집합니다.

### 4.1 Story 입력 항목

| 항목 | 설명 | 예시 |
|---|---|---|
| Type | Story의 유형 | Weak Signal, Customer Voice, Risk Signal |
| Tags | 검색과 분류를 위한 키워드 | CX, AI, Risk |
| Title | Story의 핵심 제목 | 고객이 공식 절차를 우회하고 있다 |
| Story | 상세 관찰 내용 | 신규 고객이 온보딩 문서 대신 비공식 가이드를 먼저 찾는다 |

### 4.2 Story 입력 절차

1. 왼쪽 메뉴에서 **Story Bank**를 누릅니다.
2. Type을 선택합니다.
3. Tags를 입력합니다.
4. Title을 입력합니다.
5. Story 본문을 입력합니다.
6. **Add Story**를 누릅니다.

### 4.3 Story 삭제

각 Story 카드 오른쪽 위의 휴지통 아이콘을 누르면 해당 Story가 삭제됩니다.

### 4.4 좋은 Story 작성법

좋은 Story는 판단보다 관찰에 가깝습니다.

좋은 예:
- "고객들이 공식 온보딩 절차보다 Slack에 공유된 비공식 문서를 먼저 읽는다."
- "부서마다 같은 AI 정책을 서로 다르게 설명하고 있다."

덜 좋은 예:
- "온보딩 프로세스가 잘못됐다."
- "현장 직원들이 정책을 이해하지 못한다."

---

## 5. Cynefin Map 사용법

Cynefin Map은 이슈가 어떤 성격을 갖는지 집단적으로 감지하기 위한 도구입니다.

### 5.1 도메인 의미

| 도메인 | 의미 | 적합한 대응 |
|---|---|---|
| Clear | 원인과 답이 명확함 | Best Practice 적용 |
| Complicated | 전문가 분석이 필요함 | 분석, 진단, 전문가 판단 |
| Complex | 결과를 예측하기 어려움 | Safe-to-Fail Probe |
| Chaotic | 즉각적 안정화가 필요함 | 빠른 조치, 피해 제한 |
| Aporetic | 문제 정의 자체가 불분명함 | 추가 Sense-Making |

### 5.2 도메인 조정 절차

1. 왼쪽 메뉴에서 **Cynefin Map**을 누릅니다.
2. Clear, Complicated, Complex, Chaotic, Aporetic 슬라이더를 조정합니다.
3. 도넛 차트와 퍼센트 분포가 자동으로 바뀝니다.
4. 가장 높은 값은 Dominant Domain 후보로 표시됩니다.

### 5.3 해석 주의사항

이 앱은 "이 문제는 Complex입니다"라고 확정하지 않습니다.

도메인 분포는 다음 질문을 위한 대화 재료입니다.

- 왜 어떤 사람은 Clear로 보고, 어떤 사람은 Complex로 보는가?
- 어느 이해관계자에게 불확실성이 가장 크게 보이는가?
- 지금 필요한 것은 분석인가, 실험인가, 안정화인가?

---

## 6. Probe Portfolio 사용법

Probe는 Complex 이슈에 대해 작고 안전하게 시도해보는 실험입니다.

### 6.1 Probe 입력 항목

| 항목 | 설명 | 예시 |
|---|---|---|
| Probe title | 실험 이름 | 2주짜리 고객 온보딩 마이크로 실험 |
| Hypothesis | 실험 가설 | 우회 행동을 허용하면 고객 불안이 줄어든다 |
| Owner | 담당자 또는 팀 | CX Team |
| Success signal | 성공으로 볼 신호 | 온보딩 완료율 상승 |
| Failure signal | 중단/축소해야 할 신호 | 고객 문의 급증 |

### 6.2 Probe 생성 절차

1. 왼쪽 메뉴에서 **Probe Portfolio**를 누릅니다.
2. Probe title을 입력합니다.
3. Hypothesis를 입력합니다.
4. Owner를 입력합니다.
5. Success signal과 Failure signal을 입력합니다.
6. **Add Probe**를 누릅니다.

### 6.3 Probe 상태 관리

각 Probe는 상태를 바꿀 수 있습니다.

| 상태 | 의미 |
|---|---|
| Draft | 초안 |
| Review | 검토 중 |
| Running | 실행 중 |
| Completed | 완료 |
| Stopped | 중단 |

### 6.4 진행률 조정

Probe 카드의 진행률 슬라이더를 움직이면 progress가 바뀝니다.

진행률은 프로젝트 관리 숫자라기보다, 현재 실험이 어느 정도 관찰 가능한 단계까지 왔는지를 표시하는 용도입니다.

### 6.5 좋은 Probe의 기준

좋은 Probe는 다음 조건을 만족합니다.

- 작고 빠르게 실행할 수 있다.
- 실패해도 조직에 큰 피해가 없다.
- 성공 신호와 실패 신호가 미리 정해져 있다.
- 결과가 다음 행동을 결정하는 데 도움이 된다.

---

## 7. Signal Dashboard 사용법

Signal은 Story나 Probe 실행 중 관찰되는 의미 있는 변화입니다.

### 7.1 Signal 입력 항목

| 항목 | 설명 | 예시 |
|---|---|---|
| Signal title | 관찰된 패턴 제목 | 고객 우회 행동이 줄어들고 있다 |
| Description | 근거 또는 해석 | 새 온보딩 흐름 적용 후 문의가 감소했다 |
| Direction | 신호 방향 | Positive, Negative, Neutral, Ambiguous |
| Strength | 신호 강도 | 1~5 |

### 7.2 Signal 방향

| Direction | 의미 |
|---|---|
| Positive | 강화할 가능성이 있는 신호 |
| Negative | 축소, 중단, 경계가 필요한 신호 |
| Neutral | 아직 방향성이 약한 신호 |
| Ambiguous | 해석이 갈리는 신호 |

### 7.3 Signal 강도

Strength는 1에서 5까지입니다.

- 1: 약한 힌트
- 3: 반복 관찰되는 패턴
- 5: 즉시 검토해야 하는 강한 신호

Dashboard의 Risk Signals는 Negative이면서 Strength가 4 이상인 Signal을 계산합니다.

---

## 8. Learning Memory 사용법

Learning Memory는 Probe와 Signal에서 얻은 학습을 모아보는 공간입니다.

현재 MVP에서는 다음 정보를 자동으로 보여줍니다.

- Completed 상태의 Probe
- 최근 Signal 카드
- 현재 Cynefin 도메인 후보에 따른 Action Posture 안내

### 활용 방법

1. Probe를 Completed로 바꿉니다.
2. Learning Memory로 이동합니다.
3. 완료된 Probe와 관련된 Signal을 보고 다음 실험 또는 의사결정으로 연결합니다.

---

## 9. 데이터 저장과 초기화

### 9.1 저장 방식

현재 MVP는 브라우저 localStorage에 저장합니다.

저장되는 데이터:
- Stories
- Probes
- Signals
- Cynefin domain scores

### 9.2 유지되는 경우

같은 브라우저에서 새로고침하면 데이터가 유지됩니다.

### 9.3 유지되지 않는 경우

다음 경우에는 데이터가 공유되지 않거나 사라질 수 있습니다.

- 다른 브라우저에서 접속
- 다른 기기에서 접속
- 브라우저 사이트 데이터 삭제
- 시크릿 모드 사용

### 9.4 초기화

왼쪽 아래 **Reset demo data**를 누르면 샘플 데이터로 초기화됩니다.

---

## 10. 추천 사용 시나리오

### 시나리오 A: 전략 워크숍 준비

1. 참여자 인터뷰 내용을 Story로 입력합니다.
2. 반복되는 이슈를 보며 Cynefin Map을 조정합니다.
3. Complex 비율이 높은 주제에 대해 Probe를 만듭니다.
4. 워크숍 후 실행 결과를 Signal로 기록합니다.

### 시나리오 B: AI Transformation 리스크 감지

1. AI 도입 과정에서 나온 불안, 저항, 오해를 Story로 입력합니다.
2. 책임 경계, 운영 정책, 고객 영향 이슈를 Cynefin Map으로 해석합니다.
3. 작은 정책 실험 또는 커뮤니케이션 실험을 Probe로 설계합니다.
4. Negative Signal이 강해지면 Probe를 중단하거나 수정합니다.

### 시나리오 C: 고객 경험 개선

1. 고객 문의, VOC, 사용 로그에서 나온 관찰을 Story로 입력합니다.
2. 단순 버그인지 복잡한 행동 패턴인지 Cynefin Map으로 구분합니다.
3. Complex 성격이면 여러 온보딩 Probe를 작게 실행합니다.
4. 고객 반응 Signal을 기록하고 성공 신호가 강한 Probe를 확대합니다.

---

## 11. 현재 MVP의 한계

현재 앱은 기능 테스트용 MVP입니다.

아직 없는 기능:
- 로그인
- 조직/팀 권한
- 서버 DB 저장
- 여러 사용자 동시 협업
- 파일 첨부
- AI 요약/추천
- Export
- Audit Log

다음 단계에서 Supabase, PostgreSQL, Auth, API Route 등을 붙이면 실제 SaaS형 앱으로 확장할 수 있습니다.

---

## 12. 빠른 문제 해결

### 입력한 데이터가 다른 기기에서 보이지 않아요

현재 MVP는 브라우저 localStorage를 사용합니다. 다른 기기와 자동 동기화되지 않습니다.

### 데이터를 처음 상태로 되돌리고 싶어요

왼쪽 아래 **Reset demo data**를 누르세요.

### 도메인 퍼센트가 정확히 의도한 값과 달라요

슬라이더 원점수는 0~100이고, 화면의 퍼센트는 전체 합계 기준으로 정규화된 값입니다.

### Vercel에서 새 버전이 바로 안 보여요

Vercel Dashboard에서 최신 Deployment가 Ready인지 확인하고, 브라우저를 새로고침하세요.

---

## 13. 핵심 원칙 요약

- Story 먼저, Solution 나중.
- Cynefin은 판정기가 아니라 대화 지도.
- Complex에는 큰 계획보다 작은 Probe.
- Probe에는 Success Signal과 Failure Signal이 모두 필요.
- 실행 후 Signal을 기록해야 Learning이 남는다.
