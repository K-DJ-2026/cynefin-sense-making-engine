"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  FlaskConical,
  Layers3,
  MessageSquareText,
  Network,
  Plus,
  Radar,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

type DomainKey = "clear" | "complicated" | "complex" | "chaotic" | "aporetic";
type ProbeStatus = "Draft" | "Review" | "Running" | "Completed" | "Stopped";
type SignalDirection = "positive" | "negative" | "neutral" | "ambiguous";
type ViewKey = "dashboard" | "stories" | "map" | "probes" | "signals" | "learning";

type Story = {
  id: string;
  type: string;
  title: string;
  body: string;
  tags: string;
  createdAt: string;
};

type Probe = {
  id: string;
  title: string;
  hypothesis: string;
  owner: string;
  status: ProbeStatus;
  progress: number;
  successSignal: string;
  failureSignal: string;
};

type Signal = {
  id: string;
  title: string;
  description: string;
  direction: SignalDirection;
  strength: number;
  createdAt: string;
};

type DomainScores = Record<DomainKey, number>;

type Interpretation = {
  id: string;
  scores: DomainScores;
  dominantDomain: string;
  rationale: string;
  evidenceStoryId: string;
  confidence: number;
  createdAt: string;
};

type AiSuggestion = {
  summary: string;
  recommendedType: string;
  recommendedTags: string;
  reflectionQuestions: string[];
};

type ProbeAiSuggestion = {
  title: string;
  hypothesis: string;
  owner: string;
  successSignal: string;
  failureSignal: string;
  safetyCheck: string;
  reviewQuestions: string[];
};

type SignalAiSuggestion = {
  title: string;
  description: string;
  direction: SignalDirection;
  strength: number;
  source: string;
  reviewQuestions: string[];
};

type InterpretationAiSuggestion = {
  rationale: string;
  confidence: number;
  evidenceStoryId: string;
  caution: string;
  reviewQuestions: string[];
};

const storageKey = "cynefin-sense-making-engine-v2";

const domainMeta: Array<{ key: DomainKey; label: string; color: string }> = [
  { key: "clear", label: "Clear", color: "var(--clear)" },
  { key: "complicated", label: "Complicated", color: "var(--complicated)" },
  { key: "complex", label: "Complex", color: "var(--complex)" },
  { key: "chaotic", label: "Chaotic", color: "var(--chaotic)" },
  { key: "aporetic", label: "Aporetic", color: "var(--aporetic)" },
];

const initialStories: Story[] = [
  {
    id: "story-1",
    type: "Weak Signal",
    title: "현장 매니저들이 같은 정책을 서로 다르게 해석",
    body: "동일한 AI 운영 정책이 부서마다 서로 다른 기준으로 적용되고 있다.",
    tags: "CX, Operation",
    createdAt: "2026-06-09",
  },
  {
    id: "story-2",
    type: "Customer Voice",
    title: "신규 고객 온보딩 중 예상 밖의 우회 행동 증가",
    body: "고객들이 공식 절차 대신 비공식 안내 문서를 먼저 찾는 패턴이 늘었다.",
    tags: "Product",
    createdAt: "2026-06-09",
  },
  {
    id: "story-3",
    type: "Risk Signal",
    title: "AI 자동화 도입 후 책임 경계에 대한 불안 확산",
    body: "실패 시 책임 소재가 불명확하다는 피드백이 반복된다.",
    tags: "AI Transformation",
    createdAt: "2026-06-09",
  },
];

const initialProbes: Probe[] = [
  {
    id: "probe-1",
    title: "2주짜리 고객 온보딩 마이크로 실험",
    hypothesis: "우회 행동을 허용한 안내 흐름이 고객 불안을 줄인다.",
    owner: "Facilitator",
    status: "Running",
    progress: 62,
    successSignal: "온보딩 완료율 상승",
    failureSignal: "지원 문의 급증",
  },
  {
    id: "probe-2",
    title: "부서 간 정책 해석 워크숍",
    hypothesis: "현장 사례 기반 해석 세션이 정책 오해를 줄인다.",
    owner: "Operations",
    status: "Review",
    progress: 28,
    successSignal: "해석 차이 감소",
    failureSignal: "합의 없는 평균화",
  },
];

const initialSignals: Signal[] = [
  {
    id: "signal-1",
    title: "Complex 이슈에 Best Practice 적용 시도 증가",
    description: "불확실성이 큰 이슈에 표준 절차만 적용하려는 논의가 늘었다.",
    direction: "negative",
    strength: 4,
    createdAt: "2026-06-09",
  },
  {
    id: "signal-2",
    title: "정책 언어보다 현장 사례 기반 설명이 빠르게 확산",
    description: "공식 문서보다 실제 사례 카드가 더 높은 공유율을 보인다.",
    direction: "positive",
    strength: 3,
    createdAt: "2026-06-09",
  },
];

const initialScores: DomainScores = {
  clear: 8,
  complicated: 19,
  complex: 58,
  chaotic: 6,
  aporetic: 9,
};

const initialInterpretations: Interpretation[] = [];

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function normalize(scores: DomainScores) {
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0) || 1;
  return domainMeta.map((item) => ({
    ...item,
    value: Math.round((scores[item.key] / total) * 100),
  }));
}

function suggestStoryFields(draft: { title: string; body: string; tags: string }): AiSuggestion {
  const text = `${draft.title} ${draft.body}`.toLowerCase();
  const recommendedType =
    text.includes("고객") || text.includes("customer")
      ? "Customer Voice"
      : text.includes("리스크") || text.includes("위험") || text.includes("불안")
        ? "Risk Signal"
        : text.includes("기회") || text.includes("opportunity")
          ? "Opportunity Signal"
          : "Weak Signal";
  const tagSet = new Set(
    [
      text.includes("ai") || text.includes("자동화") ? "AI" : "",
      text.includes("고객") || text.includes("customer") ? "CX" : "",
      text.includes("정책") || text.includes("프로세스") ? "Operation" : "",
      text.includes("리스크") || text.includes("위험") || text.includes("불안") ? "Risk" : "",
      text.includes("조직") || text.includes("부서") ? "Organization" : "",
    ].filter(Boolean),
  );

  return {
    summary:
      draft.body.trim().length > 0
        ? draft.body.trim().slice(0, 88) + (draft.body.trim().length > 88 ? "..." : "")
        : "Story 본문을 입력하면 AI Assist가 요약과 질문을 제안합니다.",
    recommendedType,
    recommendedTags: draft.tags.trim() || Array.from(tagSet).join(", ") || "Sensemaking",
    reflectionQuestions: [
      "이 Story를 다르게 해석할 이해관계자는 누구인가?",
      "이 현상이 반복된다면 어떤 약한 신호를 더 관찰해야 하는가?",
      "바로 해결책을 정하기 전에 작게 실험해볼 Probe는 무엇인가?",
    ],
  };
}

function suggestProbeFields(
  draft: {
    title: string;
    hypothesis: string;
    owner: string;
    successSignal: string;
    failureSignal: string;
  },
  latestStory: Story | undefined,
  dominantDomain: string,
): ProbeAiSuggestion {
  const sourceTitle = draft.title.trim() || latestStory?.title || "현장 신호 기반 마이크로 실험";
  const sourceBody = latestStory?.body || "최근 Story와 도메인 후보를 바탕으로 작은 실험을 설계합니다.";
  const title = draft.title.trim() || `${sourceTitle.slice(0, 34)} 실험`;
  const hypothesis =
    draft.hypothesis.trim() ||
    `If we run a small safe-to-fail test around "${sourceTitle}", then we expect clearer signals about whether this ${dominantDomain} issue should be amplified, dampened, or redesigned.`;

  return {
    title,
    hypothesis,
    owner: draft.owner.trim() || "Facilitator",
    successSignal:
      draft.successSignal.trim() || "참여자/고객 행동이 의도한 방향으로 반복 관찰된다.",
    failureSignal:
      draft.failureSignal.trim() || "혼란, 저항, 문의, 예외 처리 요청이 빠르게 증가한다.",
    safetyCheck: `Scope this probe to one team or one customer segment first. Source story: ${sourceBody.slice(0, 90)}${sourceBody.length > 90 ? "..." : ""}`,
    reviewQuestions: [
      "이 실험이 실패해도 안전한 최소 범위는 어디까지인가?",
      "성공 신호와 실패 신호를 언제, 누가, 어떻게 관찰할 것인가?",
      "이 Probe를 amplify, dampen, stop, pivot 중 무엇으로 판정할 기준은 무엇인가?",
    ],
  };
}

function suggestSignalFields(
  draft: {
    title: string;
    description: string;
    direction: SignalDirection;
    strength: number;
  },
  latestStory: Story | undefined,
  latestProbe: Probe | undefined,
  dominantDomain: string,
): SignalAiSuggestion {
  const storyTitle = latestStory?.title || "최근 Story";
  const probeTitle = latestProbe?.title || "현재 Probe";
  const isRisk =
    dominantDomain === "Chaotic" ||
    latestStory?.type === "Risk Signal" ||
    latestProbe?.status === "Stopped";
  const direction: SignalDirection = draft.direction !== "ambiguous" ? draft.direction : isRisk ? "negative" : "ambiguous";
  const strength = draft.strength || (isRisk ? 4 : 3);

  return {
    title:
      draft.title.trim() ||
      `${dominantDomain} 후보 이슈에서 "${storyTitle.slice(0, 24)}" 패턴 관찰`,
    description:
      draft.description.trim() ||
      `최근 Story "${storyTitle}"와 Probe "${probeTitle}"를 함께 보면, 이 신호는 다음 행동을 amplify/dampen/pivot 중 무엇으로 가져갈지 판단하기 위한 관찰 항목입니다.`,
    direction,
    strength,
    source: `Source: ${latestStory ? "latest Story" : "demo context"} · Related probe: ${probeTitle}`,
    reviewQuestions: [
      "이 신호는 한 번의 사건인가, 반복되는 패턴인가?",
      "이 신호를 강화해야 하는가, 축소해야 하는가, 더 관찰해야 하는가?",
      "어떤 추가 Story나 Probe 결과가 이 해석을 뒤집을 수 있는가?",
    ],
  };
}

function suggestInterpretationFields(
  scores: DomainScores,
  domainData: Array<{ key: DomainKey; label: string; value: number; color: string }>,
  evidenceStory: Story | undefined,
  stories: Story[],
): InterpretationAiSuggestion {
  const dominant = domainData.reduce((winner, item) =>
    item.value > winner.value ? item : winner,
  );
  const selectedStory = evidenceStory || stories[0];
  const secondDomain = [...domainData].sort((a, b) => b.value - a.value)[1];
  const confidence =
    dominant.value >= 65 ? 4 : dominant.value >= 45 && secondDomain.value <= 25 ? 3 : 2;
  const rationale = selectedStory
    ? `현재 "${selectedStory.title}" Story를 근거로 보면 ${dominant.label} 후보가 가장 강합니다. 다만 ${secondDomain.label}도 ${secondDomain.value}%로 함께 보이므로, 이 해석은 확정 판정이 아니라 현재 관찰 가능한 패턴에 대한 가설입니다. ${dominant.label}로 보는 이유는 Story 안에서 원인-결과가 완전히 고정되어 있기보다 이해관계자 해석과 실행 후 신호 관찰이 중요해 보이기 때문입니다.`
    : `현재 도메인 분포에서는 ${dominant.label} 후보가 가장 강합니다. 근거 Story가 아직 부족하므로 이 해석은 낮은 확신도의 초기 가설로만 기록하는 것이 안전합니다.`;

  return {
    rationale,
    confidence,
    evidenceStoryId: selectedStory?.id || "",
    caution: `Do not treat ${dominant.label} as a final diagnosis. Treat it as a working interpretation based on the current scores: ${Object.entries(scores)
      .map(([key, value]) => `${key} ${value}`)
      .join(", ")}.`,
    reviewQuestions: [
      "이 해석과 반대되는 Story나 Signal은 무엇인가?",
      "다른 역할/부서의 참여자는 이 도메인 분포를 어떻게 다르게 볼 수 있는가?",
      "이 해석이 맞는지 확인하기 위해 어떤 Probe 또는 Signal을 관찰해야 하는가?",
    ],
  };
}

export default function Home() {
  const [activeView, setActiveView] = useState<ViewKey>("dashboard");
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [probes, setProbes] = useState<Probe[]>(initialProbes);
  const [signals, setSignals] = useState<Signal[]>(initialSignals);
  const [scores, setScores] = useState<DomainScores>(initialScores);
  const [interpretations, setInterpretations] = useState<Interpretation[]>(initialInterpretations);
  const [query, setQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [storyNotice, setStoryNotice] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [probeNotice, setProbeNotice] = useState("");
  const [probeAiSuggestion, setProbeAiSuggestion] = useState<ProbeAiSuggestion | null>(null);
  const [signalNotice, setSignalNotice] = useState("");
  const [signalAiSuggestion, setSignalAiSuggestion] = useState<SignalAiSuggestion | null>(null);
  const [interpretationAiSuggestion, setInterpretationAiSuggestion] =
    useState<InterpretationAiSuggestion | null>(null);

  const [storyDraft, setStoryDraft] = useState({
    type: "Weak Signal",
    title: "",
    body: "",
    tags: "",
  });
  const [probeDraft, setProbeDraft] = useState({
    title: "",
    hypothesis: "",
    owner: "",
    successSignal: "",
    failureSignal: "",
  });
  const [signalDraft, setSignalDraft] = useState({
    title: "",
    description: "",
    direction: "ambiguous" as SignalDirection,
    strength: 3,
  });
  const [interpretationDraft, setInterpretationDraft] = useState({
    rationale: "",
    evidenceStoryId: initialStories[0]?.id || "",
    confidence: 3,
  });
  const [mappingNotice, setMappingNotice] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          stories: Story[];
          probes: Probe[];
          signals: Signal[];
          scores: DomainScores;
          interpretations?: Interpretation[];
        };
        setStories(parsed.stories);
        setProbes(parsed.probes);
        setSignals(parsed.signals);
        setScores(parsed.scores);
        setInterpretations(parsed.interpretations || initialInterpretations);
      }
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ stories, probes, signals, scores, interpretations }),
    );
  }, [interpretations, isLoaded, probes, scores, signals, stories]);

  const domainData = useMemo(() => normalize(scores), [scores]);
  const dominantDomain = useMemo(
    () => domainData.reduce((winner, item) => (item.value > winner.value ? item : winner)),
    [domainData],
  );
  const runningProbes = probes.filter((probe) => probe.status === "Running").length;
  const highRiskSignals = signals.filter(
    (signal) => signal.direction === "negative" && signal.strength >= 4,
  ).length;

  const filteredStories = stories.filter((story) =>
    `${story.title} ${story.body} ${story.tags} ${story.type}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const conic = `conic-gradient(${domainData
    .map((item, index) => {
      const previous = domainData
        .slice(0, index)
        .reduce((total, entry) => total + entry.value, 0);
      return `${item.color} ${previous}% ${previous + item.value}%`;
    })
    .join(", ")})`;

  const selectedEvidenceStory = stories.find(
    (story) => story.id === interpretationDraft.evidenceStoryId,
  );

  function addStory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storyDraft.title.trim() || !storyDraft.body.trim()) {
      setStoryNotice("Title과 Story 본문을 모두 입력해야 저장됩니다.");
      return;
    }
    setStories((current) => [
      {
        id: makeId("story"),
        type: storyDraft.type,
        title: storyDraft.title.trim(),
        body: storyDraft.body.trim(),
        tags: storyDraft.tags.trim() || "untagged",
        createdAt: today(),
      },
      ...current,
    ]);
    setStoryDraft({ type: "Weak Signal", title: "", body: "", tags: "" });
    setAiSuggestion(null);
    setQuery("");
    setStoryNotice("Story가 저장되었습니다. 아래 Saved Stories 목록 맨 위에 추가됐습니다.");
    setActiveView("stories");
  }

  function runStoryAiAssist() {
    if (!storyDraft.title.trim() && !storyDraft.body.trim()) {
      setStoryNotice("AI Assist를 쓰려면 먼저 Title 또는 Story를 입력하세요.");
      return;
    }
    const suggestion = suggestStoryFields(storyDraft);
    setAiSuggestion(suggestion);
    setStoryDraft((current) => ({
      ...current,
      type: suggestion.recommendedType,
      tags: current.tags.trim() || suggestion.recommendedTags,
    }));
    setStoryNotice("AI Assist가 유형, 태그, 질문을 제안했습니다. 검토 후 Add Story를 누르세요.");
  }

  function addProbe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!probeDraft.title.trim() || !probeDraft.hypothesis.trim()) {
      setProbeNotice("Probe title과 Hypothesis를 입력해야 저장됩니다. AI Assist로 초안을 만들 수 있습니다.");
      return;
    }
    setProbes((current) => [
      {
        id: makeId("probe"),
        title: probeDraft.title.trim(),
        hypothesis: probeDraft.hypothesis.trim(),
        owner: probeDraft.owner.trim() || "Unassigned",
        status: "Draft",
        progress: 0,
        successSignal: probeDraft.successSignal.trim() || "Success signal required",
        failureSignal: probeDraft.failureSignal.trim() || "Failure signal required",
      },
      ...current,
    ]);
    setProbeDraft({
      title: "",
      hypothesis: "",
      owner: "",
      successSignal: "",
      failureSignal: "",
    });
    setProbeAiSuggestion(null);
    setProbeNotice("Probe가 저장되었습니다. 아래 Safe-to-Fail Experiments 목록 맨 위에 추가됐습니다.");
    setActiveView("probes");
  }

  function runProbeAiAssist() {
    const suggestion = suggestProbeFields(probeDraft, stories[0], dominantDomain.label);
    setProbeAiSuggestion(suggestion);
    setProbeDraft((current) => ({
      title: current.title.trim() || suggestion.title,
      hypothesis: current.hypothesis.trim() || suggestion.hypothesis,
      owner: current.owner.trim() || suggestion.owner,
      successSignal: current.successSignal.trim() || suggestion.successSignal,
      failureSignal: current.failureSignal.trim() || suggestion.failureSignal,
    }));
    setProbeNotice("AI Assist가 Probe 초안을 제안했습니다. 안전 조건을 검토한 뒤 Add Probe를 누르세요.");
  }

  function addSignal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signalDraft.title.trim()) {
      setSignalNotice("Signal title을 입력해야 저장됩니다. AI Assist로 초안을 만들 수 있습니다.");
      return;
    }
    setSignals((current) => [
      {
        id: makeId("signal"),
        title: signalDraft.title.trim(),
        description: signalDraft.description.trim() || "No description",
        direction: signalDraft.direction,
        strength: signalDraft.strength,
        createdAt: today(),
      },
      ...current,
    ]);
    setSignalDraft({
      title: "",
      description: "",
      direction: "ambiguous",
      strength: 3,
    });
    setSignalAiSuggestion(null);
    setSignalNotice("Signal이 저장되었습니다. 아래 Recorded Signals 목록 맨 위에 추가됐습니다.");
    setActiveView("signals");
  }

  function runSignalAiAssist() {
    const suggestion = suggestSignalFields(signalDraft, stories[0], probes[0], dominantDomain.label);
    setSignalAiSuggestion(suggestion);
    setSignalDraft((current) => ({
      title: current.title.trim() || suggestion.title,
      description: current.description.trim() || suggestion.description,
      direction: current.direction !== "ambiguous" ? current.direction : suggestion.direction,
      strength: suggestion.strength,
    }));
    setSignalNotice("AI Assist가 Signal 초안을 제안했습니다. 방향과 강도를 검토한 뒤 Add Signal을 누르세요.");
  }

  function resetDemoData() {
    setStories(initialStories);
    setProbes(initialProbes);
    setSignals(initialSignals);
    setScores(initialScores);
    setInterpretations(initialInterpretations);
    setInterpretationDraft({
      rationale: "",
      evidenceStoryId: initialStories[0]?.id || "",
      confidence: 3,
    });
    window.localStorage.removeItem(storageKey);
  }

  function saveInterpretation() {
    if (!interpretationDraft.rationale.trim()) {
      setMappingNotice("Rationale을 입력해야 해석 로그를 저장할 수 있습니다.");
      return;
    }

    setInterpretations((current) => [
      {
        id: makeId("interpretation"),
        scores,
        dominantDomain: dominantDomain.label,
        rationale: interpretationDraft.rationale.trim(),
        evidenceStoryId: interpretationDraft.evidenceStoryId,
        confidence: interpretationDraft.confidence,
        createdAt: today(),
      },
      ...current,
    ]);
    setInterpretationDraft((current) => ({ ...current, rationale: "" }));
    setInterpretationAiSuggestion(null);
    setMappingNotice("현재 Domain Mapping 해석이 근거와 함께 저장되었습니다.");
  }

  function runInterpretationAiAssist() {
    const suggestion = suggestInterpretationFields(
      scores,
      domainData,
      selectedEvidenceStory,
      stories,
    );
    setInterpretationAiSuggestion(suggestion);
    setInterpretationDraft((current) => ({
      rationale: current.rationale.trim() || suggestion.rationale,
      evidenceStoryId: current.evidenceStoryId || suggestion.evidenceStoryId,
      confidence: suggestion.confidence,
    }));
    setMappingNotice("AI Assist가 Rationale, Evidence, Confidence 초안을 제안했습니다.");
  }

  return (
    <main className="shell">
      <aside className="sidebar" aria-label="Workspace navigation">
        <div className="brand">
          <div className="brandMark">
            <Network size={22} />
          </div>
          <div>
            <p>Cynefin</p>
            <span>Sense-Making Engine</span>
          </div>
        </div>

        <nav className="nav">
          {[
            ["dashboard", "Dashboard", BarChart3],
            ["stories", "Story Bank", MessageSquareText],
            ["map", "Cynefin Map", CircleDot],
            ["probes", "Probe Portfolio", FlaskConical],
            ["signals", "Signal Dashboard", Radar],
            ["learning", "Learning Memory", BookOpen],
          ].map(([key, label, Icon]) => (
            <button
              className={activeView === key ? "active" : ""}
              key={key as string}
              onClick={() => setActiveView(key as ViewKey)}
              type="button"
            >
              <Icon size={18} />
              <span>{label as string}</span>
            </button>
          ))}
        </nav>

        <div className="sidebarPanel">
          <ShieldCheck size={18} />
          <p>All data in this MVP is saved in your browser. No backend account is required yet.</p>
          <button className="ghostButton" onClick={resetDemoData} type="button">
            <RotateCcw size={15} />
            Reset demo data
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace · AI Transformation</p>
            <h1>복잡한 변화 이슈를 기록하고, 도메인을 감지하고, 실험으로 학습하기</h1>
          </div>
          <label className="search">
            <Search size={18} />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stories, probes, signals"
              value={query}
            />
          </label>
        </header>

        <section className="metrics" aria-label="Workspace metrics">
          {[
            ["Stories", stories.length.toString(), "local records", MessageSquareText],
            ["Active Probes", probes.length.toString(), `${runningProbes} running`, FlaskConical],
            ["Dominant Domain", dominantDomain.label, `${dominantDomain.value}% candidate`, Layers3],
            ["Risk Signals", highRiskSignals.toString(), `${signals.length} total`, Activity],
          ].map(([label, value, change, Icon]) => (
            <article className="metric" key={label as string}>
              <div className="metricIcon">
                <Icon size={19} />
              </div>
              <p>{label as string}</p>
              <strong>{value as string}</strong>
              <span>{change as string}</span>
            </article>
          ))}
        </section>

        <section className="grid">
          {(activeView === "dashboard" || activeView === "map") && (
            <article className="panel domainPanel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Cynefin Workspace</p>
                  <h2>Domain Mapping</h2>
                </div>
                <span className="statusPill">Candidate · not final</span>
              </div>

              <div className="mappingStep">
                <div className="stepHeader">
                  <span>Step 1</span>
                  <div>
                    <h3>Domain Mix</h3>
                    <p>How does this issue feel across Cynefin domains?</p>
                  </div>
                </div>

                <div className="domainBody">
                  <div className="donut" style={{ background: conic }}>
                    <div>
                      <strong>{dominantDomain.value}%</strong>
                      <span>{dominantDomain.label}</span>
                    </div>
                  </div>
                  <div className="legend">
                    {domainData.map((item) => (
                      <div className="sliderRow" key={item.key}>
                        <div className="legendRow">
                          <span className="swatch" style={{ background: item.color }} />
                          <span>{item.label}</span>
                          <strong>{item.value}%</strong>
                        </div>
                        <input
                          aria-label={`${item.label} score`}
                          max="100"
                          min="0"
                          onChange={(event) =>
                            setScores((current) => ({
                              ...current,
                              [item.key]: Number(event.target.value),
                            }))
                          }
                          type="range"
                          value={scores[item.key]}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="warning">
                  <AlertTriangle size={18} />
                  <span>
                    {dominantDomain.key === "complex"
                      ? "Complex candidate: design safe-to-fail probes instead of forcing a single action plan."
                      : "Use this distribution as a facilitation prompt, not a fixed diagnosis."}
                  </span>
                </div>
              </div>

              <div className="mappingStep">
                <div className="boxHeader">
                  <div>
                    <p className="eyebrow">Step 2</p>
                    <h3>Why This Interpretation?</h3>
                  </div>
                  <button
                    aria-label="Run Domain Interpretation AI Assist"
                    className="aiButton"
                    onClick={runInterpretationAiAssist}
                    type="button"
                  >
                    <Sparkles size={17} />
                    AI Assist
                  </button>
                </div>

                <p className="helperText">
                  근거 Story와 Rationale은 왜 이 Domain Mix로 보았는지를 남기는 공간입니다.
                  AI Assist는 초안을 만들 뿐, 최종 해석은 사용자가 검토합니다.
                </p>

                <label>
                  Evidence Story
                  <select
                    onChange={(event) =>
                      setInterpretationDraft((current) => ({
                        ...current,
                        evidenceStoryId: event.target.value,
                      }))
                    }
                    value={interpretationDraft.evidenceStoryId}
                  >
                    {stories.map((story) => (
                      <option key={story.id} value={story.id}>
                        {story.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Rationale
                  <textarea
                    onChange={(event) =>
                      setInterpretationDraft((current) => ({
                        ...current,
                        rationale: event.target.value,
                      }))
                    }
                    placeholder="왜 이 이슈를 현재 도메인 분포로 해석했나요? 관찰 근거와 반대 가능성을 함께 적어보세요."
                    value={interpretationDraft.rationale}
                  />
                </label>

                {selectedEvidenceStory && (
                  <div className="evidencePreview">
                    <strong>{selectedEvidenceStory.type}</strong>
                    <span>{selectedEvidenceStory.body}</span>
                  </div>
                )}

                {interpretationAiSuggestion && (
                  <div className="aiPanel">
                    <div>
                      <CircleDot size={18} />
                      <strong>Interpretation AI Assist Result</strong>
                    </div>
                    <p>{interpretationAiSuggestion.caution}</p>
                    <small>
                      Suggested confidence: {interpretationAiSuggestion.confidence}/5 · Evidence
                      story selected
                    </small>
                    <ul>
                      {interpretationAiSuggestion.reviewQuestions.map((question) => (
                        <li key={question}>{question}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mappingStep confidenceStep">
                <div className="stepHeader">
                  <span>Step 3</span>
                  <div>
                    <h3>How Sure Are You?</h3>
                    <p>Confidence records certainty. It does not change the Domain Mix.</p>
                  </div>
                </div>

                <div className="confidenceControl">
                  <strong>{interpretationDraft.confidence}/5</strong>
                  <label>
                    Confidence
                    <input
                      max="5"
                      min="1"
                      onChange={(event) =>
                        setInterpretationDraft((current) => ({
                          ...current,
                          confidence: Number(event.target.value),
                        }))
                      }
                      type="range"
                      value={interpretationDraft.confidence}
                    />
                    <small className="fieldHint">
                      Confidence는 도메인 비율을 바꾸지 않습니다. 현재 Domain Mapping 해석에
                      대한 확신도입니다.
                    </small>
                  </label>
                </div>

                <button className="primaryButton" onClick={saveInterpretation} type="button">
                  <BookOpen size={17} />
                  Save Interpretation
                </button>

                {mappingNotice && <div className="notice">{mappingNotice}</div>}
              </div>

              <div className="interpretationLog">
                <div className="listHeader">
                  <strong>Interpretation Log</strong>
                  <span>{interpretations.length} saved</span>
                </div>
                {interpretations.length === 0 ? (
                  <p className="emptyState">아직 저장된 해석 로그가 없습니다.</p>
                ) : (
                  interpretations.slice(0, 5).map((entry) => {
                    const evidence = stories.find((story) => story.id === entry.evidenceStoryId);
                    return (
                      <div className="interpretationCard" key={entry.id}>
                        <div>
                          <strong>{entry.dominantDomain} candidate</strong>
                          <span>
                            confidence {entry.confidence}/5 · {entry.createdAt}
                          </span>
                        </div>
                        <p>{entry.rationale}</p>
                        <small>Evidence: {evidence?.title || "Story not found"}</small>
                      </div>
                    );
                  })
                )}
              </div>
            </article>
          )}

          {(activeView === "dashboard" || activeView === "stories") && (
            <article className="panel storyPanel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Story Bank</p>
                  <h2>Capture Field Stories</h2>
                </div>
                <button
                  aria-label="Run Story AI Assist"
                  className="aiButton"
                  onClick={runStoryAiAssist}
                  type="button"
                >
                  <Sparkles size={17} />
                  AI Assist
                </button>
              </div>

              <form className="form" onSubmit={addStory}>
                <div className="formGrid">
                  <label>
                    Type
                    <select
                      onChange={(event) =>
                        setStoryDraft((current) => ({ ...current, type: event.target.value }))
                      }
                      value={storyDraft.type}
                    >
                      <option>Weak Signal</option>
                      <option>Customer Voice</option>
                      <option>Employee Voice</option>
                      <option>Risk Signal</option>
                      <option>Opportunity Signal</option>
                    </select>
                  </label>
                  <label>
                    Tags
                    <input
                      onChange={(event) =>
                        setStoryDraft((current) => ({ ...current, tags: event.target.value }))
                      }
                      placeholder="CX, AI, Risk"
                      value={storyDraft.tags}
                    />
                  </label>
                </div>
                <label>
                  Title
                  <input
                    onChange={(event) =>
                      setStoryDraft((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="What happened?"
                    value={storyDraft.title}
                  />
                </label>
                <label>
                  Story
                  <textarea
                    onChange={(event) =>
                      setStoryDraft((current) => ({ ...current, body: event.target.value }))
                    }
                    placeholder="Describe the observation, experience, or weak signal."
                    value={storyDraft.body}
                  />
                </label>
                <button className="primaryButton" type="submit">
                  <Plus size={17} />
                  Add Story
                </button>
              </form>

              {storyNotice && <div className="notice">{storyNotice}</div>}

              {aiSuggestion && (
                <div className="aiPanel">
                  <div>
                    <Sparkles size={18} />
                    <strong>AI Assist Result</strong>
                  </div>
                  <p>{aiSuggestion.summary}</p>
                  <small>
                    Suggested type: {aiSuggestion.recommendedType} · Suggested tags:{" "}
                    {aiSuggestion.recommendedTags}
                  </small>
                  <ul>
                    {aiSuggestion.reflectionQuestions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="listHeader">
                <strong>Saved Stories</strong>
                <span>{filteredStories.length} shown</span>
              </div>

              <div className="storyList">
                {filteredStories.map((story) => (
                  <div className="story" key={story.id}>
                    <button
                      aria-label={`Delete ${story.title}`}
                      className="deleteButton"
                      onClick={() =>
                        setStories((current) => current.filter((item) => item.id !== story.id))
                      }
                      type="button"
                    >
                      <Trash2 size={15} />
                    </button>
                    <span>{story.type}</span>
                    <strong>{story.title}</strong>
                    <p>{story.body}</p>
                    <small>
                      {story.tags} · {story.createdAt}
                    </small>
                  </div>
                ))}
              </div>
            </article>
          )}

          {(activeView === "dashboard" || activeView === "probes") && (
            <article className="panel probePanel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Probe Portfolio</p>
                  <h2>Safe-to-Fail Experiments</h2>
                </div>
                <button
                  aria-label="Run Probe AI Assist"
                  className="aiButton"
                  onClick={runProbeAiAssist}
                  type="button"
                >
                  <Sparkles size={17} />
                  AI Assist
                </button>
              </div>

              <form className="form" onSubmit={addProbe}>
                <label>
                  Probe title
                  <input
                    onChange={(event) =>
                      setProbeDraft((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="Small experiment name"
                    value={probeDraft.title}
                  />
                </label>
                <label>
                  Hypothesis
                  <textarea
                    onChange={(event) =>
                      setProbeDraft((current) => ({ ...current, hypothesis: event.target.value }))
                    }
                    placeholder="If we try X, then we expect to observe Y."
                    value={probeDraft.hypothesis}
                  />
                </label>
                <div className="formGrid">
                  <label>
                    Owner
                    <input
                      onChange={(event) =>
                        setProbeDraft((current) => ({ ...current, owner: event.target.value }))
                      }
                      placeholder="Team or person"
                      value={probeDraft.owner}
                    />
                  </label>
                  <label>
                    Success signal
                    <input
                      onChange={(event) =>
                        setProbeDraft((current) => ({
                          ...current,
                          successSignal: event.target.value,
                        }))
                      }
                      placeholder="What should increase?"
                      value={probeDraft.successSignal}
                    />
                  </label>
                </div>
                <label>
                  Failure signal
                  <input
                    onChange={(event) =>
                      setProbeDraft((current) => ({
                        ...current,
                        failureSignal: event.target.value,
                      }))
                    }
                    placeholder="What would tell us to dampen or stop?"
                    value={probeDraft.failureSignal}
                  />
                </label>
                <button className="primaryButton" type="submit">
                  <Plus size={17} />
                  Add Probe
                </button>
              </form>

              {probeNotice && <div className="notice">{probeNotice}</div>}

              {probeAiSuggestion && (
                <div className="aiPanel">
                  <div>
                    <FlaskConical size={18} />
                    <strong>Probe AI Assist Result</strong>
                  </div>
                  <p>{probeAiSuggestion.safetyCheck}</p>
                  <small>
                    Owner: {probeAiSuggestion.owner} · Success:{" "}
                    {probeAiSuggestion.successSignal} · Failure:{" "}
                    {probeAiSuggestion.failureSignal}
                  </small>
                  <ul>
                    {probeAiSuggestion.reviewQuestions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="listHeader">
                <strong>Saved Probes</strong>
                <span>{probes.length} total</span>
              </div>

              <div className="probeList">
                {probes.map((probe) => (
                  <div className="probe" key={probe.id}>
                    <div>
                      <strong>{probe.title}</strong>
                      <span>{probe.hypothesis}</span>
                      <small>
                        Success: {probe.successSignal} · Failure: {probe.failureSignal}
                      </small>
                    </div>
                    <select
                      aria-label={`${probe.title} status`}
                      onChange={(event) =>
                        setProbes((current) =>
                          current.map((item) =>
                            item.id === probe.id
                              ? { ...item, status: event.target.value as ProbeStatus }
                              : item,
                          ),
                        )
                      }
                      value={probe.status}
                    >
                      <option>Draft</option>
                      <option>Review</option>
                      <option>Running</option>
                      <option>Completed</option>
                      <option>Stopped</option>
                    </select>
                    <div className="progress" aria-label={`${probe.progress}% complete`}>
                      <span style={{ width: `${probe.progress}%` }} />
                    </div>
                    <input
                      aria-label={`${probe.title} progress`}
                      max="100"
                      min="0"
                      onChange={(event) =>
                        setProbes((current) =>
                          current.map((item) =>
                            item.id === probe.id
                              ? { ...item, progress: Number(event.target.value) }
                              : item,
                          ),
                        )
                      }
                      type="range"
                      value={probe.progress}
                    />
                  </div>
                ))}
              </div>
            </article>
          )}

          {(activeView === "dashboard" || activeView === "signals") && (
            <article className="panel signalPanel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Signal Dashboard</p>
                  <h2>Record Emerging Signals</h2>
                </div>
                <button
                  aria-label="Run Signal AI Assist"
                  className="aiButton"
                  onClick={runSignalAiAssist}
                  type="button"
                >
                  <Sparkles size={17} />
                  AI Assist
                </button>
              </div>

              <form className="form" onSubmit={addSignal}>
                <label>
                  Signal title
                  <input
                    onChange={(event) =>
                      setSignalDraft((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="What pattern is emerging?"
                    value={signalDraft.title}
                  />
                </label>
                <label>
                  Description
                  <textarea
                    onChange={(event) =>
                      setSignalDraft((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Evidence, source, or interpretation."
                    value={signalDraft.description}
                  />
                </label>
                <div className="formGrid">
                  <label>
                    Direction
                    <select
                      onChange={(event) =>
                        setSignalDraft((current) => ({
                          ...current,
                          direction: event.target.value as SignalDirection,
                        }))
                      }
                      value={signalDraft.direction}
                    >
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                      <option value="neutral">Neutral</option>
                      <option value="ambiguous">Ambiguous</option>
                    </select>
                  </label>
                  <label>
                    Strength: {signalDraft.strength}
                    <input
                      max="5"
                      min="1"
                      onChange={(event) =>
                        setSignalDraft((current) => ({
                          ...current,
                          strength: Number(event.target.value),
                        }))
                      }
                      type="range"
                      value={signalDraft.strength}
                    />
                  </label>
                </div>
                <button className="primaryButton" type="submit">
                  <Plus size={17} />
                  Add Signal
                </button>
              </form>

              {signalNotice && <div className="notice">{signalNotice}</div>}

              {signalAiSuggestion && (
                <div className="aiPanel">
                  <div>
                    <Radar size={18} />
                    <strong>Signal AI Assist Result</strong>
                  </div>
                  <p>{signalAiSuggestion.description}</p>
                  <small>
                    {signalAiSuggestion.source} · Direction: {signalAiSuggestion.direction} ·
                    Strength: {signalAiSuggestion.strength}
                  </small>
                  <ul>
                    {signalAiSuggestion.reviewQuestions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="listHeader">
                <strong>Recorded Signals</strong>
                <span>{signals.length} total</span>
              </div>

              <div className="signalStack">
                {signals.map((signal) => (
                  <div className={`signal ${signal.direction}`} key={signal.id}>
                    <div>
                      {signal.direction === "positive" ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <BrainCircuit size={18} />
                      )}
                    </div>
                    <p>
                      <strong>{signal.title}</strong>
                      <span>{signal.description}</span>
                      <small>
                        {signal.direction} · strength {signal.strength} · {signal.createdAt}
                      </small>
                    </p>
                  </div>
                ))}
              </div>
            </article>
          )}

          {(activeView === "dashboard" || activeView === "learning") && (
            <article className="panel cockpitPanel">
              <div>
                <p className="eyebrow">Learning Memory</p>
                <h2>Automatic Learning Cards</h2>
              </div>
              <div className="misfit">
                <Users size={22} />
                <div>
                  <strong>Current action posture</strong>
                  <p>
                    {dominantDomain.key === "complex"
                      ? "Design multiple probes, monitor weak signals, and avoid one-shot rollout."
                      : "Use the current domain candidate as a facilitation prompt before acting."}
                  </p>
                </div>
              </div>
              <div className="learningList">
                {probes
                  .filter((probe) => probe.status === "Completed")
                  .map((probe) => (
                    <div className="learningCard" key={probe.id}>
                      <BookOpen size={18} />
                      <span>{probe.title} completed. Convert observed signals into reusable learning.</span>
                    </div>
                  ))}
                {signals.slice(0, 3).map((signal) => (
                  <div className="learningCard" key={signal.id}>
                    <Radar size={18} />
                    <span>{signal.title}</span>
                  </div>
                ))}
              </div>
            </article>
          )}
        </section>
      </section>
    </main>
  );
}
