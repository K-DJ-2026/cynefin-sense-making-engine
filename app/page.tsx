import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  FlaskConical,
  Layers3,
  LineChart,
  MessageSquareText,
  Network,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const domainData = [
  { label: "Clear", value: 8, color: "var(--clear)" },
  { label: "Complicated", value: 19, color: "var(--complicated)" },
  { label: "Complex", value: 58, color: "var(--complex)" },
  { label: "Chaotic", value: 6, color: "var(--chaotic)" },
  { label: "Aporetic", value: 9, color: "var(--aporetic)" },
];

const stories = [
  {
    type: "Weak Signal",
    title: "현장 매니저들이 같은 정책을 서로 다르게 해석",
    meta: "12 responses · CX / Operation",
    tone: "amber",
  },
  {
    type: "Customer Voice",
    title: "신규 고객 온보딩 중 예상 밖의 우회 행동 증가",
    meta: "8 responses · Product",
    tone: "green",
  },
  {
    type: "Risk Signal",
    title: "AI 자동화 도입 후 책임 경계에 대한 불안 확산",
    meta: "16 responses · AI Transformation",
    tone: "rose",
  },
];

const probes = [
  {
    title: "2주짜리 고객 온보딩 마이크로 실험",
    status: "Running",
    signal: "Success signal 3개 관찰",
    progress: 62,
  },
  {
    title: "부서 간 정책 해석 워크숍",
    status: "Review",
    signal: "Failure signal 기준 보강 필요",
    progress: 28,
  },
  {
    title: "AI 책임 경계 카드 소팅",
    status: "Draft",
    signal: "Safe-to-fail 조건 검토 중",
    progress: 14,
  },
];

const signals = [
  "Complex 이슈에 Best Practice 적용 시도 증가",
  "고객 우회 행동이 특정 세그먼트에 집중",
  "정책 언어보다 현장 사례 기반 설명이 더 빠르게 확산",
];

export default function Home() {
  const conic = `conic-gradient(${domainData
    .map((item, index) => {
      const previous = domainData
        .slice(0, index)
        .reduce((total, entry) => total + entry.value, 0);
      return `${item.color} ${previous}% ${previous + item.value}%`;
    })
    .join(", ")})`;

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
            ["Dashboard", BarChart3],
            ["Story Bank", MessageSquareText],
            ["Cynefin Map", CircleDot],
            ["Probe Portfolio", FlaskConical],
            ["Signal Dashboard", Radar],
            ["Learning Memory", BookOpen],
          ].map(([label, Icon], index) => (
            <a className={index === 0 ? "active" : ""} href="#" key={label as string}>
              <Icon size={18} />
              <span>{label as string}</span>
            </a>
          ))}
        </nav>

        <div className="sidebarPanel">
          <ShieldCheck size={18} />
          <p>AI never fixes the domain. It offers prompts, warnings, and possible patterns.</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace · AI Transformation</p>
            <h1>복잡한 변화 이슈를 함께 감지하고 실험으로 학습하기</h1>
          </div>
          <div className="search">
            <Search size={18} />
            <span>Search stories, probes, signals</span>
          </div>
        </header>

        <section className="metrics" aria-label="Workspace metrics">
          {[
            ["Stories", "128", "이번 주 +18", MessageSquareText],
            ["Active Issues", "14", "Complex 후보 8", Layers3],
            ["Running Probes", "7", "2개 amplify 검토", FlaskConical],
            ["New Signals", "23", "고위험 3", Activity],
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
          <article className="panel domainPanel">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Cynefin Workspace</p>
                <h2>Domain Distribution</h2>
              </div>
              <button className="iconButton" aria-label="Open domain details">
                <ArrowUpRight size={18} />
              </button>
            </div>

            <div className="domainBody">
              <div className="donut" style={{ background: conic }}>
                <div>
                  <strong>58%</strong>
                  <span>Complex</span>
                </div>
              </div>
              <div className="legend">
                {domainData.map((item) => (
                  <div className="legendRow" key={item.label}>
                    <span className="swatch" style={{ background: item.color }} />
                    <span>{item.label}</span>
                    <strong>{item.value}%</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="warning">
              <AlertTriangle size={18} />
              <span>High polarization: facilitator review recommended before choosing action posture.</span>
            </div>
          </article>

          <article className="panel storyPanel">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Story Bank</p>
                <h2>Recent Sense-Making Inputs</h2>
              </div>
              <button className="primaryButton">
                <Sparkles size={17} />
                Add Story
              </button>
            </div>

            <div className="storyList">
              {stories.map((story) => (
                <div className={`story ${story.tone}`} key={story.title}>
                  <span>{story.type}</span>
                  <strong>{story.title}</strong>
                  <p>{story.meta}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel probePanel">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Probe Portfolio</p>
                <h2>Safe-to-Fail Experiments</h2>
              </div>
              <button className="iconButton" aria-label="Open probe portfolio">
                <FlaskConical size={18} />
              </button>
            </div>

            <div className="probeList">
              {probes.map((probe) => (
                <div className="probe" key={probe.title}>
                  <div>
                    <strong>{probe.title}</strong>
                    <span>{probe.signal}</span>
                  </div>
                  <em>{probe.status}</em>
                  <div className="progress" aria-label={`${probe.progress}% complete`}>
                    <span style={{ width: `${probe.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel signalPanel">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Signal Dashboard</p>
                <h2>Emerging Patterns</h2>
              </div>
              <button className="iconButton" aria-label="Review signals">
                <LineChart size={18} />
              </button>
            </div>

            <div className="signalStack">
              {signals.map((signal, index) => (
                <div className="signal" key={signal}>
                  <div>
                    {index === 0 ? <BrainCircuit size={18} /> : <CheckCircle2 size={18} />}
                  </div>
                  <p>{signal}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel cockpitPanel">
            <div>
              <p className="eyebrow">Leadership Cockpit</p>
              <h2>Misfit Alert</h2>
            </div>
            <div className="misfit">
              <Users size={22} />
              <div>
                <strong>Over-simplification warning</strong>
                <p>Complex 58% 이슈에 표준 프로세스 일괄 적용이 논의되고 있습니다.</p>
              </div>
            </div>
            <button className="secondaryButton">
              Review action posture
              <ArrowUpRight size={17} />
            </button>
          </article>
        </section>
      </section>
    </main>
  );
}
