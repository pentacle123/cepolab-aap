"use client";
import { useState, useCallback } from "react";

/* ═══ PRELOADED MCP DATA ═══ */
import PRELOADED from "./data/preloaded.json";

/* ═══ Brand DNA ═══ */
var BRAND_SCIENCE = [
  { icon: "🧬", title: "세리포리아 락세라타", desc: "당뇨 신약 연구 중 발견" },
  { icon: "⚡", title: "AGEs 억제 원천기술", desc: "최종당화산물 억제" },
  { icon: "💎", title: "CLEPS® 92.8%", desc: "10년 150억 R&D" },
  { icon: "🧪", title: "5성분 미니멀", desc: "친환경 배양" },
  { icon: "🏥", title: "세포랩RX", desc: "피부과 더마 사이언스" },
];
var BRAND_PRODUCTS = [
  { icon: "🧴", title: "바이오제닉 에센스 90%" },
  { icon: "🧴", title: "에센스 하이드레이션" },
  { icon: "🧴", title: "에센스 블렌디드 50%" },
  { icon: "🧼", title: "바이오제닉 솝" },
  { icon: "🎭", title: "바이오제닉 마스크" },
];
var BRAND_COMMERCIAL = [
  { icon: "📢", title: "화장품 보다 먼저 세포랩", desc: "프리케어 포지셔닝" },
  { icon: "🎯", title: "프리케어 에센스", desc: "카테고리 선점" },
  { icon: "💬", title: "피부도 세포니까, 세포랩", desc: "슬로건" },
  { icon: "⭐", title: "김민하 모델", desc: "2025~" },
];
var BRAND_SHORT = "세포랩(CEPOLAB): 퓨젠바이오(모회사)가 당뇨 신약 연구 중 세리포리아 락세라타를 우연히 발견. AGEs(최종당화산물) 억제 원천기술. CLEPS® 92.8% 고함량. 자체 R&D에 10년간 150억 투입(외부 투자 아님, 자체 연구개발비). '화장품 보다 먼저 세포랩' 프리케어 포지셔닝. 제품: 바이오제닉 에센스 90%, 하이드레이션, 블렌디드 50%, 솝, 마스크. 타겟: 4050 여성.\n\n⚠️ 중요: 사실과 다른 내용을 만들지 마라. '투자받은', '상장한', 'FDA 승인' 등 확인되지 않은 표현 금지. 브랜드 정보에 없는 사실을 추가하지 마라.";

var CATS = [
  { id: "science", label: "과학/바이오", icon: "🔬", color: "#5B6ABF" },
  { id: "slowaging", label: "저속노화", icon: "🧬", color: "#2D8B5F" },
  { id: "derma", label: "피부과/의학", icon: "🏥", color: "#3B82C4" },
  { id: "food", label: "요리/푸드사이언스", icon: "🍳", color: "#D97706" },
  { id: "sugar", label: "혈당/당독소", icon: "🩸", color: "#C4503A" },
  { id: "fitness", label: "운동/피트니스", icon: "🏃", color: "#7C5BBF" },
  { id: "wellness", label: "수면/웰니스", icon: "🌙", color: "#9B6DBF" },
  { id: "ferment", label: "커피/와인/발효", icon: "☕", color: "#4B8B3B" },
  { id: "docu", label: "다큐/과학교양", icon: "🎬", color: "#BF5B8A" },
  { id: "discovery", label: "발견/디스커버리", icon: "💡", color: "#C4963A" },
];

var C = { bg: "#FDFBF7", card: "#FFFFFF", alt: "#FAF7F0", gold: "#C4963A", goldDeep: "#8B6914", goldLight: "#F5ECD7", text: "#2C2417", sub: "#8C7E6A", muted: "#B8AD9C", border: "#E8E2D6", accent: "#6366f1", green: "#2D8B5F", red: "#C4503A" };

/* ═══ API ═══ */
function wt(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
async function apiCall(body, retries, timeout) {
  if (!retries) retries = 3; if (!timeout) timeout = 60000;
  for (var a = 0; a < retries; a++) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var tid = setTimeout(function() { if (ctrl) ctrl.abort(); }, timeout);
    try {
      var opts = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
      if (ctrl) opts.signal = ctrl.signal;
      var r = await fetch("/api/claude", opts);
      clearTimeout(tid);
      if (r.status === 429 || r.status >= 500) { if (a < retries - 1) { await wt(Math.pow(2, a + 1) * 3000); continue; } return { ok: false, text: "API " + r.status }; }
      if (!r.ok) return { ok: false, text: "API " + r.status };
      var d = await r.json();
      if (d.error) { if (a < retries - 1) { await wt(5000); continue; } return { ok: false, text: d.error.message }; }
      return { ok: true, text: (d.content || []).filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("\n") || "" };
    } catch (e) { clearTimeout(tid); if (a < retries - 1) { await wt(3000); continue; } return { ok: false, text: e.message }; }
  }
  return { ok: false, text: "재시도 초과" };
}
async function callAI(s, u, maxTk) { var tk = maxTk || 4000; var timeout = tk >= 6000 ? 90000 : 55000; var res = await apiCall({ model: "claude-sonnet-4-20250514", max_tokens: tk, system: s, messages: [{ role: "user", content: u }] }, 3, timeout); return res.ok ? res.text : "(오류)"; }

/* ═══ Idea Parser — flexible ═══ */
function parseIdeas(text) {
  if (!text || text.length < 30) return [];
  var chunks = text.split(/(?=\*\*제목\*\*)/).filter(function(c) { return c.indexOf("**제목**") >= 0; });
  return chunks.map(function(chunk) {
    var get = function(key) { var m = chunk.match(new RegExp("\\*\\*" + key + "\\*\\*[:\\s]*(.+)", "i")); return m ? m[1].trim() : ""; };
    var cm = chunk.match(/(?:배경무드|배경)[^#]*#?([A-Fa-f0-9]{6})/);
    return { title: get("제목"), hook: get("썸네일 후킹") || get("후킹"), bgColor: cm ? cm[1] : "8B6914", message: get("핵심 메시지") || get("메시지"), product: get("연결 상품") || get("상품"), why: get("왜 지금"), target: get("타겟"), demand: get("수요 근거") || get("수요") };
  }).filter(function(x) { return x.title; });
}

/* ═══ Phone Mockup ═══ */
function PhoneMockup({ hook, bgColor, product }) {
  var bg = "#" + (bgColor || "8B6914"), hex = bgColor || "8B6914";
  var luma = ((parseInt(hex.substring(0, 2), 16) || 0) * 299 + (parseInt(hex.substring(2, 4), 16) || 0) * 587 + (parseInt(hex.substring(4, 6), 16) || 0) * 114) / 1000;
  var tc = luma > 150 ? "#1a1a1a" : "#fff", dc = luma > 150 ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.4)";
  return <div style={{ width: 58, flexShrink: 0 }}>
    <div style={{ width: 58, height: 100, borderRadius: 10, background: bg, position: "relative", overflow: "hidden", border: "2px solid " + C.border, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 4px 0" }}><span style={{ color: dc, fontSize: 5, fontWeight: 700 }}>9:41</span><div style={{ width: 16, height: 3.5, borderRadius: 2, background: dc }} /></div>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "82%", textAlign: "center", fontSize: 7.5, fontWeight: 800, color: tc, lineHeight: 1.25, wordBreak: "keep-all" }}>{hook || ""}</div>
      {product && <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", padding: "1px 4px", borderRadius: 3, background: C.gold, color: "#fff", fontSize: 4.5, fontWeight: 700, whiteSpace: "nowrap" }}>{product.length > 12 ? product.substring(0, 12) + "…" : product}</div>}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "2px 4px 2px" }}><span style={{ fontSize: 4, color: dc, fontWeight: 600, letterSpacing: "0.05em" }}>cepolab</span></div>
    </div>
  </div>;
}

/* ═══ Idea Card with Demand ═══ */
function IdeaCard({ idea, idx }) {
  return <div style={{ padding: 10, borderRadius: 8, background: "#" + idea.bgColor + "06", border: "1px solid #" + idea.bgColor + "18", display: "flex", gap: 8 }}>
    <PhoneMockup hook={idea.hook} bgColor={idea.bgColor} product={idea.product} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.35, marginBottom: 4 }}>{idea.title}</div>
      {idea.hook && <div style={{ fontSize: 10, marginBottom: 4 }}><span style={{ padding: "1px 4px", borderRadius: 3, background: C.gold, color: "#fff", fontSize: 7, fontWeight: 700, marginRight: 4 }}>HOOK</span><span style={{ color: C.sub }}>{idea.hook}</span></div>}
      {idea.message && <div style={{ fontSize: 10, color: C.sub, marginBottom: 2 }}><strong style={{ color: C.goldDeep }}>메시지</strong> {idea.message}</div>}
      {idea.product && <div style={{ fontSize: 10, marginBottom: 2 }}><strong style={{ color: C.goldDeep }}>연결</strong> <span style={{ padding: "1px 4px", borderRadius: 3, background: C.goldLight, color: C.goldDeep, fontWeight: 600, fontSize: 9 }}>{idea.product}</span></div>}
      {idea.why && <div style={{ fontSize: 10, color: C.sub }}><strong style={{ color: C.goldDeep }}>왜 지금</strong> {idea.why}</div>}
      {idea.target && <div style={{ fontSize: 10, color: C.sub }}><strong style={{ color: C.goldDeep }}>타겟</strong> {idea.target}</div>}
      {idea.demand && <div style={{ fontSize: 10, marginTop: 3, padding: "3px 6px", borderRadius: 4, background: C.accent + "08", border: "1px solid " + C.accent + "15" }}><strong style={{ color: C.accent }}>📊 수요</strong> <span style={{ color: C.sub }}>{idea.demand}</span></div>}
    </div>
  </div>;
}

/* ═══ Perspective Section with Regen ═══ */
function PerspectiveSection({ icon, title, subtitle, color, description, ideas, loading, onRegen }) {
  var _o = useState(true), open = _o[0], setOpen = _o[1];
  var parsed = parseIdeas(ideas);
  return <div style={{ marginBottom: 8, borderRadius: 10, border: "1.5px solid " + color + "25", background: C.card, overflow: "hidden" }}>
    <div onClick={function() { setOpen(!open); }} style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: color + "06" }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: color }}>{title} <span style={{ fontSize: 10, fontWeight: 400, color: C.muted }}>{subtitle}</span></div>
        {description && <div style={{ fontSize: 10, color: C.sub, marginTop: 1 }}>{description}</div>}
      </div>
      <span style={{ fontSize: 10, color: C.muted }}>{parsed.length > 0 ? parsed.length + "개 아이디어" : ""}</span>
      <span style={{ color: color, fontSize: 10, fontWeight: 800 }}>{open ? "▴" : "▾"}</span>
    </div>
    {open && <div style={{ padding: "8px 12px 12px" }}>
      {loading ? <div style={{ textAlign: "center", padding: 14, fontSize: 11, color: C.gold, animation: "pulse 1.5s ease infinite" }}>🔄 새로운 아이디어 생성 중...</div>
      : parsed.length > 0 ? <div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{parsed.map(function(idea, i) { return <IdeaCard key={i} idea={idea} idx={i} />; })}</div>
        {onRegen && <div style={{ textAlign: "right", marginTop: 6 }}><button onClick={function(e) { e.stopPropagation(); onRegen(); }} style={{ padding: "4px 10px", borderRadius: 5, border: "1px solid " + color + "30", background: "transparent", color: color, fontSize: 9, fontWeight: 700, cursor: "pointer" }}>🔄 다른 각도로 재생성</button></div>}
      </div>
      : ideas ? <div>
        <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.6, whiteSpace: "pre-line" }}>{ideas}</div>
        {onRegen && <div style={{ textAlign: "right", marginTop: 6 }}><button onClick={function(e) { e.stopPropagation(); onRegen(); }} style={{ padding: "4px 10px", borderRadius: 5, border: "1px solid " + color + "30", background: "transparent", color: color, fontSize: 9, fontWeight: 700, cursor: "pointer" }}>🔄 다른 각도로 재생성</button></div>}
      </div>
      : <div style={{ fontSize: 11, color: C.muted, textAlign: "center", padding: 10 }}>생성 중...</div>}
    </div>}
  </div>;
}

/* ═══ Process Flow ═══ */
function ProcessFlow({ phase }) {
  var st = [{ l: "클러스터 발견", ic: "🎯" }, { l: "경로 발견", ic: "🗺️" }, { l: "AI 인사이트", ic: "💡" }];
  var pI = { cluster: 0, path: 1, ai: 2, done: 3 }, ci = pI[phase] !== undefined ? pI[phase] : -1;
  return <div style={{ display: "flex", padding: "6px 0" }}>{st.map(function(x, i) {
    var dn = i < ci, ac = i === ci;
    return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", opacity: dn || ac ? 1 : 0.3 }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: dn || ac ? C.gold + "15" : C.alt, border: "2px solid " + (dn || ac ? C.gold : C.border), display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 2, animation: ac ? "pulse 1.5s ease infinite" : "none" }}><span style={{ fontSize: 12 }}>{x.ic}</span></div>
      <div style={{ fontSize: 9, fontWeight: 700, color: dn || ac ? C.text : C.muted }}>{x.l}</div>
      {i < 2 && <div style={{ position: "absolute", top: 14, left: "calc(50% + 16px)", width: "calc(100% - 32px)", height: 2, borderRadius: 1, background: dn ? C.gold + "35" : C.border }} />}
    </div>;
  })}</div>;
}

/* ═══ Result Card — 3 Perspectives ═══ */
function ResultCard({ cat, data, onRegen }) {
  var _o = useState(true), open = _o[0], setOpen = _o[1];
  return <div style={{ marginBottom: 10, borderRadius: 12, border: "2px solid " + C.border, background: C.card, overflow: "hidden" }}>
    <div onClick={function() { setOpen(!open); }} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: open ? C.alt : C.card }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: cat.color + "12", border: "2px solid " + cat.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{cat.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: cat.color }}>{cat.label}</div>
        <div style={{ fontSize: 10, color: C.sub }}>{data.pre ? (data.pre.ps === "verified" ? "🟢 경로 확인" : "🟡 블루오션") : ""} · {data.pre ? data.pre.di.substring(0, 40) + "..." : ""}</div>
      </div>
      <span style={{ color: cat.color, fontSize: 11, fontWeight: 800 }}>{open ? "▴" : "▾"}</span>
    </div>
    {open && <div style={{ padding: "0 14px 14px", borderTop: "1px solid " + C.border }}>
      <ProcessFlow phase="done" />
      
      <PerspectiveSection
        icon="🎯" title="클러스터 발견" subtitle="Cluster Finder"
        color={C.accent}
        description={"소비자가 이런 맥락에서 검색한다 → 이 맥락에 세포랩 콘텐츠를 놓자"}
        ideas={data.clusterIdeas || ""}
        loading={data.clusterLoading}
        onRegen={onRegen ? function() { onRegen(cat.id, "cluster"); } : null}
      />
      <PerspectiveSection
        icon="🗺️" title="경로 발견" subtitle="Path Finder"
        color={C.green}
        description={(data.pre && data.pre.ps === "verified" ? "🟢 확인된 경로 위에 콘텐츠를 놓자" : "🟡 이 블루오션에 다리를 놓자")}
        ideas={data.pathIdeas || ""}
        loading={data.pathLoading}
        onRegen={onRegen ? function() { onRegen(cat.id, "path"); } : null}
      />
      <PerspectiveSection
        icon="💡" title="AI 크리에이티브 인사이트" subtitle="Creative Jump"
        color={C.gold}
        description={"데이터에 직접 없지만, 브랜드 자산 × 관심사 교차에서 발견한 의외의 연결"}
        ideas={data.aiIdeas || ""}
        loading={data.aiLoading}
        onRegen={onRegen ? function() { onRegen(cat.id, "ai"); } : null}
      />
    </div>}
  </div>;
}

/* ═══ Bottle ═══ */
function Bottle() {
  return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "floatB 5s ease-in-out infinite" }}>
    <div style={{ width: 10, height: 5, background: "linear-gradient(180deg,#e0d1a0,#b8a370)", borderRadius: "2px 2px 0 0" }} />
    <div style={{ width: 7, height: 8, borderLeft: "1px solid " + C.border, borderRight: "1px solid " + C.border }} />
    <div style={{ width: 36, height: 58, borderRadius: "3px 3px 4px 4px", background: "linear-gradient(135deg," + C.goldLight + "," + C.bg + ")", border: "1px solid " + C.border, position: "relative" }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "76%", background: "linear-gradient(180deg," + C.gold + "06," + C.gold + "18)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <div style={{ fontSize: 5.5, fontWeight: 700, color: C.gold, letterSpacing: "0.1em" }}>cepoLAB</div>
        <div style={{ fontSize: 4, color: C.muted, margin: "1px 0" }}>BIOGENIC</div>
        <div style={{ fontSize: 3.5, color: C.gold, fontWeight: 700, padding: "0.5px 2px", border: "0.5px solid " + C.gold + "25", borderRadius: 1 }}>CLEPS®</div>
      </div>
    </div>
  </div>;
}

/* ═══ IDEA PROMPT TEMPLATE ═══ */
var SYS_BASE = '숏폼 크리에이티브 디렉터. 소비자가 "이게 화장품 광고?" 놀랄 콘텐츠를 만든다. 뷰티 밖 관심사에서 세포랩을 자연스럽게 발견하게 하는 콘텐츠.\n\n' + BRAND_SHORT + '\n\n⚠️ 절대 규칙 — 사실이 아닌 내용 금지:\n1. 제목/후킹에 사실 주장을 넣지 마라. "~한 이유", "~가 밝혀졌다" 같은 표현은 반드시 실제 사실이어야 한다.\n2. 모르는 사실을 만들지 마라. 모델의 경력, 기업의 재무, 연구 결과 등을 추측하지 마라.\n3. 후킹은 "질문형"이나 "호기심 유발형"을 사용하라. 예: "이 성분 뭔데?", "당뇨약 연구하다 생긴 일", "스테이크 굽는 그 반응, 피부에서도?"\n4. 확인된 사실만 사용: 당뇨 신약 연구 중 발견, AGEs 억제, CLEPS 92.8%, 5성분 미니멀, 자체 R&D 10년 150억.\n5. 클러스터 키워드는 "소비자가 이렇게 검색한다"는 데이터일 뿐, 사실이 아니다. "퓨젠바이오 주식"이 검색됐다고 "투자받았다"가 아니다.';
var IDEA_FORMAT = '\n\n각 아이디어는 이 형식:\n\n**제목**: [릴스/숏폼] 구체적 SNS 제목. 사실이 아닌 주장 금지.\n**썸네일 후킹**: 15자 이내. 질문형/호기심형 권장 (사실 주장 금지)\n**배경무드**: HEX 6자리\n**핵심 메시지**: 한 줄\n**연결 상품**: 세포랩 제품명\n**왜 지금**: 한 줄\n**타겟**: 구체적 페르소나\n**수요 근거**: 관련 검색량/트렌드 한 줄';

/* ═══ Main ═══ */
export default function App() {
  var _sel = useState({}), sel = _sel[0], setSel = _sel[1];
  var _data = useState({}), catData = _data[0], setCatData = _data[1];
  var _ph = useState({}), phases = _ph[0], setPhases = _ph[1];
  var _st = useState("main"), status = _st[0], setStatus = _st[1];
  var _msg = useState(""), gMsg = _msg[0], setGMsg = _msg[1];
  var _toast = useState(null), toast = _toast[0], setToast = _toast[1];

  function tog(id) { setSel(function(p) { var n = Object.assign({}, p); n[id] = !n[id]; return n; }); }
  function selAll() { var n = {}; CATS.forEach(function(c) { n[c.id] = true; }); setSel(n); }
  function selNone() { setSel({}); }
  var selCount = Object.values(sel).filter(Boolean).length;
  function showT(msg) { setToast(msg); setTimeout(function() { setToast(null); }, 2500); }

  /* ═══ Regenerate single perspective ═══ */
  var regenPerspective = useCallback(async function(catId, perspType) {
    var cat = CATS.find(function(c) { return c.id === catId; });
    if (!cat) return;
    var pre = PRELOADED[catId] || {};
    var prev = catData[catId] || {};
    var prevIdeas = prev[perspType + "Ideas"] || "";

    /* Mark as loading */
    setCatData(function(pv) { var n = Object.assign({}, pv); n[catId] = Object.assign({}, n[catId] || {}, { [perspType + "Loading"]: true }); return n; });

    var avoidPrompt = prevIdeas.length > 50 ? '\n\n⚠️ 이전에 나온 아이디어:\n' + prevIdeas.substring(0, 400) + '\n\n위와 완전히 다른 각도, 다른 소재, 다른 포맷의 아이디어를 만들어라. 같은 방향 반복 금지.' : '';
    var result = "";

    try {
      if (perspType === "cluster") {
        var clusterInput = '[카테고리] ' + cat.label + '\n[클러스터 데이터]\n' + (pre.clusters || []).join('\n') + '\n[수요] ' + (pre.di || '') + '\n[CEP] ' + (pre.cep || '');
        result = await callAI(
          SYS_BASE + '\n\n"클러스터 발견" 관점. Cluster Finder가 발견한 소비자 검색 맥락(CEP)에서 아이디어를 만들어라.',
          clusterInput + avoidPrompt + '\n\n위 클러스터에서 발견된 서로 다른 소비자 맥락에서 정확히 2개 숏폼 아이디어.' + IDEA_FORMAT, 6000
        );
      } else if (perspType === "path") {
        var pathInput = '[카테고리] ' + cat.label + '\n[경로 상태] ' + (pre.ps === "verified" ? "🟢 확인됨" : "🟡 블루오션") + '\n[경로 데이터]\n' + (pre.paths || []).join('\n') + '\n[수요] ' + (pre.di || '');
        result = await callAI(
          SYS_BASE + '\n\n"경로 발견" 관점. Path Finder가 발견한 소비자 검색 경로에서 아이디어를 만들어라.\n- 경로 확인: 그 경로 위에 놓을 콘텐츠\n- 블루오션: 빈 연결을 채울 콘텐츠',
          pathInput + avoidPrompt + '\n\n위 경로 데이터에서 정확히 2개 숏폼 아이디어.' + IDEA_FORMAT, 6000
        );
      } else {
        var aiInput = '[카테고리] ' + cat.label + '\n[데이터 요약] CEP: ' + (pre.cep || '').substring(0, 150) + '\n경로: ' + (pre.ps === "verified" ? "확인" : "블루오션") + '\n수요: ' + (pre.di || '').substring(0, 100);
        result = await callAI(
          SYS_BASE + '\n\n"AI 크리에이티브 인사이트" 관점. 데이터에 직접 없지만 브랜드 자산 × 관심사 교차에서 나오는 의외의 연결. "세상을 바꾼 실수들 — 페니실린, 포스트잇, 세포랩" 수준의 크리에이티브 점프.',
          aiInput + avoidPrompt + '\n\n브랜드 자산 × "' + cat.label + '" 교차에서 정확히 2개 숏폼 아이디어. 데이터에 갇히지 말고 뛰어라.' + IDEA_FORMAT, 6000
        );
      }
    } catch (e) { result = "⚠️ " + e.message; }

    setCatData(function(pv) { var n = Object.assign({}, pv); n[catId] = Object.assign({}, n[catId] || {}, { [perspType + "Ideas"]: result, [perspType + "Loading"]: false }); return n; });
  }, [catData]);

  /* ═══ Scan — 3 PERSPECTIVES ═══ */
  var scanOne = useCallback(async function(cat) {
    var pre = PRELOADED[cat.id] || {};
    try {
      /* PERSPECTIVE 1: Cluster-based ideas */
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "cluster"; return n; });
      await wt(1000); /* 데이터 로딩 시뮬레이션 */
      var clusterInput = '[카테고리] ' + cat.label + '\n[클러스터 데이터]\n' + (pre.clusters || []).join('\n') + '\n[수요] ' + (pre.di || '') + '\n[CEP] ' + (pre.cep || '');
      var clusterIdeas = await callAI(
        SYS_BASE + '\n\n"클러스터 발견" 관점. Cluster Finder가 발견한 소비자 검색 맥락(CEP)에서 아이디어를 만들어라. 각 클러스터가 보여주는 소비자 맥락마다 콘텐츠 기회가 다르다.',
        clusterInput + '\n\n위 클러스터에서 발견된 서로 다른 소비자 맥락에서 정확히 2개 숏폼 아이디어.' + IDEA_FORMAT, 6000
      );
      setCatData(function(pv) { var n = Object.assign({}, pv); n[cat.id] = Object.assign({}, n[cat.id] || {}, { pre: pre, clusterIdeas: clusterIdeas }); return n; });
      await wt(1500);

      /* PERSPECTIVE 2: Path-based ideas */
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "path"; return n; });
      await wt(1000); /* 데이터 로딩 시뮬레이션 */
      var pathInput = '[카테고리] ' + cat.label + '\n[경로 상태] ' + (pre.ps === "verified" ? "🟢 확인됨" : "🟡 블루오션") + '\n[경로 데이터]\n' + (pre.paths || []).join('\n') + '\n[수요] ' + (pre.di || '');
      var pathIdeas = await callAI(
        SYS_BASE + '\n\n"경로 발견" 관점. Path Finder가 발견한 소비자 검색 경로에서 아이디어를 만들어라.\n- 경로 확인: 그 경로 위에 놓을 콘텐츠\n- 블루오션: 빈 연결을 채울 콘텐츠 (이 관심사에서 세포랩까지 다리를 놓는 콘텐츠)',
        pathInput + '\n\n위 경로 데이터에서 정확히 2개 숏폼 아이디어.' + IDEA_FORMAT, 6000
      );
      setCatData(function(pv) { var n = Object.assign({}, pv); n[cat.id] = Object.assign({}, n[cat.id] || {}, { pathIdeas: pathIdeas }); return n; });
      await wt(1500);

      /* PERSPECTIVE 3: AI Creative Insight */
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "ai"; return n; });
      await wt(800); /* 데이터 로딩 시뮬레이션 */
      var aiInput = '[카테고리] ' + cat.label + '\n[데이터 요약] CEP: ' + (pre.cep || '').substring(0, 150) + '\n경로: ' + (pre.ps === "verified" ? "확인" : "블루오션") + '\n수요: ' + (pre.di || '').substring(0, 100);
      var aiIdeas = await callAI(
        SYS_BASE + '\n\n"AI 크리에이티브 인사이트" 관점. 데이터에 직접 나오지 않지만, 이 관심사 카테고리와 세포랩의 브랜드 자산을 교차시키면 나오는 의외의 연결에서 아이디어를 만들어라.\n\n"세상을 바꾼 실수들 — 페니실린, 포스트잇, 세포랩" 수준의 크리에이티브 점프. 데이터가 방향만 잡아줬으니 자유롭게 뛰어라.',
        aiInput + '\n\n브랜드 자산 × "' + cat.label + '" 교차에서 정확히 2개 숏폼 아이디어. 데이터에 갇히지 말고 뛰어라.' + IDEA_FORMAT, 6000
      );
      setCatData(function(pv) { var n = Object.assign({}, pv); n[cat.id] = Object.assign({}, n[cat.id] || {}, { aiIdeas: aiIdeas }); return n; });
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "done"; return n; });
    } catch (err) {
      setCatData(function(pv) { var n = Object.assign({}, pv); n[cat.id] = { pre: pre, clusterIdeas: "⚠️ " + err.message, pathIdeas: "", aiIdeas: "" }; return n; });
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "done"; return n; });
    }
  }, []);

  var startScan = useCallback(async function() {
    setStatus("scanning"); setCatData({}); setPhases({});
    var cs = CATS.filter(function(c) { return sel[c.id]; });
    for (var i = 0; i < cs.length; i++) {
      setGMsg(cs[i].icon + " " + cs[i].label + " (" + (i + 1) + "/" + cs.length + ")");
      await scanOne(cs[i]);
      if (i < cs.length - 1) await wt(1000);
    }
    setStatus("done"); setGMsg("");
  }, [sel, scanOne]);

  var doneCount = Object.keys(catData).length;

  return <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Pretendard Variable', -apple-system, sans-serif" }}>
    <style>{`@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}@keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px" }}>
      {/* Header */}
      <div style={{ padding: "12px 0", borderBottom: "2px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ padding: "4px 10px", borderRadius: 5, background: C.gold, color: "#fff", fontSize: 9, fontWeight: 900, letterSpacing: "0.08em" }}>AI ALGORITHM PERFORMANCE</div>
          <span style={{ fontSize: 16, fontWeight: 900 }}>세포랩</span>
        </div>
        <span style={{ fontSize: 8, color: C.muted }}>ListeningMind × Claude AI</span>
      </div>

      {/* MAIN */}
      {status === "main" && <div style={{ animation: "fadeIn 0.4s ease" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 20, padding: "20px 0", borderBottom: "1px solid " + C.border }}>
          <div>
            <div style={{ padding: "2px 7px", borderRadius: 3, background: C.goldLight, color: C.goldDeep, fontSize: 8, fontWeight: 700, display: "inline-block", marginBottom: 10 }}>CROSS-CATEGORY CONTENT STRATEGY</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.4, marginBottom: 8 }}>뷰티에 갇히지 마세요.<br/><span style={{ color: C.gold }}>10개 관심사</span>에서<br/>세포랩을 발견하게 만듭니다.</h1>
            <p style={{ fontSize: 11, color: C.sub, lineHeight: 1.7, marginBottom: 14 }}>세포랩의 브랜드 자산을 소비자 관심사와 연결하고,<br/>리스닝마인드 검색 데이터로 기회를 검증합니다.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: C.gold + "06", border: "1px solid " + C.gold + "12" }}>
              <Bottle />
              <div style={{ display: "flex", gap: 12 }}>
                <div><div style={{ fontSize: 18, fontWeight: 800, color: C.gold }}>128,840</div><div style={{ fontSize: 8, color: C.muted }}>월 검색량</div></div>
                <div><div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>+98%</div><div style={{ fontSize: 8, color: C.muted }}>성장률</div></div>
              </div>
            </div>
          </div>
          {/* Brand DNA */}
          <div style={{ padding: 12, borderRadius: 10, border: "1.5px solid " + C.border, background: C.card }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}><span style={{ fontSize: 13 }}>🧬</span><span style={{ fontSize: 12, fontWeight: 800 }}>브랜드 자산</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 4 }}>
              <div style={{ padding: 6, borderRadius: 6, background: "#f8f6ff", border: "1px solid #e8e6f0" }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: C.accent, marginBottom: 2 }}>🔬 과학</div>
                {BRAND_SCIENCE.map(function(a, i) { return <div key={i} style={{ fontSize: 8, color: C.sub }}>{a.icon} <strong style={{ color: C.text }}>{a.title}</strong></div>; })}
              </div>
              <div style={{ padding: 6, borderRadius: 6, background: "#fffef5", border: "1px solid #f0ebd6" }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: C.gold, marginBottom: 2 }}>🧴 제품</div>
                {BRAND_PRODUCTS.map(function(a, i) { return <div key={i} style={{ fontSize: 8, color: C.sub }}>{a.icon} <strong style={{ color: C.text }}>{a.title}</strong></div>; })}
              </div>
            </div>
            <div style={{ padding: 6, borderRadius: 6, background: "#fff5f5", border: "1px solid #f0e0e0" }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: C.red, marginBottom: 2 }}>📢 커머셜/AD</div>
              {BRAND_COMMERCIAL.map(function(a, i) { return <div key={i} style={{ fontSize: 8, color: C.sub }}>{a.icon} <strong style={{ color: C.text }}>{a.title}</strong> — {a.desc}</div>; })}
            </div>
          </div>
        </div>
        {/* Categories */}
        <div style={{ padding: "12px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800 }}>관심사 카테고리</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={selAll} style={{ background: "none", border: "none", color: C.gold, fontSize: 10, cursor: "pointer", textDecoration: "underline" }}>전체</button>
              <button onClick={selNone} style={{ background: "none", border: "none", color: C.gold, fontSize: 10, cursor: "pointer", textDecoration: "underline" }}>해제</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5, marginBottom: 8 }}>
            {CATS.map(function(c) { var on = !!sel[c.id]; return <div key={c.id} onClick={function() { tog(c.id); }} style={{ padding: 8, borderRadius: 7, border: "2px solid " + (on ? c.color : C.border), background: on ? c.color + "06" : C.card, cursor: "pointer", textAlign: "center" }}>
              <span style={{ fontSize: 14 }}>{c.icon}</span>
              <div style={{ fontSize: 9, fontWeight: on ? 800 : 500, color: on ? C.text : C.sub, marginTop: 2 }}>{c.label}</div>
            </div>; })}
          </div>
          <button onClick={startScan} disabled={selCount === 0} style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: selCount > 0 ? C.gold : C.border, color: selCount > 0 ? "#fff" : C.muted, fontSize: 13, fontWeight: 900, cursor: selCount > 0 ? "pointer" : "default" }}>{selCount > 0 ? selCount + "개 관심사 × 3관점 기회 분석 →" : "관심사를 선택해주세요"}</button>
        </div>
      </div>}

      {/* SCANNING / DONE */}
      {(status === "scanning" || status === "done") && <div style={{ padding: "12px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid " + C.border, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>분석 결과</span>
            <span style={{ fontSize: 11, color: C.muted }}>{doneCount} / {CATS.filter(function(c) { return sel[c.id]; }).length}</span>
            {status === "scanning" && gMsg && <span style={{ fontSize: 11, color: C.gold, fontWeight: 700, animation: "pulse 1.5s ease infinite" }}>{gMsg}</span>}
          </div>
          {status === "done" && <button onClick={function() { setStatus("main"); setCatData({}); setPhases({}); }} style={{ padding: "5px 10px", borderRadius: 5, border: "1px solid " + C.border, background: "transparent", color: C.sub, fontSize: 10, cursor: "pointer" }}>↺ 다시</button>}
        </div>
        {CATS.filter(function(c) { return sel[c.id]; }).map(function(c) {
          var d = catData[c.id], p = phases[c.id];
          if (d && d.clusterIdeas) return <ResultCard key={c.id} cat={c} data={d} onRegen={regenPerspective} />;
          if (p && p !== "done") return <div key={c.id} style={{ padding: 12, borderRadius: 10, border: "1.5px solid " + C.border, background: C.card, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: c.color + "10", border: "2px solid " + c.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{c.icon}</div>
              <div><div style={{ fontSize: 13, fontWeight: 700 }}>{c.label}</div><div style={{ display: "inline-block", padding: "2px 6px", borderRadius: 4, background: C.gold, color: "#fff", fontSize: 8, fontWeight: 700, animation: "pulse 1.5s ease infinite" }}>{p === "cluster" ? "🎯 클러스터 아이디어 생성 중..." : p === "path" ? "🗺️ 경로 아이디어 생성 중..." : "💡 AI 인사이트 생성 중..."}</div></div>
            </div>
            <ProcessFlow phase={p} />
          </div>;
          return <div key={c.id} style={{ padding: 10, borderRadius: 8, border: "1px solid " + C.border, background: C.card, marginBottom: 5, opacity: 0.3, display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 14 }}>{c.icon}</span><span style={{ fontSize: 11, color: C.muted }}>{c.label}</span><span style={{ fontSize: 9, color: C.border, marginLeft: "auto" }}>대기</span></div>;
        })}
      </div>}

      <div style={{ padding: "8px 0 14px", fontSize: 8, color: C.border, display: "flex", justifyContent: "space-between" }}><span>ListeningMind × Claude AI — 3-Perspective Analysis</span><span>pentacle for cepolab</span></div>
    </div>
    {toast && <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", padding: "10px 18px", borderRadius: 8, background: C.green + "E8", color: "#fff", fontSize: 12, fontWeight: 600, zIndex: 999, animation: "fadeIn 0.3s ease" }}>{toast}</div>}
  </div>;
}
