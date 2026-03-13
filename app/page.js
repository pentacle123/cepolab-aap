"use client";
import { useState, useCallback } from "react";

/* ═══ Brand DNA ═══ */
var BRAND_SCIENCE = [
  { icon: "🧬", title: "세리포리아 락세라타", desc: "당뇨 신약 연구 중 발견한 희귀 균주" },
  { icon: "⚡", title: "AGEs 억제 원천기술", desc: "최종당화산물 억제 → 노화 속도 조절" },
  { icon: "💎", title: "CLEPS® 92.8%", desc: "10년 150억 R&D, 단일 유효성분 고함량" },
  { icon: "🧪", title: "5성분 미니멀", desc: "핵심만 담은 포뮬러, 친환경 배양" },
  { icon: "🏥", title: "세포랩RX", desc: "피부과 전문 더마 사이언스 라인" },
  { icon: "💡", title: "디스커버리 스토리", desc: "약을 만들다 화장품을 발견한 과학" },
];
var BRAND_PRODUCTS = [
  { icon: "🧴", title: "바이오제닉 에센스 90%", desc: "155ml 시그니처" },
  { icon: "🧴", title: "에센스 하이드레이션", desc: "155ml" },
  { icon: "🧴", title: "에센스 블렌디드 50%", desc: "100ml" },
  { icon: "🧼", title: "바이오제닉 솝", desc: "100g 비건 세안" },
  { icon: "🎭", title: "바이오제닉 마스크", desc: "15g×4P" },
];
var BRAND_COMMERCIAL = [
  { icon: "📢", title: "화장품 보다 먼저 세포랩", desc: "세안 후 첫 단계 포지셔닝" },
  { icon: "🎯", title: "프리케어 에센스", desc: "카테고리 선점 포지셔닝" },
  { icon: "💬", title: "피부도 세포니까, 세포랩", desc: "브랜드 슬로건" },
  { icon: "⭐", title: "김민하 모델", desc: "2025~ 메인 모델" },
];
var BRAND_DNA_PROMPT = "세포랩(CEPOLAB) 브랜드 자산:\n- 세리포리아 락세라타: 당뇨 신약 연구 중 우연히 발견\n- AGEs(최종당화산물) 억제 원천기술\n- CLEPS® 92.8% 고함량\n- 5성분 미니멀 포뮬러\n- '화장품 보다 먼저 세포랩' — 프리케어 포지셔닝\n- '프리케어 에센스' — 카테고리 선점\n제품: 바이오제닉 에센스 90%, 하이드레이션, 블렌디드 50%, 솝, 마스크\n타겟: 40~50대 여성 핵심\n톤: 제품을 직접 소개하지 말고, 관심사 속에 자연스럽게 녹여라";

/* ═══ 10 Categories — with MCP query keywords ═══ */
var CATS = [
  { id: "science", label: "과학/바이오", icon: "🔬", color: "#5B6ABF", brandHook: "세리포리아 락세라타 + CLEPS + 발견 스토리", clusterKw: "세리포리아", pathKw: "세리포리아 락세라타", demandKw: ["미생물 화장품", "바이오 스킨케어", "발효 화장품 성분"] },
  { id: "slowaging", label: "저속노화", icon: "🧬", color: "#2D8B5F", brandHook: "AGEs 억제 = 피부 기초체력", clusterKw: "저속노화", pathKw: "저속노화", demandKw: ["저속노화", "안티에이징 루틴", "피부 기초체력"] },
  { id: "derma", label: "피부과/의학", icon: "🏥", color: "#3B82C4", brandHook: "세포랩RX + 시술 후 케어", clusterKw: "피부과 에센스", pathKw: "피부과 추천 화장품", demandKw: ["피부과 추천 화장품", "레이저 후 관리", "피부장벽 강화"] },
  { id: "food", label: "요리/푸드사이언스", icon: "🍳", color: "#D97706", brandHook: "AGEs = 마이야르 반응의 체내 버전", clusterKw: "마이야르 반응", pathKw: "마이야르 반응", demandKw: ["마이야르 반응", "당독소 음식", "음식 피부 노화"] },
  { id: "sugar", label: "혈당/당독소", icon: "🩸", color: "#C4503A", brandHook: "당뇨 연구 기원 + AGEs 억제", clusterKw: "최종당화산물", pathKw: "최종당화산물", demandKw: ["최종당화산물", "혈당 스파이크 피부", "당독소"] },
  { id: "fitness", label: "운동/피트니스", icon: "🏃", color: "#7C5BBF", brandHook: "피부 기초체력 = 근력 기초체력의 피부 버전", clusterKw: "운동 피부", pathKw: "운동 후 피부", demandKw: ["운동 후 스킨케어", "러닝 피부 관리", "피트니스 루틴"] },
  { id: "wellness", label: "수면/웰니스", icon: "🌙", color: "#9B6DBF", brandHook: "프리케어 = 나이트 루틴의 시작", clusterKw: "나이트 스킨케어", pathKw: "나이트 스킨케어 루틴", demandKw: ["나이트 스킨케어 루틴", "수면 피부 재생", "셀프케어"] },
  { id: "ferment", label: "커피/와인/발효", icon: "☕", color: "#4B8B3B", brandHook: "세리포리아 = 발효 과학, 로스팅 = 마이야르, 와인 에이징 = 피부 에이징", clusterKw: "커피 로스팅", pathKw: "커피 로스팅", demandKw: ["커피 로스팅 원리", "와인 발효 과정", "발효 식품 효능"] },
  { id: "docu", label: "다큐/과학교양", icon: "🎬", color: "#BF5B8A", brandHook: "10년 150억의 집착, 충북 음성 배양센터, 실패에서 발견으로", clusterKw: "과학 다큐멘터리", pathKw: "과학 다큐멘터리", demandKw: ["과학 다큐멘터리 추천", "넷플릭스 과학", "TED 과학"] },
  { id: "discovery", label: "발견/디스커버리", icon: "💡", color: "#C4963A", brandHook: "배양 실수 → 세리포리아 우연 발견", clusterKw: "우연한 발견", pathKw: "우연한 과학 발견", demandKw: ["우연한 과학 발견", "화장품 원료 개발", "바이오 연구"] },
];

/* ═══ Colors ═══ */
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
      if (d.error) { if (d.error.message && d.error.message.includes("rate") && a < retries - 1) { await wt(5000); continue; } return { ok: false, text: d.error.message }; }
      return { ok: true, text: (d.content || []).filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("\n") || "" };
    } catch (e) { clearTimeout(tid); if (a < retries - 1) { await wt(3000); continue; } return { ok: false, text: e.message }; }
  }
  return { ok: false, text: "재시도 초과" };
}
async function callMCP(s, u) { var res = await apiCall({ model: "claude-sonnet-4-20250514", max_tokens: 8000, system: s, messages: [{ role: "user", content: u }], mcp_servers: [{ type: "url", url: "https://listeningmind-service-mcp.ascentlab.io", name: "ListeningMind" }] }, 3, 60000); return res.ok ? res.text : "(MCP 오류)"; }
async function callAI(s, u, maxTk) { var res = await apiCall({ model: "claude-sonnet-4-20250514", max_tokens: maxTk || 4000, system: s, messages: [{ role: "user", content: u }] }, 3, maxTk > 4000 ? 70000 : 55000); return res.ok ? res.text : "(오류)"; }

/* ═══ Idea Parser ═══ */
function parseIdeas(text) {
  if (!text || text.length < 30) return [];
  return text.split(/(?=- \*\*제목\*\*)/).filter(function(c) { return c.indexOf("**제목**") >= 0; }).map(function(chunk) {
    var get = function(key) { var m = chunk.match(new RegExp("\\*\\*" + key + "\\*\\*[:\\s]*(.+)", "i")); return m ? m[1].trim() : ""; };
    var cm = chunk.match(/\*\*배경무드\*\*[:\s]*#?([A-Fa-f0-9]{6})/);
    return { title: get("제목"), hook: get("썸네일 후킹"), bgColor: cm ? cm[1] : "8B6914", message: get("핵심 메시지"), product: get("연결 상품"), why: get("왜 지금"), target: get("타겟") };
  }).filter(function(x) { return x.title; });
}

/* ═══ Phone Mockup ═══ */
function PhoneMockup({ hook, bgColor, product, format }) {
  var bg = "#" + (bgColor || "8B6914"), hex = bgColor || "8B6914";
  var luma = ((parseInt(hex.substring(0, 2), 16) || 0) * 299 + (parseInt(hex.substring(2, 4), 16) || 0) * 587 + (parseInt(hex.substring(4, 6), 16) || 0) * 114) / 1000;
  var tc = luma > 150 ? "#1a1a1a" : "#fff", dc = luma > 150 ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.4)";
  var fm = (format || "").match(/(릴스|숏폼|카드뉴스|틱톡|영상)/);
  return <div style={{ width: 66, flexShrink: 0 }}>
    <div style={{ width: 66, height: 116, borderRadius: 11, background: bg, position: "relative", overflow: "hidden", border: "2px solid " + C.border, boxShadow: "0 3px 10px rgba(0,0,0,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 5px 0" }}><span style={{ color: dc, fontSize: 5.5, fontWeight: 700 }}>9:41</span><div style={{ width: 18, height: 4, borderRadius: 2, background: dc }} /></div>
      {fm && <div style={{ position: "absolute", top: 12, right: 3, padding: "1px 4px", borderRadius: 3, background: tc === "#fff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)", fontSize: 5.5, fontWeight: 700, color: tc }}>{fm[1]}</div>}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "82%", textAlign: "center", fontSize: 8.5, fontWeight: 800, color: tc, lineHeight: 1.25, wordBreak: "keep-all" }}>{hook || ""}</div>
      {product && <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", padding: "1.5px 5px", borderRadius: 3, background: C.gold, color: "#fff", fontSize: 5, fontWeight: 700, whiteSpace: "nowrap" }}>{product.length > 14 ? product.substring(0, 14) + "…" : product}</div>}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "2px 5px 3px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 4.5, color: dc, fontWeight: 600, letterSpacing: "0.05em" }}>cepolab</span>
        <div style={{ width: 14, height: 1.5, borderRadius: 1, background: dc }} />
      </div>
    </div>
  </div>;
}

/* ═══ Process Flow ═══ */
function ProcessFlow({ phase }) {
  var st = [{ l: "CEP 발견", s: "Cluster Finder", ic: "🎯" }, { l: "경로 분석", s: "Path Finder", ic: "🗺️" }, { l: "수요 검증", s: "Keyword Info", ic: "📊" }, { l: "아이디어", s: "Claude AI", ic: "💡" }];
  var pI = { cep: 0, path: 1, demand: 2, idea: 3, done: 4 }, ci = pI[phase] !== undefined ? pI[phase] : -1;
  return <div style={{ display: "flex", padding: "8px 0 6px" }}>{st.map(function(x, i) {
    var dn = i < ci, ac = i === ci;
    return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", opacity: dn || ac ? 1 : 0.3 }}>
      <div style={{ width: 30, height: 30, borderRadius: 7, background: dn || ac ? C.gold + "15" : C.alt, border: "2px solid " + (dn || ac ? C.gold : C.border), display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3, animation: ac ? "pulse 1.5s ease infinite" : "none" }}><span style={{ fontSize: 12 }}>{x.ic}</span></div>
      <div style={{ fontSize: 9, fontWeight: 700, color: dn || ac ? C.text : C.muted }}>{x.l}</div>
      <div style={{ fontSize: 7.5, color: C.muted }}>{x.s}</div>
      {i < 3 && <div style={{ position: "absolute", top: 15, left: "calc(50% + 17px)", width: "calc(100% - 34px)", height: 2, borderRadius: 1, background: dn ? C.gold + "35" : C.border }} />}
    </div>;
  })}</div>;
}

/* ═══ Bottle ═══ */
function Bottle() {
  return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "floatB 5s ease-in-out infinite" }}>
    <div style={{ width: 11, height: 6, background: "linear-gradient(180deg,#e0d1a0,#b8a370)", borderRadius: "2px 2px 0 0" }} />
    <div style={{ width: 8, height: 9, borderLeft: "1px solid " + C.border, borderRight: "1px solid " + C.border }} />
    <div style={{ width: 40, height: 66, borderRadius: "3px 3px 5px 5px", background: "linear-gradient(135deg," + C.goldLight + "," + C.bg + ")", border: "1px solid " + C.border, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "76%", background: "linear-gradient(180deg," + C.gold + "06," + C.gold + "18)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <div style={{ fontSize: 6.5, fontWeight: 700, color: C.gold, letterSpacing: "0.1em" }}>cepoLAB</div>
        <div style={{ fontSize: 4.5, color: C.muted, lineHeight: 1.2, margin: "2px 0" }}>BIOGENIC<br/>ESSENCE</div>
        <div style={{ fontSize: 4, color: C.gold, letterSpacing: "0.08em", fontWeight: 700, padding: "1px 2px", border: "1px solid " + C.gold + "25", borderRadius: 1 }}>CLEPS®</div>
      </div>
    </div>
  </div>;
}

/* ═══ Result Card — DATA FIRST structure ═══ */
function ResultCard({ cat, data }) {
  var _o = useState(true), open = _o[0], setOpen = _o[1];
  var ideas = data.ideas ? parseIdeas(data.ideas) : [];
  return <div style={{ marginBottom: 10, borderRadius: 12, border: "2px solid " + C.border, background: C.card, overflow: "hidden", boxShadow: "0 2px 8px rgba(44,36,23,0.06)" }}>
    <div onClick={function() { setOpen(!open); }} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: open ? C.alt : C.card }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: cat.color + "12", border: "2px solid " + cat.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{cat.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: cat.color }}>{cat.label}</div>
        <div style={{ fontSize: 11, color: C.sub }}>{ideas.length > 0 ? ideas.length + "개 콘텐츠 아이디어" : "완료"}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {data.pathStatus && <span style={{ padding: "3px 8px", borderRadius: 5, background: data.pathStatus === "verified" ? C.green + "12" : C.gold + "12", color: data.pathStatus === "verified" ? C.green : C.goldDeep, fontSize: 10, fontWeight: 700 }}>{data.pathStatus === "verified" ? "🟢 경로 확인" : "🟡 블루오션"}</span>}
        <span style={{ color: cat.color, fontSize: 11, fontWeight: 800 }}>{open ? "▴" : "▾"}</span>
      </div>
    </div>
    {open && <div style={{ padding: "0 16px 16px", borderTop: "1px solid " + C.border }}>
      <ProcessFlow phase="done" />

      {/* ═══ SECTION 1: 데이터 증명 ═══ */}
      <div style={{ padding: 14, borderRadius: 10, background: C.alt, border: "1.5px solid " + C.border, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 14 }}>📊</span> 데이터 증명 <span style={{ fontSize: 9, color: C.muted, fontWeight: 400 }}>by ListeningMind</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {/* CEP */}
          <div style={{ padding: 10, borderRadius: 8, background: C.card, border: "1px solid " + C.border }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, marginBottom: 4 }}>🎯 CEP <span style={{ fontWeight: 400, color: C.muted }}>Cluster Finder</span></div>
            <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{data.cepInsight || "분석 중..."}</div>
          </div>
          {/* Path */}
          <div style={{ padding: 10, borderRadius: 8, background: C.card, border: "1px solid " + C.border }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, marginBottom: 4 }}>🗺️ 검색 경로 <span style={{ fontWeight: 400, color: C.muted }}>Path Finder</span></div>
            <div style={{ marginBottom: 4 }}>{data.pathStatus === "verified"
              ? <span style={{ padding: "2px 7px", borderRadius: 4, background: C.green + "12", color: C.green, fontSize: 10, fontWeight: 700 }}>🟢 실제 경로 확인됨</span>
              : <span style={{ padding: "2px 7px", borderRadius: 4, background: C.gold + "12", color: C.goldDeep, fontSize: 10, fontWeight: 700 }}>🟡 경로 부재 → 블루오션</span>}</div>
            <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{data.pathInsight || ""}</div>
          </div>
          {/* Demand */}
          <div style={{ padding: 10, borderRadius: 8, background: C.card, border: "1px solid " + C.border, gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, marginBottom: 4 }}>📊 수요 검증 <span style={{ fontWeight: 400, color: C.muted }}>Keyword Info</span></div>
            <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{data.demandInsight || ""}</div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 2: 브랜드 연결 ═══ */}
      {data.brandConnect && <div style={{ padding: 12, borderRadius: 10, background: C.gold + "06", border: "1.5px solid " + C.gold + "18", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.goldDeep, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 14 }}>🔗</span> 브랜드 자산 × 데이터 연결
        </div>
        <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.brandConnect}</div>
      </div>}

      {/* ═══ SECTION 3: 콘텐츠 아이디어 (Phone Mockup) ═══ */}
      {ideas.length > 0 && <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 14 }}>💡</span> 콘텐츠 아이디어 <span style={{ fontSize: 10, color: C.muted, fontWeight: 400 }}>{ideas.length}개</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ideas.map(function(idea, idx) { return <div key={idx} style={{ padding: 12, borderRadius: 10, background: "#" + idea.bgColor + "06", border: "1.5px solid #" + idea.bgColor + "18", display: "flex", gap: 10 }}>
            <PhoneMockup hook={idea.hook} bgColor={idea.bgColor} product={idea.product} format={idea.title} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#" + idea.bgColor, marginBottom: 2 }}>IDEA {idx + 1}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.4, marginBottom: 5 }}>{idea.title}</div>
              {idea.hook && <div style={{ fontSize: 11, marginBottom: 5 }}><span style={{ padding: "2px 5px", borderRadius: 3, background: C.gold, color: "#fff", fontSize: 8, fontWeight: 700, marginRight: 5 }}>HOOK</span><span style={{ color: C.sub }}>{idea.hook}</span></div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {idea.message && <div style={{ fontSize: 11, color: C.sub }}><strong style={{ color: C.goldDeep }}>메시지</strong> {idea.message}</div>}
                {idea.product && <div style={{ fontSize: 11 }}><strong style={{ color: C.goldDeep }}>연결</strong> <span style={{ padding: "1px 5px", borderRadius: 3, background: C.goldLight, color: C.goldDeep, fontWeight: 600 }}>{idea.product}</span></div>}
                {idea.why && <div style={{ fontSize: 11, color: C.sub }}><strong style={{ color: C.goldDeep }}>왜 지금</strong> {idea.why}</div>}
                {idea.target && <div style={{ fontSize: 11, color: C.sub }}><strong style={{ color: C.goldDeep }}>타겟</strong> {idea.target}</div>}
              </div>
            </div>
          </div>; })}
        </div>
      </div>}
    </div>}
  </div>;
}

/* ═══ YT Content Analyzer ═══ */
function YTAnalyzer({ ytVideos, setYtVideos }) {
  var _u = useState(""), url = _u[0], setUrl = _u[1];
  var _l = useState(false), loading = _l[0], setLoading = _l[1];
  var addVideo = useCallback(async function() {
    if (!url.trim()) return; var u = url.trim(); setUrl(""); setLoading(true);
    var vid = u.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    var videoId = vid ? vid[1] : u;
    setYtVideos(function(p) { return [{ id: videoId, thumb: "https://img.youtube.com/vi/" + videoId + "/mqdefault.jpg", loading: true }].concat(p.filter(function(v) { return v.id !== videoId; })); });
    try {
      var res = await apiCall({ model: "claude-sonnet-4-20250514", max_tokens: 4000, system: "유튜브 숏폼 콘텐츠 분석 전문가. 웹 검색으로 영상 정보를 찾고 콘텐츠 전략 관점에서 분석하라. JSON만 응답.", messages: [{ role: "user", content: "영상 ID: " + videoId + "\nURL: https://www.youtube.com/watch?v=" + videoId + "\n\nJSON:\n{\"title\":\"제목\",\"channel\":\"채널\",\"views\":\"조회수\",\"likes\":\"좋아요\",\"comments\":\"댓글수\",\"engagement\":\"참여율\",\"contentSummary\":\"영상 내용·카피 2줄 분석\",\"hookAnalysis\":\"후킹 포인트 분석\",\"audienceReaction\":\"댓글 반응 핵심 인사이트\",\"nextContentInsight\":\"이 데이터 기반 다음 콘텐츠 방향 제안 2줄\"}" }], tools: [{ type: "web_search_20250305", name: "web_search" }] }, 3, 90000);
      var parsed = null;
      try { var jm = (res.text || "").match(/\{[\s\S]*\}/); if (jm) parsed = JSON.parse(jm[0]); } catch (e) {}
      setYtVideos(function(p) { return p.map(function(v) { if (v.id !== videoId) return v; return parsed ? Object.assign({}, v, parsed, { loading: false }) : Object.assign({}, v, { loading: false, title: "분석 실패" }); }); });
    } catch (e) { setYtVideos(function(p) { return p.map(function(v) { return v.id === videoId ? Object.assign({}, v, { loading: false, title: "오류" }) : v; }); }); }
    setLoading(false);
  }, [url, setYtVideos]);

  return <div>
    <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
      <input value={url} onChange={function(e) { setUrl(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") addVideo(); }} placeholder="유튜브 URL 입력 → 콘텐츠 분석 + 다음 콘텐츠 인사이트" style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1.5px solid " + C.border, background: C.card, color: C.text, fontSize: 12, outline: "none" }} />
      <button onClick={addVideo} disabled={loading || !url.trim()} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: C.red, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.4 : 1 }}>🔍 분석</button>
    </div>
    {ytVideos.length === 0 && <div style={{ textAlign: "center", padding: "28px 0", color: C.muted, fontSize: 12, lineHeight: 1.6 }}>세포랩 숏폼 URL을 입력하면<br/>영상 내용·카피 분석 → 댓글 반응 인사이트 → 다음 콘텐츠 방향을 제안합니다</div>}
    {ytVideos.map(function(v) { return <div key={v.id} style={{ padding: 14, borderRadius: 10, background: C.card, border: "1.5px solid " + C.border, marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ width: 76, height: 42, borderRadius: 6, background: "#eee center/cover no-repeat", backgroundImage: v.thumb ? "url(" + v.thumb + ")" : "none", flexShrink: 0 }} />
        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700 }}>{v.title || "분석 중..."}</div><div style={{ fontSize: 10, color: C.muted }}>{v.channel || ""}</div></div>
        <button onClick={function() { setYtVideos(function(p) { return p.filter(function(x) { return x.id !== v.id; }); }); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer" }}>✕</button>
      </div>
      {v.loading ? <div style={{ padding: 10, textAlign: "center", fontSize: 11, color: C.gold }}>🔄 분석 중...</div> : <div>
        <div style={{ display: "flex", margin: "10px 0", padding: "8px 0", borderTop: "1px solid " + C.border, borderBottom: "1px solid " + C.border }}>
          {[["조회수", v.views], ["좋아요", v.likes], ["댓글", v.comments], ["참여율", v.engagement]].map(function(s, i) { return <div key={i} style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 15, fontWeight: 800, color: C.gold }}>{s[1] || "-"}</div><div style={{ fontSize: 8, color: C.muted }}>{s[0]}</div></div>; })}
        </div>
        {[["📝 콘텐츠·카피 분석", v.contentSummary, C.alt], ["🎯 후킹 분석", v.hookAnalysis, C.alt], ["💬 댓글 반응 인사이트", v.audienceReaction, C.alt], ["💡 다음 콘텐츠 방향", v.nextContentInsight, C.gold + "08"]].map(function(s, i) {
          return s[1] ? <div key={i} style={{ padding: 10, borderRadius: 8, background: s[2], border: "1px solid " + C.border, marginBottom: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: i === 3 ? C.gold : C.goldDeep, marginBottom: 3 }}>{s[0]}</div>
            <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{s[1]}</div>
          </div> : null;
        })}
      </div>}
    </div>; })}
  </div>;
}

/* ═══ Main ═══ */
export default function App() {
  var _sel = useState({}), sel = _sel[0], setSel = _sel[1];
  var _data = useState({}), catData = _data[0], setCatData = _data[1];
  var _ph = useState({}), phases = _ph[0], setPhases = _ph[1];
  var _st = useState("main"), status = _st[0], setStatus = _st[1];
  var _msg = useState(""), gMsg = _msg[0], setGMsg = _msg[1];
  var _toast = useState(null), toast = _toast[0], setToast = _toast[1];
  var _tab = useState("scan"), mainTab = _tab[0], setMainTab = _tab[1];
  var _yt = useState([]), ytVideos = _yt[0], setYtVideos = _yt[1];
  var _snap = useState(null), snapDate = _snap[0], setSnapDate = _snap[1];
  var _cep = useState(false), showCep = _cep[0], setShowCep = _cep[1];
  var _ca = useState([]), customAssets = _ca[0], setCustomAssets = _ca[1];
  var _aa = useState(false), showAddAsset = _aa[0], setShowAddAsset = _aa[1];
  var _nt = useState(""), nt = _nt[0], setNt = _nt[1];
  var _nd = useState(""), nd = _nd[0], setNd = _nd[1];

  function tog(id) { setSel(function(p) { var n = Object.assign({}, p); n[id] = !n[id]; return n; }); }
  function selAll() { var n = {}; CATS.forEach(function(c) { n[c.id] = true; }); setSel(n); }
  function selNone() { setSel({}); }
  var selCount = Object.values(sel).filter(Boolean).length;
  function showT(msg) { setToast(msg); setTimeout(function() { setToast(null); }, 2500); }

  async function saveSnap() { try { await window.storage.set("aap-v3", JSON.stringify({ d: new Date().toISOString(), cats: Object.keys(catData), data: catData, yt: ytVideos, ca: customAssets })); showT("📸 저장 완료"); } catch (e) { showT("⚠️ " + e.message); } }
  async function loadSnap() { try { var r = await window.storage.get("aap-v3"); if (!r) { showT("⚠️ 저장된 데이터 없음"); return; } var s = JSON.parse(r.value); setCatData(s.data || {}); var ns = {}, np = {}; (s.cats || []).forEach(function(id) { ns[id] = true; np[id] = "done"; }); setSel(ns); setPhases(np); if (s.yt) setYtVideos(s.yt); if (s.ca) setCustomAssets(s.ca); setSnapDate(s.d ? new Date(s.d).toLocaleDateString("ko-KR") : null); setStatus("done"); setMainTab("scan"); showT("📂 불러오기 완료"); } catch (e) { showT("⚠️ " + e.message); } }

  /* ═══ Scan — 4 MCP tools, NO web search trends ═══ */
  var scanOne = useCallback(async function(cat) {
    try {
      /* STEP 1: CEP Discovery — Cluster Finder */
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "cep"; return n; });
      var cepData = await callMCP(
        'cluster_finder를 사용하라. gl="kr", keyword="' + cat.clusterKw + '", data_type="communities", hop=2. 결과에서 세포랩 브랜드와 연결 가능한 CEP(소비자가 이 키워드를 검색할 때의 맥락/상황/동기)를 한국어로 3줄 이내 요약.',
        '"' + cat.clusterKw + '" 키워드 클러스터에서 세포랩과 연결 가능한 소비자 맥락(CEP)을 찾아라.'
      );
      await wt(800);

      /* STEP 2: Path Analysis — Path Finder */
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "path"; return n; });
      var pathData = await callMCP(
        'path_finder를 사용하라. gl="kr", keyword="' + cat.pathKw + '", limit=100. 결과에서 "세포랩" 또는 "세리포리아" 또는 "당화" 또는 "AGEs"와 관련된 경로가 있는지 확인. 있으면 "VERIFIED: [경로 설명]", 없으면 "BLUOCEAN: [이유]"로 응답.',
        '"' + cat.pathKw + '"에서 세포랩까지의 검색 경로를 분석하라.'
      );
      var pathStatus = pathData.indexOf("VERIFIED") >= 0 ? "verified" : "bluocean";
      var pathInsight = pathData.replace(/^(VERIFIED|BLUOCEAN)[:\s]*/i, "").substring(0, 200);
      await wt(800);

      /* STEP 3: Demand Validation — Keyword Info */
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "demand"; return n; });
      var kl = cat.demandKw.map(function(k) { return '"' + k + '"'; }).join(", ");
      var demandData = await callMCP(
        'keyword_info를 사용하라. gl="kr", keywords=[' + kl + '], data_type="all". 결과를 한국어로 요약: 1) 월 검색량 2) 타겟 일치도(세포랩 타겟=40~50대 여성) 3) 영상 SERP 노출 여부 4) 트렌드(증감). 3줄 이내.',
        '키워드 수요 검증.'
      );
      await wt(800);

      /* STEP 4: Content Ideas — Claude AI (data-driven, NO trends) */
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "idea"; return n; });
      var ideaInput = '[데이터 증명]\n\n[CEP — Cluster Finder]\n' + cepData.substring(0, 400) + '\n\n[검색 경로 — Path Finder]\n상태: ' + (pathStatus === "verified" ? "확인됨" : "블루오션") + '\n' + pathInsight + '\n\n[수요 — Keyword Info]\n' + demandData.substring(0, 400) + '\n\n[브랜드 자산 연결]\n' + cat.brandHook;
      var brandConnect = await callAI(
        '세포랩 크로스 카테고리 전략가. 데이터가 이 카테고리에 기회가 있음을 증명했다. 이제 세포랩의 브랜드 자산과 이 관심사를 연결하는 의외의 접점을 찾아라. 뷰티 카테고리에서는 절대 나올 수 없는, 이 관심사이기 때문에 가능한 연결이어야 한다.\n\n' + BRAND_DNA_PROMPT,
        ideaInput + '\n\n위 데이터가 증명한 이 관심사 카테고리에서, 세포랩 브랜드 자산과의 의외의 연결점 3개를 찾아라. 뷰티 업계 사람이라면 절대 생각하지 못할 연결이어야 한다. 각각 2줄. 구체적 제품명 포함.', 2000
      );
      var ideaResult = await callAI(
        '세포랩 숏폼 콘텐츠 크리에이티브 디렉터. 데이터가 증명한 카테고리 기회와 세포랩의 브랜드 자산을 교차시켜, 소비자가 예상하지 못한 신선한 연결을 만들어라.\n\n핵심 원칙:\n1. 뷰티 카테고리에서는 절대 나올 수 없는, 이 관심사이기 때문에 가능한 아이디어\n2. 소비자가 스크롤을 멈추고 "이게 뭐지?"라고 느낄 의외성\n3. 세포랩을 직접 소개하지 말고, 관심사 이야기 속에 자연스럽게 녹여라\n4. "세상을 바꾼 실수들 — 페니실린, 포스트잇, 세포랩" 같은 수준의 크리에이티브 점프를 해라\n5. 데이터가 방향을 잡아줬으니, 그 방향 안에서 자유롭게 뛰어라\n\n' + BRAND_DNA_PROMPT,
        ideaInput + '\n\n[브랜드 연결]\n' + brandConnect.substring(0, 500) + '\n\n---\n\n위 데이터가 증명한 기회 카테고리에서, 소비자가 "이게 화장품 광고였어?"라고 놀랄 만한 숏폼 콘텐츠 아이디어 3개를 만들어라.\n\n각 아이디어는 반드시 7개 필드를 포함:\n- **제목**: 실제 SNS에 올릴 구체적 제목 (릴스/숏폼 명시). 이 관심사 카테고리의 소비자가 클릭할 제목이어야 함.\n- **썸네일 후킹**: 첫 화면 후킹 15자 이내. "이게 뭐지?" 느낌의 궁금증/충격/공감.\n- **배경무드**: 6자리 HEX 컬러코드 1개. 콘텐츠 분위기에 맞는 배경색.\n- **핵심 메시지**: 한 줄\n- **연결 상품**: 세포랩 구체적 제품명 (바이오제닉 에센스 90% 등)\n- **왜 지금**: 이 콘텐츠를 지금 해야 하는 이유\n- **타겟**: 이 콘텐츠에 반응할 구체적 페르소나\n\n3개 모두 서로 다른 각도에서 접근하라. 하나는 과학적 의외성, 하나는 감성적 공감, 하나는 유머/반전.', 6000
      );
      var ic = (ideaResult.match(/\*\*제목\*\*/g) || []).length || 0;
      setCatData(function(pv) { var n = Object.assign({}, pv); n[cat.id] = { cepInsight: cepData.substring(0, 300), pathStatus: pathStatus, pathInsight: pathInsight, demandInsight: demandData.substring(0, 300), brandConnect: brandConnect, ideas: ideaResult, ideaCount: ic }; return n; });
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "done"; return n; });
    } catch (err) {
      setCatData(function(pv) { var n = Object.assign({}, pv); n[cat.id] = { cepInsight: "⚠️ " + (err.message || "오류"), pathStatus: "bluocean", pathInsight: "오류", demandInsight: "오류", brandConnect: "", ideas: "", ideaCount: 0 }; return n; });
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "done"; return n; });
    }
  }, []);

  var startScan = useCallback(async function() {
    setStatus("scanning"); setCatData({}); setPhases({}); setSnapDate(null); setMainTab("scan");
    var cs = CATS.filter(function(c) { return sel[c.id]; });
    for (var i = 0; i < cs.length; i++) {
      setGMsg(cs[i].icon + " " + cs[i].label + " (" + (i + 1) + "/" + cs.length + ")");
      await scanOne(cs[i]);
      if (i < cs.length - 1) await wt(2000);
    }
    setStatus("done"); setGMsg("");
  }, [sel, scanOne]);

  var doneCount = Object.keys(catData).length;

  return <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Pretendard Variable', -apple-system, sans-serif" }}>
    <style>{`@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}@keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px" }}>
      {/* Header */}
      <div style={{ padding: "14px 0", borderBottom: "2px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: "5px 12px", borderRadius: 6, background: C.gold, color: "#fff", fontSize: 10, fontWeight: 900, letterSpacing: "0.08em" }}>AI ALGORITHM PERFORMANCE</div>
          <span style={{ fontSize: 17, fontWeight: 900 }}>세포랩</span><span style={{ fontSize: 11, color: C.muted }}>CEPOLAB</span>
        </div>
        <span style={{ fontSize: 9, color: C.muted }}>Powered by <strong style={{ color: C.accent }}>ListeningMind</strong> × <strong style={{ color: "#8b5cf6" }}>Claude AI</strong></span>
      </div>

      {/* MAIN */}
      {status === "main" && <div style={{ animation: "fadeIn 0.4s ease" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 22, padding: "22px 0", borderBottom: "1px solid " + C.border }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ padding: "3px 8px", borderRadius: 4, background: C.goldLight, color: C.goldDeep, fontSize: 9, fontWeight: 700, display: "inline-block", marginBottom: 12, width: "fit-content" }}>CROSS-CATEGORY CONTENT STRATEGY</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.4, marginBottom: 10 }}>뷰티에 갇히지 마세요.<br/><span style={{ color: C.gold }}>10개 관심사</span>에서<br/>세포랩을 발견하게 만듭니다.</h1>
            <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.7, marginBottom: 16 }}>브랜드 자산 × 소비자 관심사를 연결하고,<br/>리스닝마인드 데이터로 기회를 증명합니다.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, background: C.gold + "06", border: "1px solid " + C.gold + "15" }}>
              <Bottle />
              <div style={{ display: "flex", gap: 14 }}>
                <div><div style={{ fontSize: 20, fontWeight: 800, color: C.gold }}>128,840</div><div style={{ fontSize: 9, color: C.muted }}>월 검색량</div></div>
                <div><div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>+98%</div><div style={{ fontSize: 9, color: C.muted }}>성장률</div></div>
                <div><div style={{ fontSize: 20, fontWeight: 800, color: C.gold }}>87%</div><div style={{ fontSize: 9, color: C.muted }}>여성</div></div>
              </div>
            </div>
          </div>
          {/* Brand DNA */}
          <div style={{ padding: 14, borderRadius: 12, border: "1.5px solid " + C.border, background: C.card }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 14 }}>🧬</span><span style={{ fontSize: 13, fontWeight: 800 }}>브랜드 자산</span><span style={{ padding: "2px 6px", borderRadius: 4, background: C.gold, color: "#fff", fontSize: 8, fontWeight: 700 }}>Brand DNA</span></div>
              <button onClick={function() { setShowAddAsset(!showAddAsset); }} style={{ padding: "3px 8px", borderRadius: 5, border: "1px solid " + C.gold + "30", background: "transparent", color: C.goldDeep, fontSize: 9, fontWeight: 700, cursor: "pointer" }}>{showAddAsset ? "✕" : "＋ 추가"}</button>
            </div>
            {showAddAsset && <div style={{ padding: 8, borderRadius: 8, background: C.goldLight, marginBottom: 6, display: "flex", gap: 5 }}>
              <input value={nt} onChange={function(e) { setNt(e.target.value); }} placeholder="자산명" style={{ flex: 1, padding: "5px 8px", borderRadius: 5, border: "1px solid " + C.border, fontSize: 10, background: C.card }} />
              <input value={nd} onChange={function(e) { setNd(e.target.value); }} placeholder="설명" style={{ flex: 2, padding: "5px 8px", borderRadius: 5, border: "1px solid " + C.border, fontSize: 10, background: C.card }} />
              <button onClick={function() { if (nt.trim()) { setCustomAssets(function(p) { return p.concat([{ icon: "📌", title: nt, desc: nd }]); }); setNt(""); setNd(""); } }} style={{ padding: "5px 10px", borderRadius: 5, border: "none", background: C.gold, color: "#fff", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>추가</button>
            </div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 5 }}>
              <div style={{ padding: 7, borderRadius: 7, background: "#f8f6ff", border: "1px solid #e8e6f0" }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: C.accent, marginBottom: 3 }}>🔬 과학 기반</div>
                {BRAND_SCIENCE.map(function(a, i) { return <div key={i} style={{ fontSize: 9, color: C.sub, marginBottom: 1 }}>{a.icon} <strong style={{ color: C.text }}>{a.title}</strong></div>; })}
              </div>
              <div style={{ padding: 7, borderRadius: 7, background: "#fffef5", border: "1px solid #f0ebd6" }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: C.gold, marginBottom: 3 }}>🧴 제품</div>
                {BRAND_PRODUCTS.map(function(a, i) { return <div key={i} style={{ fontSize: 9, color: C.sub, marginBottom: 1 }}>{a.icon} <strong style={{ color: C.text }}>{a.title}</strong></div>; })}
              </div>
            </div>
            <div style={{ padding: 7, borderRadius: 7, background: "#fff5f5", border: "1px solid #f0e0e0" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: C.red, marginBottom: 3 }}>📢 커머셜/AD 자산</div>
              {BRAND_COMMERCIAL.map(function(a, i) { return <div key={i} style={{ fontSize: 9, color: C.sub, marginBottom: 1 }}>{a.icon} <strong style={{ color: C.text }}>{a.title}</strong> — {a.desc}</div>; })}
            </div>
            {customAssets.length > 0 && <div style={{ padding: 7, borderRadius: 7, background: C.alt, border: "1px solid " + C.border, marginTop: 5 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: C.goldDeep, marginBottom: 3 }}>📌 추가 자산</div>
              {customAssets.map(function(a, i) { return <div key={i} style={{ fontSize: 9, color: C.sub, display: "flex", gap: 3, alignItems: "center" }}><strong style={{ color: C.text }}>{a.title}</strong> — {a.desc} <button onClick={function() { setCustomAssets(function(p) { return p.filter(function(_, j) { return j !== i; }); }); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 7, cursor: "pointer" }}>✕</button></div>; })}
            </div>}
          </div>
        </div>
        {/* Tabs + Content */}
        <div style={{ display: "flex", gap: 4, paddingTop: 12 }}>
          <button onClick={function() { setMainTab("scan"); }} style={{ padding: "8px 14px", borderRadius: "8px 8px 0 0", border: "1.5px solid " + (mainTab === "scan" ? C.gold + "35" : C.border), borderBottom: "none", background: mainTab === "scan" ? C.card : "transparent", color: mainTab === "scan" ? C.gold : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🔍 트렌드 스캔</button>
          <button onClick={function() { setMainTab("yt"); }} style={{ padding: "8px 14px", borderRadius: "8px 8px 0 0", border: "1.5px solid " + (mainTab === "yt" ? C.red + "35" : C.border), borderBottom: "none", background: mainTab === "yt" ? C.card : "transparent", color: mainTab === "yt" ? C.red : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📺 콘텐츠 분석</button>
        </div>
        {mainTab === "scan" && <div style={{ padding: 14, background: C.card, borderRadius: "0 10px 10px 10px", border: "1.5px solid " + C.border, borderTop: "none" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 13, fontWeight: 800 }}>관심사 카테고리</span>{selCount > 0 && <span style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>{selCount}개</span>}</div>
            <div style={{ display: "flex", gap: 5 }}>
              <button onClick={function() { setShowCep(!showCep); }} style={{ padding: "3px 8px", borderRadius: 5, border: "1px solid " + C.gold + "25", background: showCep ? C.goldLight : "transparent", color: C.goldDeep, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{showCep ? "✕" : "🔍 근거"}</button>
              <button onClick={selAll} style={{ background: "none", border: "none", color: C.gold, fontSize: 10, cursor: "pointer", textDecoration: "underline" }}>전체</button>
              <button onClick={selNone} style={{ background: "none", border: "none", color: C.gold, fontSize: 10, cursor: "pointer", textDecoration: "underline" }}>해제</button>
            </div>
          </div>
          {showCep && <div style={{ padding: 12, borderRadius: 8, background: C.goldLight, border: "1px solid " + C.gold + "20", marginBottom: 10, animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.goldDeep, marginBottom: 6 }}>🤖 카테고리 발견 근거</div>
            <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6, marginBottom: 8 }}>고정된 카테고리가 아닙니다. <strong>Cluster Finder</strong>가 CEP를 발견하고, <strong>Path Finder</strong>가 경로를 확인하고, <strong>Keyword Info</strong>가 수요를 검증합니다. 데이터가 바뀌면 카테고리도 바뀝니다.</div>
          </div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 8 }}>
            {CATS.map(function(c) { var on = !!sel[c.id]; return <div key={c.id} onClick={function() { tog(c.id); }} style={{ padding: 10, borderRadius: 8, border: "2px solid " + (on ? c.color : C.border), background: on ? c.color + "06" : C.card, cursor: "pointer", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginBottom: 2 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, border: "2px solid " + (on ? c.color : C.muted), background: on ? c.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "#fff", fontWeight: 900 }}>{on ? "✓" : ""}</div>
                <span style={{ fontSize: 15 }}>{c.icon}</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: on ? 800 : 500, color: on ? C.text : C.sub }}>{c.label}</div>
            </div>; })}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={startScan} disabled={selCount === 0} style={{ flex: 1, padding: 13, borderRadius: 8, border: "none", background: selCount > 0 ? C.gold : C.border, color: selCount > 0 ? "#fff" : C.muted, fontSize: 13, fontWeight: 900, cursor: selCount > 0 ? "pointer" : "default" }}>{selCount > 0 ? selCount + "개 관심사 × 세포랩 기회 분석 →" : "관심사를 선택해주세요"}</button>
            <button onClick={loadSnap} style={{ padding: "13px 16px", borderRadius: 8, border: "1.5px solid " + C.gold + "25", background: "transparent", color: C.goldDeep, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>📂 불러오기</button>
          </div>
        </div>}
        {mainTab === "yt" && <div style={{ padding: 14, background: C.card, borderRadius: "0 10px 10px 10px", border: "1.5px solid " + C.border, borderTop: "none" }}><YTAnalyzer ytVideos={ytVideos} setYtVideos={setYtVideos} /></div>}
      </div>}

      {/* SCANNING / DONE */}
      {(status === "scanning" || status === "done") && <div style={{ padding: "12px 0" }}>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={function() { setMainTab("scan"); }} style={{ padding: "8px 14px", borderRadius: "8px 8px 0 0", border: "1.5px solid " + (mainTab === "scan" ? C.gold + "35" : C.border), borderBottom: "none", background: mainTab === "scan" ? C.card : "transparent", color: mainTab === "scan" ? C.gold : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🔍 결과 {doneCount > 0 && <span style={{ padding: "1px 4px", borderRadius: 3, background: C.gold + "12", color: C.gold, fontSize: 8, fontWeight: 700, marginLeft: 3 }}>{doneCount}</span>}</button>
          <button onClick={function() { setMainTab("yt"); }} style={{ padding: "8px 14px", borderRadius: "8px 8px 0 0", border: "1.5px solid " + (mainTab === "yt" ? C.red + "35" : C.border), borderBottom: "none", background: mainTab === "yt" ? C.card : "transparent", color: mainTab === "yt" ? C.red : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📺 콘텐츠 분석</button>
        </div>
        {mainTab === "scan" && <div style={{ padding: 14, background: C.card, borderRadius: "0 10px 10px 10px", border: "1.5px solid " + C.border, borderTop: "none" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid " + C.border, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800 }}>분석 결과</span>
              <span style={{ fontSize: 11, color: C.muted }}>{doneCount} / {CATS.filter(function(c) { return sel[c.id]; }).length}</span>
              {status === "scanning" && gMsg && <span style={{ fontSize: 11, color: C.gold, fontWeight: 700, animation: "pulse 1.5s ease infinite" }}>{gMsg}</span>}
              {snapDate && <span style={{ padding: "2px 7px", borderRadius: 4, background: C.goldLight, color: C.goldDeep, fontSize: 9, fontWeight: 600 }}>📸 {snapDate}</span>}
            </div>
            {status === "done" && <div style={{ display: "flex", gap: 5 }}>
              <button onClick={saveSnap} style={{ padding: "5px 10px", borderRadius: 5, border: "1px solid " + C.gold + "25", background: "transparent", color: C.goldDeep, fontSize: 10, cursor: "pointer" }}>💾 저장</button>
              <button onClick={function() { setStatus("main"); setCatData({}); setPhases({}); }} style={{ padding: "5px 10px", borderRadius: 5, border: "1px solid " + C.border, background: "transparent", color: C.sub, fontSize: 10, cursor: "pointer" }}>↺ 다시</button>
            </div>}
          </div>
          {CATS.filter(function(c) { return sel[c.id]; }).map(function(c) {
            var d = catData[c.id], p = phases[c.id];
            if (d) return <ResultCard key={c.id} cat={c} data={d} />;
            if (p && p !== "done") return <div key={c.id} style={{ padding: 12, borderRadius: 10, border: "1.5px solid " + C.border, background: C.card, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: c.color + "10", border: "2px solid " + c.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{c.icon}</div>
                <div><div style={{ fontSize: 13, fontWeight: 700 }}>{c.label}</div><div style={{ display: "inline-block", padding: "2px 7px", borderRadius: 4, background: C.gold, color: "#fff", fontSize: 9, fontWeight: 700, animation: "pulse 1.5s ease infinite", marginTop: 2 }}>{p === "cep" ? "🎯 CEP 발견 중..." : p === "path" ? "🗺️ 경로 분석 중..." : p === "demand" ? "📊 수요 검증 중..." : "💡 아이디어 생성 중..."}</div></div>
              </div>
              <ProcessFlow phase={p} />
            </div>;
            return <div key={c.id} style={{ padding: 10, borderRadius: 8, border: "1px solid " + C.border, background: C.card, marginBottom: 5, opacity: 0.3, display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 14 }}>{c.icon}</span><span style={{ fontSize: 11, color: C.muted }}>{c.label}</span><span style={{ fontSize: 9, color: C.border, marginLeft: "auto" }}>대기</span></div>;
          })}
        </div>}
        {mainTab === "yt" && <div style={{ padding: 14, background: C.card, borderRadius: "0 10px 10px 10px", border: "1.5px solid " + C.border, borderTop: "none" }}><YTAnalyzer ytVideos={ytVideos} setYtVideos={setYtVideos} /></div>}
      </div>}
      <div style={{ padding: "8px 0 14px", fontSize: 9, color: C.border, display: "flex", justifyContent: "space-between" }}><span>ListeningMind Cluster·Path·Intent Finder × Claude AI</span><span>pentacle for cepolab</span></div>
    </div>
    {toast && <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", padding: "10px 18px", borderRadius: 8, background: C.green + "E8", color: "#fff", fontSize: 12, fontWeight: 600, zIndex: 999, animation: "fadeIn 0.3s ease" }}>{toast}</div>}
  </div>;
}
