# Cynefin Sense-Making Engine 1페이지 간단 매뉴얼

## 이 앱은 무엇인가?

복잡한 조직 이슈를 **Story로 모으고**, **Cynefin 도메인 분포를 조정해 해석하고**, **작은 Probe 실험을 설계하고**, **Signal을 기록해 학습으로 남기는** 브라우저 기반 MVP입니다.

현재 버전은 서버 DB 없이 브라우저에 저장됩니다. 같은 브라우저에서는 새로고침해도 데이터가 유지됩니다.

---

## 5분 사용 흐름

### 1. Dashboard에서 전체 상황 보기

왼쪽 메뉴에서 **Dashboard**를 누르면 현재 데이터 요약을 봅니다.

- Stories: 기록된 현장 이야기 수
- Active Probes: 설계/실행 중인 실험 수
- Dominant Domain: 현재 Cynefin 후보 도메인
- Risk Signals: 강한 부정 신호 수

---

### 2. Story Bank에 현장 이야기 입력

왼쪽 메뉴에서 **Story Bank**를 누릅니다.

막히면 **AI Assist**를 눌러 Type, Tags, 요약, 성찰 질문을 제안받습니다.

입력할 것:
- Type: Weak Signal, Customer Voice, Risk Signal 등
- Tags: CX, AI, Risk 같은 키워드
- Title: 무슨 일이 있었는지 한 줄
- Story: 관찰한 내용, 경험, 맥락

입력 후 **Add Story**를 누릅니다.

---

### 3. Cynefin Map에서 도메인 감지

왼쪽 메뉴에서 **Cynefin Map**을 누릅니다.

화면은 3단계로 나뉩니다.

#### Step 1. Domain Mix
슬라이더로 이 이슈가 어느 도메인에 가까운지 조정합니다.
- Clear: 원인과 답이 명확함
- Complicated: 전문가 분석이 필요함
- Complex: 정답보다 실험과 관찰이 필요함
- Chaotic: 즉각 안정화가 필요함
- Aporetic: 아직 정의 자체가 불분명함

#### Step 2. Why This Interpretation?
Evidence Story를 선택하고 Rationale을 적습니다. **AI Assist**를 누르면 현재 도메인 분포와 Story를 바탕으로 Rationale 초안을 제안합니다.

#### Step 3. How Sure Are You?
Confidence를 1~5로 기록합니다.

중요: **Confidence는 Domain Mix 수치를 바꾸지 않습니다.** 현재 해석을 얼마나 확신하는지 기록하는 값입니다.

주의: 이 앱은 도메인을 확정하지 않습니다. **후보 분포**로만 봅니다.

---

### 4. Probe Portfolio에서 작은 실험 만들기

왼쪽 메뉴에서 **Probe Portfolio**를 누릅니다.

막히면 **AI Assist**를 눌러 최근 Story와 현재 도메인 후보를 바탕으로 Probe 초안을 제안받습니다.

입력할 것:
- Probe title: 작은 실험 이름
- Hypothesis: 무엇을 해보면 무엇이 관찰될 것인가
- Owner: 담당자 또는 팀
- Success signal: 성공으로 볼 신호
- Failure signal: 중단/축소해야 할 신호

입력 후 **Add Probe**를 누릅니다. 이후 상태와 진행률을 바꿀 수 있습니다.

---

### 5. Signal Dashboard에 관찰 신호 기록

왼쪽 메뉴에서 **Signal Dashboard**를 누릅니다.

막히면 **AI Assist**를 눌러 최근 Story, Probe, 도메인 후보를 바탕으로 Signal 초안을 제안받습니다.

입력할 것:
- Signal title: 새롭게 보이는 패턴
- Description: 근거 또는 관찰 내용
- Direction: Positive, Negative, Neutral, Ambiguous
- Strength: 신호 강도 1~5

입력 후 **Add Signal**을 누릅니다.

---

## 가장 중요한 사용 원칙

- 복잡한 문제는 바로 해결책을 정하지 말고 Story를 먼저 모읍니다.
- Cynefin Map은 정답 판정기가 아니라 `Domain Mix + Evidence + Confidence`를 남기는 대화 도구입니다.
- Complex가 높으면 큰 계획보다 작은 Probe를 여러 개 만듭니다.
- Probe는 반드시 성공 신호와 실패 신호를 함께 정합니다.
- 실행 후 관찰된 Signal을 남겨 Learning Memory로 이어갑니다.

---

## 데이터 초기화

왼쪽 아래 **Reset demo data**를 누르면 샘플 데이터로 되돌아갑니다.

주의: 현재 MVP는 브라우저 localStorage를 사용합니다. 다른 기기나 다른 브라우저와 데이터가 자동 공유되지는 않습니다.
