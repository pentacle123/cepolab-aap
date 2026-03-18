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

var CATS = [
  { id: "slowaging", label: "저속노화", icon: "🧬", color: "#2D8B5F" },
  { id: "food", label: "푸드/식문화", icon: "🍳", color: "#D97706" },
  { id: "fitness", label: "운동/피트니스", icon: "🏃", color: "#7C5BBF" },
  { id: "docu", label: "다큐/과학교양", icon: "🎬", color: "#BF5B8A" },
  { id: "health", label: "건강/다이어트", icon: "🥗", color: "#C4503A" },
  { id: "family", label: "육아/가족", icon: "👨‍👩‍👧", color: "#E8854A" },
  { id: "minimal", label: "미니멀라이프", icon: "🏠", color: "#4B8B3B" },
  { id: "business", label: "비즈니스/창업", icon: "💼", color: "#5B6ABF" },
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
async function callAI(s, u, maxTk) { var tk = maxTk || 4000; var timeout = tk >= 6000 ? 120000 : 55000; var res = await apiCall({ model: "claude-sonnet-4-20250514", max_tokens: tk, system: s, messages: [{ role: "user", content: u }] }, 3, timeout); return res.ok ? res.text : "(오류)"; }

/* ═══ Idea Parser — flexible ═══ */
function parseIdeas(text) {
  if (!text || text.length < 30) return [];
  /* Split on **제목** preceded by any combo of newlines, numbers, dashes, bullets, hashes */
  var chunks = text.split(/(?=(?:^|\n)\s*(?:#{1,4}\s*)?(?:\d+[\.\)]\s*)?(?:[-*]\s*)?\*\*\s*(?:\d+[\.\)]\s*)?제목\s*\*\*)/).filter(function(c) { return /\*\*\s*(?:\d+[\.\)]\s*)?제목\s*\*\*/.test(c); });
  return chunks.map(function(chunk) {
    /* Flexible field getter: handles **key**: value, **key** value, **N. key**: value */
    var get = function(key) {
      var patterns = [
        new RegExp("\\*\\*\\s*(?:\\d+[\\.)\\s]*)?\\s*" + key + "\\s*\\*\\*[:\\s]*(.+)", "i"),
        new RegExp("[-*]\\s*\\*\\*" + key + "\\*\\*[:\\s]*(.+)", "i"),
        new RegExp(key + "\\s*[:\\uff1a]\\s*(.+)", "i")
      ];
      for (var i = 0; i < patterns.length; i++) {
        var m = chunk.match(patterns[i]);
        if (m) return m[1].replace(/\*+$/g, "").trim();
      }
      return "";
    };
    var cm = chunk.match(/(?:배경무드|배경)[^#]*#?([A-Fa-f0-9]{6})/);
    return {
      title: get("제목"), hook: get("썸네일 후킹") || get("후킹"),
      twist: get("반전 연결") || get("반전"),
      bgColor: cm ? cm[1] : "8B6914",
      message: get("핵심 메시지") || get("메시지"),
      product: get("연결 상품") || get("상품"),
      asset: get("활용 자산") || get("자산"),
      basis: get("근거") || get("데이터 근거"),
      target: get("타겟"),
      demand: get("수요 근거") || get("수요")
    };
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

/* ═══ Idea Card ═══ */
function IdeaCard({ idea }) {
  var basisIcon = (idea.basis || "").indexOf("Cluster") >= 0 || (idea.basis || "").indexOf("클러스터") >= 0 ? "🎯" : (idea.basis || "").indexOf("Path") >= 0 || (idea.basis || "").indexOf("경로") >= 0 ? "🗺️" : "💡";
  var basisColor = basisIcon === "🎯" ? C.accent : basisIcon === "🗺️" ? C.green : C.gold;
  return <div style={{ padding: 10, borderRadius: 8, background: "#" + idea.bgColor + "06", border: "1px solid #" + idea.bgColor + "18", display: "flex", gap: 8 }}>
    <PhoneMockup hook={idea.hook} bgColor={idea.bgColor} product={idea.product} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
        {idea.basis && <span style={{ padding: "1px 5px", borderRadius: 3, background: basisColor + "12", color: basisColor, fontSize: 7, fontWeight: 700 }}>{basisIcon} {idea.basis.length > 20 ? idea.basis.substring(0, 20) + "…" : idea.basis}</span>}
        {idea.asset && <span style={{ padding: "1px 5px", borderRadius: 3, background: C.accent + "10", color: C.accent, fontSize: 7, fontWeight: 700 }}>{idea.asset}</span>}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.35, marginBottom: 4 }}>{idea.title}</div>
      {idea.hook && <div style={{ fontSize: 10, marginBottom: 4 }}><span style={{ padding: "1px 4px", borderRadius: 3, background: C.gold, color: "#fff", fontSize: 7, fontWeight: 700, marginRight: 4 }}>HOOK</span><span style={{ color: C.sub }}>{idea.hook}</span></div>}
      {idea.twist && <div style={{ fontSize: 10, color: C.sub, marginBottom: 2, padding: "2px 5px", borderRadius: 3, background: C.accent + "08", borderLeft: "2px solid " + C.accent }}><strong style={{ color: C.accent }}>반전</strong> {idea.twist}</div>}
      {idea.message && <div style={{ fontSize: 10, color: C.sub, marginBottom: 2 }}><strong style={{ color: C.goldDeep }}>메시지</strong> {idea.message}</div>}
      {idea.product && <div style={{ fontSize: 10, marginBottom: 2 }}><strong style={{ color: C.goldDeep }}>연결</strong> <span style={{ padding: "1px 4px", borderRadius: 3, background: C.goldLight, color: C.goldDeep, fontWeight: 600, fontSize: 9 }}>{idea.product}</span></div>}
      {idea.target && <div style={{ fontSize: 10, color: C.sub }}><strong style={{ color: C.goldDeep }}>타겟</strong> {idea.target}</div>}
      {idea.demand && <div style={{ fontSize: 10, marginTop: 3, padding: "3px 6px", borderRadius: 4, background: C.accent + "08", border: "1px solid " + C.accent + "15" }}><strong style={{ color: C.accent }}>📊 수요</strong> <span style={{ color: C.sub }}>{idea.demand}</span></div>}
    </div>
  </div>;
}

/* ═══ Data Evidence Panel (collapsible) ═══ */
function DataPanel({ icon, title, color, summary, children }) {
  var _o = useState(false), open = _o[0], setOpen = _o[1];
  return <div style={{ marginBottom: 4, borderRadius: 6, border: "1px solid " + color + "20", overflow: "hidden" }}>
    <div onClick={function() { setOpen(!open); }} style={{ padding: "6px 10px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", background: color + "04" }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: color }}>{title}</span>
      <span style={{ flex: 1, fontSize: 9, color: C.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{summary}</span>
      <span style={{ color: color, fontSize: 8, fontWeight: 800 }}>{open ? "▴" : "▾"}</span>
    </div>
    {open && <div style={{ padding: "6px 10px 8px", borderTop: "1px solid " + color + "12", fontSize: 10, color: C.sub, lineHeight: 1.6 }}>{children}</div>}
  </div>;
}

/* ═══ Process Flow (4 steps) ═══ */
function ProcessFlow({ phase }) {
  var st = [{ l: "클러스터", ic: "🎯" }, { l: "경로", ic: "🗺️" }, { l: "수요", ic: "📊" }, { l: "아이디어", ic: "✨" }];
  var pI = { cluster: 0, path: 1, demand: 2, idea: 3, done: 4 }, ci = pI[phase] !== undefined ? pI[phase] : -1;
  return <div style={{ display: "flex", padding: "6px 0" }}>{st.map(function(x, i) {
    var dn = i < ci, ac = i === ci;
    return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", opacity: dn || ac ? 1 : 0.3 }}>
      <div style={{ width: 26, height: 26, borderRadius: 6, background: dn || ac ? C.gold + "15" : C.alt, border: "2px solid " + (dn || ac ? C.gold : C.border), display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 2, animation: ac ? "pulse 1.5s ease infinite" : "none" }}><span style={{ fontSize: 11 }}>{x.ic}</span></div>
      <div style={{ fontSize: 8, fontWeight: 700, color: dn || ac ? C.text : C.muted }}>{x.l}</div>
      {i < 3 && <div style={{ position: "absolute", top: 13, left: "calc(50% + 15px)", width: "calc(100% - 30px)", height: 2, borderRadius: 1, background: dn ? C.gold + "35" : C.border }} />}
    </div>;
  })}</div>;
}

/* ═══ Result Card — Data Evidence + Unified Ideas ═══ */
function ResultCard({ cat, data, onRegen }) {
  var _o = useState(true), open = _o[0], setOpen = _o[1];
  var pre = data.pre || {};
  var parsed = parseIdeas(data.ideas || "");
  return <div style={{ marginBottom: 10, borderRadius: 12, border: "2px solid " + C.border, background: C.card, overflow: "hidden" }}>
    {/* Header */}
    <div onClick={function() { setOpen(!open); }} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: open ? C.alt : C.card }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: cat.color + "12", border: "2px solid " + cat.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{cat.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: cat.color }}>{cat.label}</div>
        <div style={{ fontSize: 10, color: C.sub }}>{pre.ps === "verified" ? "🟢 경로 확인" : "🟡 블루오션"} · {(pre.di || "").substring(0, 45)}...</div>
      </div>
      <span style={{ fontSize: 10, color: C.muted }}>{parsed.length > 0 ? parsed.length + "개" : ""}</span>
      <span style={{ color: cat.color, fontSize: 11, fontWeight: 800 }}>{open ? "▴" : "▾"}</span>
    </div>
    {open && <div style={{ padding: "0 14px 14px", borderTop: "1px solid " + C.border }}>
      {/* Data Evidence Panels */}
      <div style={{ padding: "8px 0 6px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, marginBottom: 4, letterSpacing: "0.05em" }}>📋 데이터 근거</div>
        <DataPanel icon="🎯" title="클러스터 발견" color={C.accent} summary={(pre.cep || "").substring(0, 50) + "..."}>
          <div style={{ fontWeight: 700, marginBottom: 3 }}>소비자 검색 맥락 (CEP)</div>
          <div style={{ marginBottom: 6 }}>{pre.cep || ""}</div>
          <div style={{ fontWeight: 700, marginBottom: 3 }}>클러스터 목록</div>
          {(pre.clusters || []).map(function(cl, i) { return <div key={i} style={{ padding: "3px 0", borderBottom: "1px solid " + C.border + "80" }}>• {cl}</div>; })}
        </DataPanel>
        <DataPanel icon="🗺️" title="경로 발견" color={C.green} summary={(pre.ps === "verified" ? "🟢 확인" : "🟡 블루오션") + " — " + (pre.pi || "").substring(0, 40) + "..."}>
          <div style={{ fontWeight: 700, marginBottom: 3 }}>경로 상태: {pre.ps === "verified" ? <span style={{ color: C.green }}>🟢 확인됨</span> : <span style={{ color: C.gold }}>🟡 블루오션</span>}</div>
          <div style={{ marginBottom: 6 }}>{pre.pi || ""}</div>
          <div style={{ fontWeight: 700, marginBottom: 3 }}>검색 경로</div>
          {(pre.paths || []).map(function(pt, i) { return <div key={i} style={{ padding: "3px 0", borderBottom: "1px solid " + C.border + "80", fontFamily: "monospace", fontSize: 9 }}>→ {pt}</div>; })}
        </DataPanel>
        <DataPanel icon="📊" title="수요 검증" color={C.gold} summary={(pre.di || "").substring(0, 50) + "..."}>
          <div>{pre.di || ""}</div>
        </DataPanel>
      </div>

      {/* Ideas */}
      <div style={{ borderTop: "1px solid " + C.border, paddingTop: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.text, marginBottom: 6 }}>✨ 콘텐츠 아이디어</div>
        {data.ideaLoading ? <div style={{ textAlign: "center", padding: 20, fontSize: 11, color: C.gold, animation: "pulse 1.5s ease infinite" }}>✨ 6개 아이디어 생성 중...</div>
        : parsed.length > 0 ? <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{parsed.map(function(idea, i) { return <IdeaCard key={i} idea={idea} />; })}</div>
          {onRegen && <div style={{ textAlign: "right", marginTop: 8 }}><button onClick={function(e) { e.stopPropagation(); onRegen(cat.id); }} style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid " + C.gold + "30", background: "transparent", color: C.gold, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>🔄 다른 각도로 재생성</button></div>}
        </div>
        : data.ideas ? <div>
          <div style={{ padding: "6px 8px", borderRadius: 5, background: C.gold + "08", border: "1px solid " + C.gold + "15", marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, marginBottom: 2 }}>⚠️ 아이디어 파싱 실패 — 재생성을 시도해보세요</div>
            <div style={{ fontSize: 9, color: C.muted }}>AI 응답 형식이 예상과 달라 카드로 표시하지 못했습니다.</div>
          </div>
          <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.6, whiteSpace: "pre-line", maxHeight: 300, overflow: "auto", padding: 8, borderRadius: 6, background: C.alt, border: "1px solid " + C.border }}>{data.ideas}</div>
          {onRegen && <div style={{ textAlign: "right", marginTop: 8 }}><button onClick={function(e) { e.stopPropagation(); onRegen(cat.id); }} style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid " + C.gold + "30", background: "transparent", color: C.gold, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>🔄 다른 각도로 재생성</button></div>}
        </div>
        : null}
      </div>
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
function SYS_BASE(catLabel) {
  return '너는 "' + catLabel + '" 분야의 숏폼 콘텐츠 크리에이터다. 이 분야 소비자가 진짜로 보고 싶어하는 콘텐츠를 만든다.\n\n핵심 규칙:\n1. 제목과 후킹은 반드시 "' + catLabel + '" 카테고리의 관심사여야 한다. 세포랩, 화장품, 에센스, 스킨케어 같은 단어가 제목/후킹에 나오면 안 된다.\n2. 콘텐츠의 시작은 100% 이 카테고리의 이야기다. 소비자가 "이건 내 관심사 콘텐츠"라고 느껴야 한다.\n3. 콘텐츠 중반에 "그런데 이게 사실은 피부와도 관련이 있다" 같은 반전/연결이 나온다.\n4. 그 연결 지점에서 세포랩의 브랜드 자산이 자연스럽게 등장한다.\n5. 소비자 반응: "이게 화장품 광고였어?" (마지막에 놀라는 구조)\n\n세포랩 브랜드 자산 (콘텐츠 중반 이후에만 사용):\n① 발견 스토리: 당뇨 신약 연구 중 세리포리아 락세라타 우연 발견\n② AGEs 억제: 최종당화산물 억제 원천기술\n③ CLEPS® 92.8%: 10년 150억 자체 R&D. 단일 유효성분 92.8% 고함량\n④ 5성분 미니멀: 핵심 5가지 성분만\n⑤ 프리케어: 화장품 보다 먼저 세포랩 — 세안 후 첫 단계\n⑥ 피부 기초체력: 피부에도 기초체력이 있다는 새로운 관점\n제품: 바이오제닉 에센스 90%, 하이드레이션, 블렌디드 50%, 솝, 마스크\n타겟: 4050 여성\n\n⚠️ 절대 규칙:\n1. 모르는 사실을 만들지 마라. 모델의 경력, 기업의 재무, 연구 결과 등을 추측하지 마라.\n2. 확인된 사실만 사용: 위 ①~⑥ 브랜드 자산에 있는 내용만.\n3. 클러스터 키워드는 "소비자가 이렇게 검색한다"는 데이터일 뿐, 사실이 아니다.\n4. 6개 아이디어는 반드시 서로 다른 브랜드 자산(①~⑥)을 각각 활용해라. 같은 자산을 두 번 쓰지 마라.\n5. 특정 인물(교수, 의사, 연구원, 인플루언서 등)을 콘텐츠에 언급하지 마라. 인물 대신 개념, 트렌드, 과학적 사실로 콘텐츠를 만들어라.';
}
var IDEA_FORMAT = '\n\n각 아이디어는 이 형식:\n\n**제목**: [릴스/숏폼] 이 카테고리 소비자가 클릭할 제목. 세포랩/화장품/에센스 단어 금지.\n**썸네일 후킹**: 이 카테고리의 관심사로만 후킹. 15자 이내. 세포랩/화장품 단어 금지.\n**반전 연결**: 카테고리 이야기에서 피부/세포랩으로 자연스럽게 넘어가는 한 줄.\n**배경무드**: HEX 6자리\n**핵심 메시지**: 한 줄\n**연결 상품**: 세포랩 제품명\n**근거**: Cluster(어떤 맥락) / Path(어떤 경로) / AI(교차 인사이트) 중 하나. 어떤 데이터에서 출발했는지.\n**활용 자산**: ①~⑥ 중 사용한 자산 번호와 이름\n**타겟**: 구체적 페르소나\n**수요 근거**: 관련 검색량/트렌드 한 줄';

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

  /* ═══ Build data prompt from preloaded ═══ */
  function buildDataPrompt(cat, pre) {
    return '[카테고리] ' + cat.label +
      '\n\n[클러스터 발견 — 소비자 검색 맥락]\n' + (pre.cep || '') + '\n클러스터:\n' + (pre.clusters || []).map(function(c) { return '• ' + c; }).join('\n') +
      '\n\n[경로 발견 — 소비자 검색 여정]\n상태: ' + (pre.ps === "verified" ? "🟢 확인됨 (경로가 데이터로 증명됨)" : "🟡 블루오션 (연결이 비어있어 콘텐츠 기회)") + '\n' + (pre.pi || '') + '\n경로:\n' + (pre.paths || []).map(function(p) { return '→ ' + p; }).join('\n') +
      '\n\n[수요 검증]\n' + (pre.di || '');
  }

  /* ═══ Regenerate all ideas ═══ */
  var regenIdeas = useCallback(async function(catId) {
    var cat = CATS.find(function(c) { return c.id === catId; });
    if (!cat) return;
    var pre = PRELOADED[catId] || {};
    var prev = catData[catId] || {};
    var prevIdeas = prev.ideas || "";

    setCatData(function(pv) { var n = Object.assign({}, pv); n[catId] = Object.assign({}, n[catId] || {}, { ideaLoading: true }); return n; });

    var avoidPrompt = prevIdeas.length > 50 ? '\n\n⚠️ 이전에 나온 아이디어:\n' + prevIdeas.substring(0, 600) + '\n\n위와 완전히 다른 각도, 다른 소재, 다른 포맷의 아이디어를 만들어라. 같은 방향 반복 금지.' : '';
    var dataPrompt = buildDataPrompt(cat, pre);

    try {
      var ideas = await callAI(
        SYS_BASE(cat.label),
        dataPrompt + avoidPrompt + '\n\n위 3가지 데이터(클러스터/경로/수요)를 종합해서 정확히 6개 숏폼 콘텐츠 아이디어를 만들어라.\n- 6개 모두 서로 다른 브랜드 자산(①~⑥)을 각각 하나씩 활용해야 한다.\n- 각 아이디어에 어떤 데이터 근거(Cluster/Path/AI)에서 출발했는지 명시하라.\n- 클러스터 근거 2개, 경로 근거 2개, AI 교차 인사이트 근거 2개가 되면 이상적이다.\n- 제목/후킹은 반드시 "' + cat.label + '" 소비자의 관심사여야 한다.' + IDEA_FORMAT,
        10000
      );
      setCatData(function(pv) { var n = Object.assign({}, pv); n[catId] = Object.assign({}, n[catId] || {}, { ideas: ideas, ideaLoading: false }); return n; });
    } catch (e) {
      setCatData(function(pv) { var n = Object.assign({}, pv); n[catId] = Object.assign({}, n[catId] || {}, { ideas: "⚠️ " + e.message, ideaLoading: false }); return n; });
    }
  }, [catData]);

  /* ═══ Scan One Category ═══ */
  var scanOne = useCallback(async function(cat) {
    var pre = PRELOADED[cat.id] || {};
    try {
      /* STEP 1: Cluster data loading (visual) */
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "cluster"; return n; });
      setCatData(function(pv) { var n = Object.assign({}, pv); n[cat.id] = { pre: pre }; return n; });
      await wt(800);

      /* STEP 2: Path data loading (visual) */
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "path"; return n; });
      await wt(800);

      /* STEP 3: Demand verification (visual) */
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "demand"; return n; });
      await wt(800);

      /* STEP 4: Generate 6 ideas (single AI call) */
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "idea"; return n; });
      var dataPrompt = buildDataPrompt(cat, pre);

      var ideas = await callAI(
        SYS_BASE(cat.label),
        dataPrompt + '\n\n위 3가지 데이터(클러스터/경로/수요)를 종합해서 정확히 6개 숏폼 콘텐츠 아이디어를 만들어라.\n- 6개 모두 서로 다른 브랜드 자산(①~⑥)을 각각 하나씩 활용해야 한다.\n- 각 아이디어에 어떤 데이터 근거(Cluster/Path/AI)에서 출발했는지 명시하라.\n- 클러스터 근거 2개, 경로 근거 2개, AI 교차 인사이트 근거 2개가 되면 이상적이다.\n- 제목/후킹은 반드시 "' + cat.label + '" 소비자의 관심사여야 한다.' + IDEA_FORMAT,
        10000
      );

      setCatData(function(pv) { var n = Object.assign({}, pv); n[cat.id] = { pre: pre, ideas: ideas }; return n; });
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "done"; return n; });
    } catch (err) {
      setCatData(function(pv) { var n = Object.assign({}, pv); n[cat.id] = { pre: pre, ideas: "⚠️ " + err.message }; return n; });
      setPhases(function(p) { var n = Object.assign({}, p); n[cat.id] = "done"; return n; });
    }
  }, []);

  var startScan = useCallback(async function() {
    setStatus("scanning"); setCatData({}); setPhases({});
    var cs = CATS.filter(function(c) { return sel[c.id]; });
    for (var i = 0; i < cs.length; i++) {
      setGMsg(cs[i].icon + " " + cs[i].label + " (" + (i + 1) + "/" + cs.length + ")");
      await scanOne(cs[i]);
      if (i < cs.length - 1) await wt(500);
    }
    setStatus("done"); setGMsg("");
  }, [sel, scanOne]);

  var doneCount = Object.keys(phases).filter(function(k) { return phases[k] === "done"; }).length;

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
            <h1 style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.4, marginBottom: 8 }}>뷰티에 갇히지 마세요.<br/><span style={{ color: C.gold }}>8개 관심사</span>에서<br/>세포랩을 발견하게 만듭니다.</h1>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5, marginBottom: 8 }}>
            {CATS.map(function(c) { var on = !!sel[c.id]; return <div key={c.id} onClick={function() { tog(c.id); }} style={{ padding: 8, borderRadius: 7, border: "2px solid " + (on ? c.color : C.border), background: on ? c.color + "06" : C.card, cursor: "pointer", textAlign: "center" }}>
              <span style={{ fontSize: 14 }}>{c.icon}</span>
              <div style={{ fontSize: 9, fontWeight: on ? 800 : 500, color: on ? C.text : C.sub, marginTop: 2 }}>{c.label}</div>
            </div>; })}
          </div>
          <button onClick={startScan} disabled={selCount === 0} style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: selCount > 0 ? C.gold : C.border, color: selCount > 0 ? "#fff" : C.muted, fontSize: 13, fontWeight: 900, cursor: selCount > 0 ? "pointer" : "default" }}>{selCount > 0 ? selCount + "개 관심사 × 데이터 종합 분석 →" : "관심사를 선택해주세요"}</button>
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
          if (d && d.ideas) return <ResultCard key={c.id} cat={c} data={d} onRegen={regenIdeas} />;
          if (p && p !== "done") return <div key={c.id} style={{ padding: 12, borderRadius: 10, border: "1.5px solid " + C.border, background: C.card, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: c.color + "10", border: "2px solid " + c.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{c.icon}</div>
              <div><div style={{ fontSize: 13, fontWeight: 700 }}>{c.label}</div><div style={{ display: "inline-block", padding: "2px 6px", borderRadius: 4, background: C.gold, color: "#fff", fontSize: 8, fontWeight: 700, animation: "pulse 1.5s ease infinite" }}>{p === "cluster" ? "🎯 클러스터 데이터 로딩..." : p === "path" ? "🗺️ 경로 데이터 로딩..." : p === "demand" ? "📊 수요 데이터 검증..." : "✨ 아이디어 생성 중..."}</div></div>
            </div>
            <ProcessFlow phase={p} />
          </div>;
          return <div key={c.id} style={{ padding: 10, borderRadius: 8, border: "1px solid " + C.border, background: C.card, marginBottom: 5, opacity: 0.3, display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 14 }}>{c.icon}</span><span style={{ fontSize: 11, color: C.muted }}>{c.label}</span><span style={{ fontSize: 9, color: C.border, marginLeft: "auto" }}>대기</span></div>;
        })}
      </div>}

      <div style={{ padding: "8px 0 14px", fontSize: 8, color: C.border, display: "flex", justifyContent: "space-between" }}><span>ListeningMind × Claude AI — Data-Driven Content Strategy</span><span>pentacle for cepolab</span></div>
    </div>
    {toast && <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", padding: "10px 18px", borderRadius: 8, background: C.green + "E8", color: "#fff", fontSize: 12, fontWeight: 600, zIndex: 999, animation: "fadeIn 0.3s ease" }}>{toast}</div>}
  </div>;
}
