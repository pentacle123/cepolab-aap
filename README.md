# 세포랩 AI Algorithm Performance Platform

크로스 카테고리 콘텐츠 전략 플랫폼 — ListeningMind × Claude AI

## 구조

```
app/
  layout.js          — 루트 레이아웃
  page.js            — 메인 플랫폼 (클라이언트 컴포넌트)
  api/claude/route.js — Anthropic API 프록시 (API 키 서버 보관)
```

## 로컬 개발

```bash
npm install
cp .env.example .env.local
# .env.local에 ANTHROPIC_API_KEY 입력
npm run dev
```

## Vercel 배포

1. GitHub 레포 생성 후 push
2. Vercel에서 Import
3. Environment Variables에 `ANTHROPIC_API_KEY` 추가
4. Deploy

## 4엔진 스캔 구조

| Step | 도구 | 역할 |
|------|------|------|
| CEP 발견 | Cluster Finder | 소비자 맥락(CEP) 자동 발견 |
| 경로 분석 | Path Finder | 검색 경로 확인 (🟢확인/🟡블루오션) |
| 수요 검증 | Keyword Info | 검색량·타겟·영상SERP 검증 |
| 아이디어 | Claude AI | 데이터 기반 창의적 숏폼 아이디어 |
