# AutoU Email Classifier

## What This Is

Uma aplicacao web que usa inteligencia artificial para classificar emails automaticamente em "Produtivo" ou "Improdutivo" e sugerir respostas automaticas. Construida como case tecnico para uma vaga na AutoU, empresa do setor financeiro que lida com alto volume de emails diariamente.

## Core Value

Classificar emails com precisao e sugerir respostas relevantes — a IA precisa funcionar bem, senao nada mais importa.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Upload de emails em .txt ou .pdf ou insercao direta de texto
- [ ] Classificacao automatica em Produtivo ou Improdutivo via Hugging Face
- [ ] Sugestao de resposta automatica baseada na classificacao
- [ ] Interface web estilo dashboard corporativo (dark mode, visual financeiro)
- [ ] Backend Python com FastAPI processando emails via NLP
- [ ] Historico de emails classificados com timeline
- [ ] Dashboard de metricas (graficos % produtivo vs improdutivo)
- [ ] Processamento em lote (batch) de multiplos emails
- [ ] Persistencia em PostgreSQL
- [ ] Deploy: frontend no Vercel (Next.js), backend no Render (FastAPI)
- [ ] Repositorio GitHub publico com README claro
- [ ] Aplicacao acessivel via URL publica e funcional

### Out of Scope

- Autenticacao de usuarios — desnecessario para demo/case
- Integracao real com caixa de email (IMAP/SMTP) — fora do briefing
- Treinamento custom de modelo — usar modelos pre-treinados do Hugging Face
- App mobile — web-first conforme briefing
- Suporte a outros idiomas alem de portugues — foco no case brasileiro

## Context

- Case tecnico para vaga de emprego na AutoU
- Prazo: 3-5 dias
- Empresa do setor financeiro — visual deve transmitir seriedade e profissionalismo
- Avaliacao considera: funcionalidade, qualidade tecnica, uso de IA, deploy, interface, autonomia, comunicacao
- Interface e um diferencial explicito no briefing — "oportunidade para se destacar"
- Entregaveis: repositorio GitHub + video 3-5min + link da app deployada
- Precisa funcionar sem instalacao local para avaliadores testarem

## Workflow Rules

- **Frontend**: SEMPRE usar as skills `frontend-design` e `taste-skill` ao trabalhar em qualquer componente, pagina ou elemento visual do frontend

## Constraints

- **Stack frontend**: Next.js + Tailwind CSS — deploy no Vercel
- **Stack backend**: Python + FastAPI — deploy no Render (free tier)
- **IA**: Hugging Face Transformers — modelos pre-treinados para classificacao e geracao
- **Banco de dados**: PostgreSQL no Render (free tier)
- **Visual**: Dashboard corporativo dark mode — tons escuros, profissional, setor financeiro
- **Custo**: Zero — usar apenas free tiers (Vercel, Render, Hugging Face)
- **Prazo**: 3-5 dias para entrega completa

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + FastAPI (separados) | Melhor deploy, frontend otimizado no Vercel, backend Python no Render | -- Pending |
| Hugging Face em vez de OpenAI | Gratuito, alinhado com briefing de NLP, sem custo de API | -- Pending |
| PostgreSQL em vez de SQLite | Mais robusto, Render oferece free tier, impressiona mais | -- Pending |
| Todos os extras (historico, metricas, batch) | 3-5 dias permite, diferenciais fortes na avaliacao | -- Pending |
| Dashboard corporativo dark | Setor financeiro, transmite seriedade e competencia tecnica | -- Pending |

---
*Last updated: 2026-03-18 after initialization*
