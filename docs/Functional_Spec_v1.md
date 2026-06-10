# Cynefin Sense-Making Engine 상세 기능 명세서 v1.0

## 0. 제품 개요

### 제품명
Sense-Making Engine

### 목적
조직의 복잡한 전략·혁신·변화·리스크 이슈를 수집하고, 이해관계자의 해석을 모아 Cynefin 기반으로 상황을 감지한 뒤, Safe-to-Fail Probe와 Signal Detection을 통해 실행·학습을 반복하게 하는 Web App.

### 핵심 원칙
- AI는 도메인을 확정 판정하지 않는다.
- 사용자가 직접 의미를 부여한다.
- 관점 차이는 오류가 아니라 데이터로 취급한다.
- Complex 문제는 분석보다 실험 포트폴리오로 다룬다.
- 모든 판단과 실험은 학습 기록으로 남긴다.

## 0.1 MVP 구현 업데이트 (2026-06-10)

현재 배포 가능한 MVP는 전체 제품 비전 중 핵심 sense-making 흐름을 우선 구현한다. 범위는 Story Bank, Cynefin Map, Probe Portfolio, Signal Dashboard, Learning Memory 중심이며, 사용자가 브라우저에서 바로 테스트할 수 있도록 Next.js 기반 단일 Web App으로 제공한다.

### 현재 구현된 핵심 흐름
1. Story Bank에서 현장 관찰과 이야기를 수집한다.
2. Cynefin Map에서 이슈의 도메인 분포를 3단계로 해석한다.
3. Evidence-based Interpretation에 근거와 판단 이유를 남긴다.
4. Confidence Check로 판단 신뢰도를 별도 기록한다.
5. Probe Portfolio에서 Safe-to-Fail Experiment를 설계한다.
6. Signal Dashboard에서 실험 또는 현장의 변화 신호를 추적한다.
7. Learning Memory에서 축적된 입력과 학습 흐름을 확인한다.

### MVP 저장 방식
- 현재 MVP는 별도 백엔드 없이 브라우저 `localStorage`에 데이터를 저장한다.
- 같은 브라우저에서는 새로고침 후에도 입력 내용이 유지된다.
- 다른 브라우저, 다른 기기, 시크릿 모드에서는 데이터가 공유되지 않는다.
- 정식 제품 단계에서는 데이터베이스, 인증, 조직/워크스페이스 권한 체계가 필요하다.

### MVP AI Assist 범위
- Story, Domain Interpretation, Probe, Signal 입력 영역에 AI Assist를 제공한다.
- 현재 AI Assist는 프론트엔드 규칙 기반 보조 기능이다.
- 외부 LLM API를 호출하지 않으며, 사용자가 최종 내용을 검토하고 저장해야 한다.
- AI Assist는 도메인 확정, 의사결정 승인, 리스크 판단을 대신하지 않는다.

---

# 1. 공통 기능

## 1.1 사용자 가입 / 로그인

### 입력값
- email: string
- password: string
- name: string
- organization_name: string
- role: enum
  - executive
  - manager
  - facilitator
  - member
  - consultant
  - admin

### 출력값
- user_id
- organization_id
- access_token
- refresh_token
- default_workspace_id

### 예외 처리
- 이메일 중복: `EMAIL_ALREADY_EXISTS`
- 비밀번호 정책 미달: `INVALID_PASSWORD_POLICY`
- 필수값 누락: `MISSING_REQUIRED_FIELD`
- 인증 실패: `AUTHENTICATION_FAILED`

---

## 1.2 권한 체계

### Role
| Role | 권한 |
|---|---|
| Admin | 조직/워크스페이스/사용자 전체 관리 |
| Facilitator | 세션 생성, 질문 설계, 결과 분석 |
| Executive | 대시보드 조회, 의사결정 기록 |
| Member | Story 입력, Signification 참여, Probe 참여 |
| Guest | 초대받은 세션에 한해 제한 참여 |

### 예외 처리
- 권한 없음: `PERMISSION_DENIED`
- 만료된 초대 링크: `INVITATION_EXPIRED`
- 워크스페이스 접근 불가: `WORKSPACE_ACCESS_DENIED`

---

# 2. Workspace Module

## 2.1 Workspace 생성

### 목적
프로젝트, 조직 변화, 신사업, 전략 워크숍 단위의 작업 공간 생성.

### 입력값
- workspace_name: string
- description: string
- use_case_type: enum
  - strategic_planning
  - innovation_management
  - new_business
  - ai_transformation
  - organizational_change
  - customer_experience
  - risk_crisis
  - collective_intelligence
- visibility: enum
  - private
  - organization
  - invite_only
- facilitator_ids: array<string>

### 출력값
- workspace_id
- created_at
- workspace_url

### 예외 처리
- 이름 중복: `WORKSPACE_NAME_DUPLICATED`
- 생성 권한 없음: `PERMISSION_DENIED`
- Facilitator가 존재하지 않음: `USER_NOT_FOUND`

---

# 3. Module 1: Story Bank

## 3.1 Story 입력

### 목적
현장의 사건, 경험, 관찰, 약한 신호, 고객/직원 이야기 수집.

### 입력값
- workspace_id: string
- title: string
- body: text
- story_type: enum
  - event
  - observation
  - customer_voice
  - employee_voice
  - weak_signal
  - risk_signal
  - opportunity_signal
  - interview_note
- source_type: enum
  - manual
  - interview
  - survey
  - import
  - voice_transcript
- author_id: string
- is_anonymous: boolean
- occurred_at: datetime
- tags: array<string>
- attachments: array<file>

### 출력값
- story_id
- story_status: draft/submitted/archived
- created_at
- updated_at

### 예외 처리
- 본문 없음: `EMPTY_STORY_BODY`
- 워크스페이스 없음: `WORKSPACE_NOT_FOUND`
- 익명 입력 불가 설정: `ANONYMOUS_NOT_ALLOWED`
- 첨부파일 용량 초과: `FILE_SIZE_EXCEEDED`
- 지원하지 않는 파일 형식: `UNSUPPORTED_FILE_TYPE`

---

## 3.2 Story 목록 조회

### 입력값
- workspace_id
- filters:
  - story_type
  - tag
  - author_id
  - date_range
  - is_anonymous
  - keyword
- sort:
  - latest
  - oldest
  - most_signified
  - most_discussed

### 출력값
- stories: array
  - story_id
  - title
  - snippet
  - story_type
  - tags
  - created_at
  - signification_count
  - cynefin_mapping_count

### 예외 처리
- 검색 결과 없음: 빈 배열 반환
- 워크스페이스 접근 불가: `WORKSPACE_ACCESS_DENIED`

---

## 3.3 Story AI 요약

### 입력값
- story_id
- summary_type: enum
  - short
  - structured
  - issue_extract
  - stakeholder_extract

### 출력값
- summary_text
- extracted_keywords
- extracted_stakeholders
- confidence_score

### 예외 처리
- Story 본문이 너무 짧음: `TEXT_TOO_SHORT`
- AI 요약 비활성화 워크스페이스: `AI_DISABLED`
- AI 처리 실패: `AI_PROCESSING_FAILED`

### 제한 조건
AI 요약은 원문을 대체하지 않는다.
UI에는 항상 “AI-generated summary” 라벨을 표시한다.

## 3.4 Story Capture AI Assist (MVP)

### 목적
사용자가 현장 이야기를 입력할 때 제목, 관찰 내용, 이해관계자, 약한 신호, 후속 질문을 빠르게 구조화하도록 돕는다.

### 입력값
- raw_story_text
- optional_context

### 출력값
- suggested_title
- refined_story_body
- suggested_tags
- extracted_stakeholders
- weak_signal_hint
- follow_up_questions

### 동작 원칙
- 사용자가 입력한 원문을 삭제하지 않는다.
- AI Assist 결과는 입력 필드에 반영되지만, 저장은 사용자가 명시적으로 수행한다.
- 저장 완료, 입력 부족, 삭제 완료 등 주요 행동은 UI 피드백으로 알려준다.

---

# 4. Module 2: Signification Studio

## 4.1 Signification 질문 세트 생성

### 목적
참여자가 Story에 직접 의미를 부여할 수 있는 질문 구조 생성.

### 입력값
- workspace_id
- question_set_name
- target_story_type
- questions: array
  - question_id
  - question_text
  - question_type: enum
    - scale
    - dyad
    - triad
    - multiple_choice
    - single_choice
    - free_text
  - required: boolean
  - options: array
  - min_value
  - max_value

### 출력값
- question_set_id
- status: draft/published
- created_at

### 예외 처리
- 질문 없음: `QUESTION_SET_EMPTY`
- 잘못된 question_type: `INVALID_QUESTION_TYPE`
- Triad 축 3개 미만/초과: `INVALID_TRIAD_CONFIG`
- Dyad 축 2개 미만/초과: `INVALID_DYAD_CONFIG`

---

## 4.2 Story Signification 제출

### 입력값
- story_id
- user_id
- question_set_id
- responses: array
  - question_id
  - answer_value

### 출력값
- signification_id
- submitted_at
- response_summary

### 예외 처리
- 이미 제출됨: `ALREADY_SUBMITTED`
- 필수 문항 누락: `REQUIRED_QUESTION_MISSING`
- 범위 초과 값: `ANSWER_OUT_OF_RANGE`
- question_set 미게시 상태: `QUESTION_SET_NOT_PUBLISHED`

---

## 4.3 Signification 결과 시각화

### 입력값
- workspace_id
- story_id optional
- question_set_id
- aggregation_type:
  - by_story
  - by_stakeholder
  - by_role
  - by_time
  - overall

### 출력값
- distribution_data
- heatmap_data
- outlier_responses
- consensus_score
- conflict_score

### 예외 처리
- 응답 수 부족: `INSUFFICIENT_RESPONSES`
- 익명성 보호 기준 미달: `ANONYMITY_THRESHOLD_NOT_MET`

### 익명성 규칙
특정 그룹 응답자가 3명 미만이면 그룹별 결과를 표시하지 않는다.

---

# 5. Module 3: Cynefin Workspace

## 5.1 Issue 생성

### 목적
Story 또는 워크숍 토론에서 도출된 핵심 이슈 생성.

### 입력값
- workspace_id
- issue_title
- issue_description
- related_story_ids: array<string>
- issue_category: enum
  - strategy
  - innovation
  - operation
  - organization
  - customer
  - technology
  - risk
  - crisis
- owner_id optional
- priority: low/medium/high/critical

### 출력값
- issue_id
- issue_status: open/mapping/probing/monitoring/closed
- created_at

### 예외 처리
- 관련 Story 없음 허용
- 제목 없음: `ISSUE_TITLE_REQUIRED`
- 잘못된 category: `INVALID_ISSUE_CATEGORY`

---

## 5.2 Cynefin 도메인 매핑

### 입력값
- issue_id
- user_id
- domain_scores:
  - clear: number 0-100
  - complicated: number 0-100
  - complex: number 0-100
  - chaotic: number 0-100
  - aporetic: number 0-100
- rationale: text
- confidence_level: number 1-5

### 출력값
- mapping_id
- normalized_domain_distribution
- dominant_domain_candidate
- confidence_average
- submitted_at

### 예외 처리
- 점수 합계 0: `INVALID_DOMAIN_SCORE`
- 점수 범위 초과: `DOMAIN_SCORE_OUT_OF_RANGE`
- rationale 필수 설정 시 누락: `RATIONALE_REQUIRED`
- 중복 제출 정책 위반: `DUPLICATE_MAPPING_NOT_ALLOWED`

### 중요 제한
시스템은 `dominant_domain_candidate`를 제안할 수 있지만, “확정 도메인”으로 표시하지 않는다.

### MVP UX 구조
현재 MVP의 Cynefin Map은 다음 3단계로 구성한다.

1. **Domain Mix**: Clear, Complicated, Complex, Chaotic, Aporetic 비율을 조정한다.
2. **Evidence-based Interpretation**: 관련 스토리, 관찰 근거, 해석 이유를 작성한다.
3. **Confidence Check**: 현재 해석에 대한 신뢰도를 별도 수치로 기록한다.

### Confidence 처리 기준
- Confidence는 도메인 분포를 자동 변경하지 않는다.
- Confidence는 “현재 해석을 얼마나 믿을 수 있는가”에 대한 메타 판단이다.
- 낮은 Confidence는 추가 스토리 수집, 반대 사례 탐색, Probe 설계를 촉발하는 신호로 사용한다.
- 높은 Confidence라도 도메인 확정을 의미하지 않는다.

### Evidence 기반 산출 기준
도메인 분포는 다음 근거를 종합해 사용자가 조정한다.

- Story Bank에 축적된 현장 이야기
- 이해관계자 간 해석 차이
- 반복적으로 등장하는 패턴 또는 예외 사례
- 원인-결과 관계의 명확성
- 전문가 분석 가능성
- 실험이 필요한 불확실성
- 즉각 안정화가 필요한 위기 신호

---

## 5.3 집단 도메인 분포 계산

### 입력값
- issue_id
- aggregation_filter:
  - all
  - role
  - department
  - stakeholder_group
  - time_period

### 출력값
- domain_distribution:
  - clear %
  - complicated %
  - complex %
  - chaotic %
  - aporetic %
- consensus_score
- polarization_score
- dominant_split
- interpretation_warning

### 예외 처리
- 매핑 수 부족: `INSUFFICIENT_MAPPING_COUNT`
- 특정 그룹 인원 부족: `ANONYMITY_THRESHOLD_NOT_MET`

---

## 5.4 도메인 기반 Action Posture 추천

### 입력값
- issue_id
- domain_distribution
- facilitator_override optional

### 출력값
- recommended_postures: array
  - posture_type:
    - apply_best_practice
    - expert_analysis
    - safe_to_fail_probe
    - crisis_stabilization
    - further_sensemaking
  - reason
  - caution
  - next_action_template

### 예외 처리
- 도메인 분포 없음: `DOMAIN_MAPPING_REQUIRED`
- 극단적 분산: `HIGH_POLARIZATION_REQUIRES_FACILITATOR_REVIEW`

## 5.5 Interpretation Log (MVP)

### 목적
Cynefin 도메인 해석이 단순한 슬라이더 조작으로 끝나지 않도록, 근거와 판단 이유를 시간순 기록으로 남긴다.

### 입력값
- issue_id
- related_story_id optional
- domain_scores
- dominant_domain_candidate
- rationale
- confidence_level
- generated_by_ai_assist: boolean

### 출력값
- interpretation_id
- saved_at
- evidence_summary
- confidence_level
- domain_snapshot

### UX 원칙
- 사용자는 Domain Mix 조정 후 반드시 해석 근거를 남길 수 있어야 한다.
- 저장된 Interpretation Log는 이후 Probe 설계와 Signal 해석의 근거로 재사용된다.
- 기존 해석을 덮어쓰기보다 새 기록으로 축적하는 방식을 우선한다.

---

# 6. Module 4: Constraint Explorer

## 6.1 Constraint 생성

### 입력값
- workspace_id
- issue_id optional
- constraint_name
- description
- constraint_type: enum
  - enabling
  - governing
  - coupling
  - boundary
  - resource
  - policy
  - cultural
  - technical
  - market
- changeability_score: number 1-5
- energy_required_score: number 1-5
- time_sensitivity_score: number 1-5
- evidence_story_ids: array<string>

### 출력값
- constraint_id
- constraint_map_position
- created_at

### 예외 처리
- constraint_name 누락: `CONSTRAINT_NAME_REQUIRED`
- score 범위 오류: `INVALID_SCORE_RANGE`
- 연결된 Issue 접근 불가: `ISSUE_ACCESS_DENIED`

---

## 6.2 Constraint Map 조회

### 입력값
- workspace_id
- issue_id optional
- x_axis: changeability
- y_axis: energy_required
- filter:
  - constraint_type
  - score_range
  - owner
  - issue_category

### 출력값
- constraints: array
  - constraint_id
  - name
  - type
  - x_position
  - y_position
  - intervention_recommendation
- map_summary:
  - high_leverage_constraints
  - low_leverage_constraints
  - wait_and_watch_constraints

### 예외 처리
- 데이터 없음: 빈 map 반환
- 잘못된 축 설정: `INVALID_AXIS_CONFIG`

---

## 6.3 개입 가능성 평가

### 입력값
- constraint_id
- evaluator_id
- intervention_feasibility: number 1-5
- expected_impact: number 1-5
- uncertainty_level: number 1-5
- comment: text

### 출력값
- evaluation_id
- leverage_score
- recommendation:
  - intervene_now
  - monitor
  - avoid_direct_intervention
  - design_probe

### 예외 처리
- 권한 없음: `PERMISSION_DENIED`
- 이미 평가됨: `ALREADY_EVALUATED`
- 점수 누락: `MISSING_SCORE`

---

# 7. Module 5: Probe Portfolio

## 7.1 Probe 생성

### 목적
Complex 이슈에 대해 Safe-to-Fail 실험 설계.

### 입력값
- workspace_id
- issue_id
- probe_title
- hypothesis
- probe_type:
  - experiment
  - pilot
  - prototype
  - policy_trial
  - communication_trial
  - process_change
  - market_test
  - ai_usecase_test
- target_group
- owner_id
- start_date
- end_date
- resources_required
- failure_safety_description
- success_signals: array<string>
- failure_signals: array<string>
- amplification_plan
- dampening_plan
- stop_criteria
- related_constraint_ids: array<string>

### 출력값
- probe_id
- probe_status: draft/review/approved/running/completed/stopped
- probe_canvas_url
- risk_flag

### 예외 처리
- Complex 성격 낮음 경고: `NON_COMPLEX_ISSUE_WARNING`
- 실패 안전성 설명 누락: `FAILURE_SAFETY_REQUIRED`
- success/failure signal 누락: `SIGNALS_REQUIRED`
- 종료일이 시작일보다 빠름: `INVALID_DATE_RANGE`
- Owner 없음: `OWNER_REQUIRED`

---

## 7.2 Probe 승인

### 입력값
- probe_id
- approver_id
- approval_status:
  - approved
  - rejected
  - request_revision
- comment

### 출력값
- approval_id
- probe_status
- approved_at optional

### 예외 처리
- 승인 권한 없음: `APPROVAL_PERMISSION_DENIED`
- 이미 실행 중: `PROBE_ALREADY_RUNNING`
- 필수 항목 미완성: `PROBE_INCOMPLETE`

---

## 7.3 Probe 실행 상태 업데이트

### 입력값
- probe_id
- status_update:
  - not_started
  - running
  - blocked
  - completed
  - stopped
- progress_percent
- update_comment
- observed_signals: array
  - signal_text
  - signal_type:
    - success
    - failure
    - unexpected
    - weak_signal
  - evidence_file optional

### 출력값
- update_id
- updated_probe_status
- signal_ids
- next_review_date

### 예외 처리
- progress 범위 오류: `INVALID_PROGRESS_VALUE`
- 완료 처리 시 결과 누락: `COMPLETION_RESULT_REQUIRED`
- 중단 처리 시 사유 누락: `STOP_REASON_REQUIRED`

---

## 7.4 Probe 결과 판정

### 입력값
- probe_id
- result_type:
  - amplify
  - dampen
  - stop
  - pivot
  - repeat
  - inconclusive
- result_summary
- lessons_learned
- recommended_next_probe optional

### 출력값
- probe_result_id
- learning_memory_entry_id
- recommended_actions

### 예외 처리
- 실행 기록 없음: `NO_EXECUTION_DATA`
- result_summary 누락: `RESULT_SUMMARY_REQUIRED`
- inconclusive 선택 시 추가 관찰 계획 필요: `FOLLOWUP_PLAN_REQUIRED`

---

# 8. Module 6: Signal Dashboard

## 8.1 Signal 생성

### 입력값
- workspace_id
- source_type:
  - story
  - probe
  - metric
  - manual_observation
  - external_event
- source_id optional
- signal_title
- signal_description
- signal_strength: number 1-5
- signal_direction:
  - positive
  - negative
  - neutral
  - ambiguous
- related_issue_ids
- related_probe_ids
- observed_at

### 출력값
- signal_id
- signal_status: new/reviewed/linked/archived
- created_at

### 예외 처리
- 제목 없음: `SIGNAL_TITLE_REQUIRED`
- 강도 범위 오류: `INVALID_SIGNAL_STRENGTH`
- source_id 불일치: `INVALID_SIGNAL_SOURCE`

---

## 8.2 Signal Clustering

### 입력값
- workspace_id
- time_range
- cluster_by:
  - semantic_similarity
  - issue
  - probe
  - stakeholder
  - tag
- min_cluster_size

### 출력값
- clusters: array
  - cluster_id
  - cluster_name
  - signal_count
  - representative_signals
  - emerging_pattern_summary
  - confidence_score

### 예외 처리
- 신호 수 부족: `INSUFFICIENT_SIGNAL_COUNT`
- AI 비활성화: `AI_DISABLED`
- 클러스터 생성 실패: `CLUSTERING_FAILED`

---

## 8.3 Pattern Review

### 입력값
- cluster_id
- reviewer_id
- pattern_validity:
  - valid
  - weak
  - noise
  - needs_more_data
- interpretation
- recommended_response:
  - amplify
  - dampen
  - monitor
  - investigate
  - ignore

### 출력값
- pattern_review_id
- updated_cluster_status
- action_recommendation

### 예외 처리
- 리뷰 권한 없음: `PERMISSION_DENIED`
- interpretation 누락: `INTERPRETATION_REQUIRED`

---

# 9. Module 7: Leadership Cockpit

## 9.1 Executive Dashboard 조회

### 입력값
- workspace_id
- date_range
- dashboard_scope:
  - workspace
  - portfolio
  - organization
- filters:
  - issue_category
  - domain
  - probe_status
  - risk_level

### 출력값
- complexity_heatmap
- issue_domain_distribution
- top_misaligned_issues
- active_probe_count
- probe_result_summary
- high_risk_signals
- high_leverage_constraints
- leadership_recommendations

### 예외 처리
- 권한 없음: `EXECUTIVE_ACCESS_REQUIRED`
- 데이터 부족: 부분 대시보드 표시 + `INSUFFICIENT_DATA_WARNING`

---

## 9.2 Misfit Alert

### 목적
도메인과 행동 방식이 맞지 않는 경우 경고.

### 입력값
- issue_id
- current_action_type:
  - best_practice
  - expert_analysis
  - probe
  - crisis_action
  - discussion_only

### 출력값
- misfit_detected: boolean
- misfit_type:
  - over_simplification
  - over_analysis
  - under_reaction
  - premature_scaling
  - endless_discussion
- alert_message
- suggested_posture

### 예외 처리
- 도메인 매핑 없음: `DOMAIN_MAPPING_REQUIRED`
- 현재 행동 방식 미입력: `ACTION_TYPE_REQUIRED`

### 예시
Complex 70% 이슈인데 Best Practice 적용 중이면:
`OVER_SIMPLIFICATION_WARNING`

---

## 9.3 Decision Log 작성

### 입력값
- workspace_id
- issue_id optional
- decision_title
- decision_summary
- decision_type:
  - strategic
  - operational
  - investment
  - crisis
  - people
  - innovation
- rationale
- alternatives_considered
- expected_outcome
- review_date
- decision_owner_id

### 출력값
- decision_id
- decision_log_url
- next_review_date

### 예외 처리
- rationale 누락: `RATIONALE_REQUIRED`
- owner 누락: `DECISION_OWNER_REQUIRED`
- review_date 과거일: `INVALID_REVIEW_DATE`

---

# 10. Module 8: Learning Memory

## 10.1 Learning Entry 생성

### 입력값
- workspace_id
- source_type:
  - probe
  - decision
  - signal
  - workshop
  - retrospective
- source_id
- learning_title
- learning_summary
- learning_type:
  - success
  - failure
  - surprise
  - pattern
  - anti_pattern
  - principle
- applicable_context
- caution_context
- tags

### 출력값
- learning_id
- knowledge_card_url
- related_entries

### 예외 처리
- source_id 없음: `SOURCE_NOT_FOUND`
- summary 누락: `LEARNING_SUMMARY_REQUIRED`
- 중복 가능성: `POSSIBLE_DUPLICATE_LEARNING`

---

## 10.2 Learning 검색

### 입력값
- workspace_id optional
- organization_id
- keyword
- filters:
  - learning_type
  - source_type
  - tag
  - date_range
  - issue_category

### 출력값
- learning_entries:
  - learning_id
  - title
  - summary
  - source_type
  - tags
  - relevance_score

### 예외 처리
- 결과 없음: 빈 배열 반환
- 조직 범위 검색 권한 없음: `ORG_SEARCH_PERMISSION_DENIED`

---

## 10.3 Retrospective 생성

### 입력값
- workspace_id
- retrospective_title
- target_period
- included_probe_ids
- included_decision_ids
- included_signal_ids
- facilitator_id

### 출력값
- retrospective_id
- auto_summary
- key_patterns
- unresolved_questions
- recommended_next_sensemaking_topics

### 예외 처리
- 포함 데이터 없음: `RETROSPECTIVE_DATA_REQUIRED`
- AI 요약 실패: 원본 데이터 기반 빈 템플릿 제공

---

# 11. Workshop Mode

## 11.1 Session 생성

### 입력값
- workspace_id
- session_title
- session_type:
  - cynefin_mapping
  - story_collection
  - signification
  - probe_design
  - leadership_review
  - retrospective
- facilitator_id
- participant_ids
- start_time
- end_time
- anonymity_enabled: boolean

### 출력값
- session_id
- invitation_link
- participant_access_code

### 예외 처리
- 참여자 없음: `PARTICIPANT_REQUIRED`
- 시간 오류: `INVALID_SESSION_TIME`
- 익명 모드와 실명 필수 기능 충돌: `ANONYMITY_CONFLICT`

---

## 11.2 실시간 참여

### 입력값
- session_id
- participant_id
- activity_type:
  - submit_story
  - vote
  - map_domain
  - comment
  - rank_issue
  - evaluate_probe
- payload

### 출력값
- activity_id
- aggregated_result_update
- timestamp

### 예외 처리
- 세션 종료됨: `SESSION_CLOSED`
- 참여 권한 없음: `SESSION_ACCESS_DENIED`
- 중복 투표 제한: `DUPLICATE_ACTIVITY_NOT_ALLOWED`

---

# 12. AI Assistant 기능

## 12.1 질문 추천

### 입력값
- context_type:
  - story
  - issue
  - probe
  - decision
- context_text
- desired_lens:
  - cynefin
  - stakeholder
  - risk
  - innovation
  - leadership
  - system

### 출력값
- suggested_questions: array
- question_purpose
- caution

### 예외 처리
- context 부족: `CONTEXT_TOO_SHORT`
- AI 비활성화: `AI_DISABLED`

---

## 12.2 편향 탐지

### 입력값
- issue_id
- discussion_text
- decision_log optional

### 출력값
- possible_biases:
  - confirmation_bias
  - authority_bias
  - overconfidence
  - premature_convergence
  - over_simplification
  - analysis_paralysis
- evidence_snippets
- reflection_questions

### 예외 처리
- 텍스트 부족: `TEXT_TOO_SHORT`
- 민감정보 포함: `SENSITIVE_DATA_DETECTED`

### 제한
AI는 “편향 확정”이 아니라 “가능성”으로만 표시한다.

---

## 12.3 Probe 아이디어 추천

### 입력값
- issue_id
- domain_distribution
- related_stories
- constraints
- target_probe_count

### 출력값
- probe_ideas:
  - title
  - hypothesis
  - target_group
  - expected_signal
  - safety_consideration
  - risk_warning

### 예외 처리
- Complex 비율 낮음: 경고 표시 후 추천 가능
- 데이터 부족: `INSUFFICIENT_CONTEXT_FOR_PROBE_IDEATION`

### MVP 구현
- Probe Portfolio의 Capture Field Stories와 유사한 AI Assist 버튼을 제공한다.
- 사용자가 입력한 이슈, 가설, 타깃, 기대 신호를 바탕으로 Safe-to-Fail 실험 초안을 제안한다.
- 제안 결과는 사용자가 수정한 뒤 저장한다.

## 12.4 Domain Interpretation AI Assist (MVP)

### 목적
사용자가 Cynefin 도메인 분포와 관련 스토리를 해석할 때 근거 기반 설명을 빠르게 작성하도록 돕는다.

### 입력값
- domain_scores
- selected_story optional
- issue_context
- confidence_level

### 출력값
- rationale_draft
- evidence_points
- uncertainty_notes
- suggested_next_probe

### 제한
- AI Assist는 도메인 분포를 자동 확정하지 않는다.
- Confidence 값을 바꾸더라도 도메인 분포는 자동 변경되지 않는다.
- 사용자가 저장해야 Interpretation Log에 반영된다.

## 12.5 Signal Recording AI Assist (MVP)

### 목적
약한 신호나 실험 결과를 명확한 Signal 기록으로 정리하도록 돕는다.

### 입력값
- raw_signal_text
- related_probe optional
- observed_change

### 출력값
- signal_title
- signal_description
- suggested_direction
- suggested_strength
- implication
- follow_up_question

### 제한
- Signal의 방향과 강도는 추천값이며 사용자가 조정할 수 있다.
- 단일 신호만으로 패턴을 확정하지 않는다.

## 12.6 Story Capture AI Assist (MVP)

### 목적
현장 이야기 입력 시 관찰, 해석, 후속 질문을 구분해 기록 품질을 높인다.

### 입력값
- raw_story_text

### 출력값
- structured_story
- suggested_title
- possible_tags
- stakeholder_hint
- weak_signal_hint

---

# 13. 데이터 모델 초안

## User
- id
- name
- email
- role
- organization_id
- created_at

## Organization
- id
- name
- plan_type
- settings

## Workspace
- id
- organization_id
- name
- use_case_type
- visibility
- created_by
- created_at

## Story
- id
- workspace_id
- title
- body
- story_type
- author_id
- is_anonymous
- tags
- occurred_at
- created_at

## Signification
- id
- story_id
- user_id
- question_set_id
- responses
- created_at

## Issue
- id
- workspace_id
- title
- description
- category
- priority
- status

## DomainMapping
- id
- issue_id
- user_id
- domain_scores
- normalized_domain_distribution
- dominant_domain_candidate
- rationale
- confidence_level
- related_story_id optional
- created_at

## InterpretationLog
- id
- issue_id
- domain_mapping_id optional
- related_story_id optional
- domain_snapshot
- dominant_domain_candidate
- rationale
- confidence_level
- generated_by_ai_assist
- created_at

## Constraint
- id
- workspace_id
- issue_id
- name
- type
- changeability_score
- energy_required_score
- time_sensitivity_score

## Probe
- id
- workspace_id
- issue_id
- title
- hypothesis
- status
- owner_id
- start_date
- end_date
- success_signals
- failure_signals
- stop_criteria

## Signal
- id
- workspace_id
- source_type
- source_id
- title
- description
- strength
- direction
- observed_at

## DecisionLog
- id
- workspace_id
- issue_id
- title
- summary
- rationale
- owner_id
- review_date

## LearningEntry
- id
- workspace_id
- source_type
- source_id
- title
- summary
- learning_type
- tags

---

# 14. API Endpoint 초안

## Auth
- POST /auth/signup
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

## Workspace
- POST /workspaces
- GET /workspaces
- GET /workspaces/:id
- PATCH /workspaces/:id
- DELETE /workspaces/:id

## Story
- POST /workspaces/:id/stories
- GET /workspaces/:id/stories
- GET /stories/:id
- PATCH /stories/:id
- DELETE /stories/:id
- POST /stories/:id/summarize

## Signification
- POST /workspaces/:id/question-sets
- GET /workspaces/:id/question-sets
- POST /stories/:id/significations
- GET /stories/:id/significations/summary

## Issue / Cynefin
- POST /workspaces/:id/issues
- GET /workspaces/:id/issues
- POST /issues/:id/domain-mappings
- GET /issues/:id/domain-distribution
- GET /issues/:id/action-posture
- POST /issues/:id/interpretations
- GET /issues/:id/interpretations

## Constraint
- POST /issues/:id/constraints
- GET /issues/:id/constraints
- POST /constraints/:id/evaluations

## Probe
- POST /issues/:id/probes
- GET /issues/:id/probes
- PATCH /probes/:id
- POST /probes/:id/approve
- POST /probes/:id/updates
- POST /probes/:id/results

## Signal
- POST /workspaces/:id/signals
- GET /workspaces/:id/signals
- POST /workspaces/:id/signals/cluster
- POST /signal-clusters/:id/review

## Dashboard
- GET /workspaces/:id/leadership-dashboard
- POST /issues/:id/misfit-alert
- POST /workspaces/:id/decision-logs

## Learning
- POST /workspaces/:id/learnings
- GET /learnings/search
- POST /workspaces/:id/retrospectives

---

# 15. MVP 우선순위

## MVP 1차 필수
1. Auth / Workspace
2. Story Bank
3. Signification Studio 기본형
4. Issue 생성
5. Cynefin Domain Mapping
6. Domain Distribution
7. Probe Portfolio
8. Signal 수동 입력
9. Leadership Dashboard 기본형
10. Learning Entry

### 현재 MVP 반영 상태 (2026-06-10)
- 구현됨: Story Bank 입력/저장/검색/삭제
- 구현됨: Story Capture AI Assist
- 구현됨: 3단계 Cynefin Domain Mapping
- 구현됨: Evidence-based Interpretation 및 Interpretation Log
- 구현됨: Domain Interpretation AI Assist
- 구현됨: Probe Portfolio 및 Probe AI Assist
- 구현됨: Signal Dashboard 및 Signal AI Assist
- 구현됨: Learning Memory 기본 뷰
- 보류됨: Auth, 서버 DB, 다중 사용자 권한, 실시간 Workshop Mode

## MVP 1차 제외 가능
- Voice to Story
- 고급 AI Clustering
- Estuarine 고급 Map
- 실시간 워크숍 모드
- 조직 전체 Portfolio Dashboard
- SSO
- 온프레미스

---

# 16. 핵심 예외 코드 목록

| Code | 의미 |
|---|---|
| PERMISSION_DENIED | 권한 없음 |
| WORKSPACE_NOT_FOUND | 워크스페이스 없음 |
| WORKSPACE_ACCESS_DENIED | 워크스페이스 접근 불가 |
| MISSING_REQUIRED_FIELD | 필수값 누락 |
| INVALID_SCORE_RANGE | 점수 범위 오류 |
| INSUFFICIENT_RESPONSES | 응답 수 부족 |
| ANONYMITY_THRESHOLD_NOT_MET | 익명성 보호 기준 미달 |
| DOMAIN_MAPPING_REQUIRED | 도메인 매핑 필요 |
| PROBE_INCOMPLETE | Probe 필수 항목 미완성 |
| FAILURE_SAFETY_REQUIRED | 실패 안전성 설명 필요 |
| SIGNALS_REQUIRED | 성공/실패 신호 필요 |
| AI_DISABLED | AI 기능 비활성화 |
| AI_PROCESSING_FAILED | AI 처리 실패 |
| TEXT_TOO_SHORT | 텍스트 부족 |
| POSSIBLE_DUPLICATE_LEARNING | 중복 학습 항목 가능성 |

---

# 17. 개발 시 중요한 UX 원칙

## 금지 UX
- AI가 “이 문제는 Complex입니다”라고 단정
- Cynefin 도메인을 MBTI처럼 고정 라벨화
- KPI Dashboard처럼 단순 성과 숫자만 표시
- Complex 이슈에 단일 Action Plan 강요
- 참여자 관점 차이를 평균값으로만 소거

## 권장 UX
- 도메인은 확률/분포로 표시
- 관점 차이는 시각적으로 강조
- Complex 이슈에는 Probe 설계를 기본 다음 행동으로 제안
- 의사결정마다 rationale 저장
- 실행 후 반드시 Signal과 Learning으로 연결

---

# 18. 출시 기준

## Beta 출시 기준
- 5개 이상 워크스페이스 생성 가능
- 50명 이상 참여자 동시 사용 가능
- Story 1,000개 저장 가능
- Issue별 Domain Mapping 가능
- Probe 생성 및 결과 기록 가능
- 기본 Dashboard 표시 가능

## 정식 출시 기준
- 조직/워크스페이스 권한 안정화
- 익명성 보호 로직 적용
- 데이터 Export 기능
- 관리자 Audit Log
- AI 기능 On/Off 설정
- 백업/복구 정책
- 개인정보 처리방침 및 보안 정책 적용

---

# 19. 개발자 구현 순서 추천

## Sprint 1
Auth, Organization, Workspace, Role

## Sprint 2
Story Bank, Story List, Story Detail

## Sprint 3
Signification Question Set, Response, Aggregation

## Sprint 4
Issue, Cynefin Mapping, Domain Distribution

## Sprint 5
Probe Portfolio, Probe Update, Probe Result

## Sprint 6
Signal Dashboard, Learning Memory

## Sprint 7
Leadership Cockpit, Misfit Alert

## Sprint 8
AI Assistant, Export, Admin Settings

---

# 20. 한 줄 정의

이 Web App은 Cynefin Framework를 디지털화한 도구가 아니라, 조직이 복잡한 상황을 함께 감지하고, 작은 실험을 설계하고, 신호를 관찰하며, 학습을 축적하도록 돕는 Sense-Making Operating System이다.
