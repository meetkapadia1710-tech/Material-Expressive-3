interface RoadmapTopic {
  id: string;
  title: string;
  area: string;
  focus: string;
  milestone: string;
  stepIndex: 1 | 2 | 3 | 4; // 1: Architecture, 2: Prototyping, 3: Implementation, 4: Production
  details: string[];
}

const roadmapTopics: RoadmapTopic[] = [
  {
    id: "dist-sys",
    title: "Distributed Systems & Consensus",
    area: "Backend Infrastructure",
    focus: "Raft consensus, vector clocks, leader election, and split-brain resolution.",
    milestone: "Phase 3 • Implementation",
    stepIndex: 3,
    details: ["Log replication state machine in Go", "Heartbeat & election timer jitter", "RPC failure recovery"],
  },
  {
    id: "k8s",
    title: "Kubernetes & Cloud-Native Orchestration",
    area: "DevOps & Cloud",
    focus: "Multi-container pods, Custom Resource Definitions (CRDs), Helm charts, and ingress routing.",
    milestone: "Phase 2 • Prototyping",
    stepIndex: 2,
    details: ["Cluster autoscaling & resource quotas", "Declarative GitOps deployments", "Network policies"],
  },
  {
    id: "wasm",
    title: "WebAssembly (Wasm) & Edge Compute",
    area: "High-Performance Systems",
    focus: "Rust/Go to Wasm compilation, linear memory isolation, and SIMD browser operations.",
    milestone: "Phase 1 • Architecture",
    stepIndex: 1,
    details: ["Memory bridging with JavaScript runtime", "Edge runtime execution", "Micro-benchmark suites"],
  },
  {
    id: "go-systems",
    title: "Advanced Go Systems & Concurrency",
    area: "Core Language Mastery",
    focus: "Channel pipelines, bounded worker pools, context cancellation, and zero-allocation buffers.",
    milestone: "Phase 4 • Production Ready",
    stepIndex: 4,
    details: ["Benchmarked against standard library", "Deadlock prevention with race detector", "High-throughput TCP streams"],
  },
  {
    id: "langgraph",
    title: "Agentic AI & Cyclic State Machines",
    area: "Modern AI Engineering",
    focus: "LangGraph cyclical execution, tool calling checkpoints, and multi-agent coordination.",
    milestone: "Phase 3 • Implementation",
    stepIndex: 3,
    details: ["State graph node routing", "Human-in-the-loop interruption", "Vector persistence with Redis"],
  },
];

export function LearningRoadmap() {
  return (
    <aside className="roadmap-container" aria-labelledby="roadmap-heading">
      <div className="roadmap-header">
        <p className="eyebrow">Continuous Evolution</p>
        <h2 id="roadmap-heading">Active Explorations & Systems Roadmap</h2>
        <p className="roadmap-subtitle">
          Current deep-dives spanning distributed consensus, container orchestration, low-level concurrency, and multi-agent AI.
        </p>
      </div>

      <div className="roadmap-grid">
        {roadmapTopics.map((topic) => (
          <div key={topic.id} className="roadmap-card" data-pointer-effect="card">
            <div className="roadmap-card-top">
              <span className="roadmap-area-tag">{topic.area}</span>
              <span className="roadmap-milestone-pill" data-step={topic.stepIndex}>
                {topic.milestone}
              </span>
            </div>

            <h3 className="roadmap-topic-title">{topic.title}</h3>
            <p className="roadmap-focus-text">{topic.focus}</p>

            {/* Custom visual progress track using step classes without % or forbidden tags */}
            <div className="roadmap-track-container" aria-hidden="true">
              <div className={`roadmap-track-fill step-${topic.stepIndex}`} />
            </div>

            <ul className="roadmap-details-list">
              {topic.details.map((detail, idx) => (
                <li key={idx} className="roadmap-detail-item">
                  <span className="roadmap-bullet" aria-hidden="true">▸</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
