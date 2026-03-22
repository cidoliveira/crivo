# Smart Suggestions — Design Document

**Date:** 2026-03-22
**Status:** Approved
**Goal:** Replace generic response templates with intelligent, context-aware suggestions. Detect no-reply emails and generate internal actions instead of replies.

---

## Problem

1. Emails with "nao responda este email" / noreply senders still get response suggestions
2. Suggestions are generic templates that don't reference specific email content (values, dates, names)
3. Tone is too formal/robotic — feels like a template, not a real response
4. No differentiation by email type (request vs proposal vs complaint)

## Solution Overview

Two new capabilities in the classification pipeline:

1. **No-reply detection** — mark automated emails and generate internal actions instead of replies
2. **Email type classification** — detect 8 email types and generate context-specific suggestions with extracted entities

---

## 1. No-Reply Detection

New function `detect_no_reply(sender: str, text: str) -> bool`.

**Sender patterns** (case-insensitive): `noreply@`, `no-reply@`, `notificacao@`, `transacoes@`, `seguranca@`, `alerta@`, `sistema@`, `mailer-daemon@`

**Body patterns** (case-insensitive): "nao responda este email", "mensagem automatica", "email automatico", "este e um email automatico", "para descadastrar"

If **any** signal matches, `no_reply=True`.

Pure string matching. No ML, no latency.

---

## 2. Email Type Classification

New function `detect_email_type(label: str, text: str, sender: str) -> str`.

### Productive types:
- `solicitacao` — "solicito", "preciso receber", "envie", "necessario", "prazo", "urgente", "documentacao"
- `proposta` — "parceria", "proposta", "gostariamos de explorar", "agendar reuniao", "apresentar"
- `reclamacao` — "insatisfacao", "problema", "reclamar", "cobrar", "resolver", "aguardando ha"
- `agendamento` — "reuniao", "call", "horario disponivel", "agendar", "confirmar presenca"
- `negociacao` — "renovacao", "contrato", "valores", "condicoes", "proposta atualizada", "renegociar"

### Unproductive types:
- `notificacao_automatica` — triggered by `no_reply=True` or: "extrato", "comprovante", "alerta de seguranca", "informe de rendimentos"
- `newsletter` — "webinar", "convite", "inscreva-se", "promocao", "descadastrar", "vagas limitadas"
- `informativo` — fallback for unproductive emails that don't match above

Weighted keyword counting. Highest match wins.

---

## 3. Entity Extraction

New function `extract_entities(text: str) -> dict`.

Regex-based extraction:
- Monetary values: `R\$ [\d.,]+`
- Dates: `\d{2}/\d{2}/\d{4}`
- Names: first greeting line pattern
- Subject keywords: first meaningful line

---

## 4. Suggestion Generation

Refactored `build_suggestion(label, text, sender, no_reply, email_type, entities)`.

### No-reply emails — Internal Actions:

| Sub-type | Action |
|----------|--------|
| Extrato bancario | "Acao interna: Baixar extrato de [mes] e arquivar em Financeiro/Conciliacao." |
| Comprovante | "Acao interna: Arquivar comprovante de [R$ X] para [destinatario] em Financeiro/Conciliacao bancaria." |
| Alerta de seguranca | "Acao interna: Verificar legitimidade do acesso ([dispositivo], [IP]). Registrar no log de seguranca." |
| Informe de rendimentos | "Acao interna: Baixar informe IR [ano-base] e encaminhar para Contabilidade antes do prazo de [data]." |
| Newsletter | "Acao interna: Avaliar relevancia de '[tema]' para a equipe. Se pertinente, encaminhar internamente." |
| Informativo (fallback) | "Acao interna: Arquivar para referencia. Nenhuma acao imediata necessaria." |

### Respondable emails — Contextual Responses:

| Type | Template strategy |
|------|-------------------|
| `solicitacao` | Confirm receipt, list requested items, inform return deadline |
| `proposta` | Show interest, mention proposal topic, inform next step (committee/meeting) |
| `reclamacao` | Acknowledge problem, apologize, inform investigation + resolution deadline |
| `agendamento` | Confirm interest, suggest checking schedule, propose availability return |
| `negociacao` | Acknowledge receipt, mention contract/scope, inform internal analysis |

All templates reference extracted entities (names, dates, values, topics).

---

## 5. Schema Changes

`ClassifyResponse` and `BatchItemResult` gain: `no_reply: bool`

No database migration needed — `no_reply` is derived on-the-fly from sender+text.

---

## 6. Frontend Changes

### result-card.tsx:
- When `no_reply=true`: label changes to "Acao Interna Sugerida", warning banner appears, textarea remains editable

### emails-table.tsx:
- No-reply emails show differentiated icon in suggestion column

### Hooks:
- `use-classify.ts` and `use-batch-classify.ts` add `no_reply: boolean` to response types

---

## 7. Seed Fixtures

All 40 seed emails rewritten:
- 16 improdutivos: contextual internal actions for automatics, improved suggestions for newsletters
- 24 produtivos: richer suggestions referencing specific email content

---

## 8. Files Changed

| File | Change |
|------|--------|
| `backend/app/classification/service.py` | Add `detect_no_reply()`, `detect_email_type()`, `extract_entities()`. Refactor `build_suggestion()` |
| `backend/app/classification/schemas.py` | Add `no_reply: bool` to response schemas |
| `backend/app/classification/router.py` | Pass sender/no_reply to suggestion builder, include in response |
| `backend/app/seed/fixtures.py` | Rewrite all 40 suggestions |
| `frontend/src/components/result-card.tsx` | Internal action variant |
| `frontend/src/components/emails-table.tsx` | Differentiated icon for no-reply |
| `frontend/src/hooks/use-classify.ts` | Add `no_reply` to type |
| `frontend/src/hooks/use-batch-classify.ts` | Add `no_reply` to type |

## 9. Risks

- Keyword detection may have false positives/negatives — worst case falls back to current generic quality
- If quality is insufficient, fallback plan: integrate HuggingFace text generation model (Mistral-7B-Instruct)
