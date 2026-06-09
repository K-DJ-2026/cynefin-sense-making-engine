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

type AiSuggestion = {
  summary: string;
  recommendedType: string;
  recommendedTags: string;
  reflectionQuestions: string[];
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

export default function Home() {
  const [activeView, setActiveView] = useState<ViewKey>("dashboard");
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [probes, setProbes] = useState<Probe[]>(initialProbes);
  const [signals, setSignals] = useState<Signal[]>(initialSignals);
  const [scores, setScores] = useState<DomainScores>(initialScores);
  const [query, setQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [storyNotice, setStoryNotice] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);

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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          stories: Story[];
          probes: Probe[];
          signals: Signal[];
          scores: DomainScores;
        };
        setStories(parsed.stories);
        setProbes(parsed.probes);
        setSignals(parsed.signals);
        setScores(parsed.scores);
      }
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ stories, probes, signals, scores }),
    );
  }, [isLoaded, probes, scores, signals, stories]);

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
    if (!probeDraft.title.trim() || !probeDraft.hypothesis.trim()) return;
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
    setActiveView("probes");
  }

  function addSignal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signalDraft.title.trim()) return;
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
    setActiveView("signals");
  }

  function resetDemoData() {
    setStories(initialStories);
    setProbes(initialProbes);
    setSignals(initialSignals);
    setScores(initialScores);
    window.localStorage.removeItem(storageKey);
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
                <FlaskConical size={22} />
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
                <BrainCircuit size={22} />
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
