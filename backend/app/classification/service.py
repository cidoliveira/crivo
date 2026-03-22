import re
import time
from unicodedata import normalize as _unorm

from huggingface_hub import AsyncInferenceClient, InferenceTimeoutError
from huggingface_hub.errors import HfHubHTTPError

MODEL_ID = "facebook/bart-large-mnli"
CANDIDATE_LABELS = ["productive", "unproductive"]
HYPOTHESIS_TEMPLATE = "This email is a {} business communication."
_LABEL_MAP = {"productive": "Produtivo", "unproductive": "Improdutivo"}

_EXPLANATIONS = {
    "Produtivo": (
        "Este email foi classificado como Produtivo pois apresenta "
        "características de comunicação relevante para o negócio, como "
        "solicitação formal, ação requerida ou informação operacional direta."
    ),
    "Improdutivo": (
        "Este email foi classificado como Improdutivo pois apresenta "
        "características de conteúdo automatizado, newsletter, notificação "
        "de sistema ou comunicação sem ação requerida."
    ),
}

# ---------------------------------------------------------------------------
# No-reply detection
# ---------------------------------------------------------------------------

_NOREPLY_SENDER_PATTERNS = [
    "noreply@", "no-reply@", "notificacao@", "transacoes@",
    "seguranca@", "alerta@", "sistema@", "mailer-daemon@",
]

_NOREPLY_BODY_PHRASES = [
    "nao responda este email",
    "não responda este email",
    "mensagem automatica",
    "mensagem automática",
    "email automatico",
    "email automático",
    "este e um email automatico",
    "este é um email automático",
    "para descadastrar",
]


def _normalize(text: str) -> str:
    return _unorm("NFKD", text.lower()).encode("ascii", "ignore").decode()


def detect_no_reply(sender: str, text: str) -> bool:
    s = sender.lower()
    if any(p in s for p in _NOREPLY_SENDER_PATTERNS):
        return True
    norm = _normalize(text)
    return any(phrase in norm for phrase in [_normalize(p) for p in _NOREPLY_BODY_PHRASES])


# ---------------------------------------------------------------------------
# Email type detection
# ---------------------------------------------------------------------------

_TYPE_KEYWORDS: dict[str, list[str]] = {
    # Productive
    "solicitacao": [
        "solicito", "preciso receber", "envie", "necessario", "necessário",
        "prazo", "urgente", "documentacao", "documentação", "por favor enviar",
        "favor encaminhar", "aguardo retorno",
    ],
    "proposta": [
        "parceria", "proposta", "gostariamos de explorar", "gostaríamos de explorar",
        "agendar reuniao", "agendar reunião", "apresentar", "sinergia",
        "explorar oportunidade",
    ],
    "reclamacao": [
        "insatisfacao", "insatisfação", "problema", "reclamar", "cobrar",
        "resolver", "aguardando ha", "aguardando há", "pendente",
        "sem resposta", "sem retorno",
    ],
    "agendamento": [
        "reuniao", "reunião", "call", "horario disponivel", "horário disponível",
        "agendar", "confirmar presenca", "confirmar presença", "videoconferencia",
        "videoconferência",
    ],
    "negociacao": [
        "renovacao", "renovação", "contrato", "valores", "condicoes", "condições",
        "proposta atualizada", "renegociar", "reajuste", "escopo",
    ],
    # Unproductive
    "notificacao_automatica": [
        "extrato", "comprovante", "alerta de seguranca", "alerta de segurança",
        "informe de rendimentos", "confirmacao de transacao",
        "confirmação de transação",
    ],
    "newsletter": [
        "webinar", "convite", "inscreva-se", "promocao", "promoção",
        "descadastrar", "vagas limitadas", "oferta especial",
        "nao deseja receber", "não deseja receber",
    ],
}

_PRODUCTIVE_TYPES = {"solicitacao", "proposta", "reclamacao", "agendamento", "negociacao"}
_UNPRODUCTIVE_TYPES = {"notificacao_automatica", "newsletter", "informativo"}


def detect_email_type(label: str, text: str, sender: str, no_reply: bool) -> str:
    norm = _normalize(text)
    if no_reply:
        # Check sub-type among unproductive
        for etype in ("notificacao_automatica", "newsletter"):
            score = sum(1 for kw in _TYPE_KEYWORDS[etype] if _normalize(kw) in norm)
            if score > 0:
                return etype
        return "notificacao_automatica"

    pool = _PRODUCTIVE_TYPES if label == "Produtivo" else _UNPRODUCTIVE_TYPES
    best_type = ""
    best_score = 0
    for etype in pool:
        keywords = _TYPE_KEYWORDS.get(etype, [])
        score = sum(1 for kw in keywords if _normalize(kw) in norm)
        if score > best_score:
            best_score = score
            best_type = etype

    if not best_type:
        return "solicitacao" if label == "Produtivo" else "informativo"
    return best_type


# ---------------------------------------------------------------------------
# Entity extraction
# ---------------------------------------------------------------------------

_RE_MONEY = re.compile(r"R\$\s?[\d.,]+")
_RE_DATE = re.compile(r"\d{2}/\d{2}/\d{4}")
_RE_PERCENT = re.compile(r"\d+(?:[.,]\d+)?%")


def extract_entities(text: str) -> dict:
    entities: dict = {}
    money = _RE_MONEY.findall(text)
    if money:
        entities["valores"] = money
    dates = _RE_DATE.findall(text)
    if dates:
        entities["datas"] = dates
    percents = _RE_PERCENT.findall(text)
    if percents:
        entities["percentuais"] = percents
    lines = [ln.strip() for ln in text.strip().split("\n") if ln.strip() and len(ln.strip()) > 10]
    if lines:
        entities["assunto"] = lines[0][:80]
    return entities


# ---------------------------------------------------------------------------
# Suggestion builder
# ---------------------------------------------------------------------------

def _get_sender_name(text: str) -> str:
    """Try to extract a greeting name like 'Prezado Carlos' from the text."""
    for line in text.split("\n"):
        stripped = line.strip()
        for prefix in ("prezado ", "prezada ", "caro ", "cara ", "olá ", "ola "):
            low = stripped.lower()
            if low.startswith(prefix):
                name = stripped[len(prefix):].rstrip(",").strip()
                if name and len(name) < 40:
                    return name
    return ""


def build_suggestion(
    label: str,
    text: str = "",
    sender: str = "",
    no_reply: bool = False,
    email_type: str = "",
    entities: dict | None = None,
) -> str:
    ent = entities or extract_entities(text)
    assunto = ent.get("assunto", "sua mensagem")
    valores = ent.get("valores", [])
    datas = ent.get("datas", [])

    if no_reply:
        return _build_internal_action(email_type, text, ent)

    sender_name = _get_sender_name(text)
    greeting = f"Prezado(a) {sender_name},\n\n" if sender_name else "Prezado(a),\n\n"
    sign_off = "\n\nAtenciosamente,\n[Seu Nome]"

    if email_type == "solicitacao":
        items_hint = ""
        if valores:
            items_hint = f" (valores mencionados: {', '.join(valores[:3])})"
        deadline = f" Faremos o retorno até {datas[0]}." if datas else " Retornaremos em até 2 dias úteis."
        return (
            f"{greeting}"
            f"Recebemos sua solicitação referente a \"{assunto}\"{items_hint} e "
            f"já estamos encaminhando ao setor responsável para análise.{deadline}"
            f"{sign_off}"
        )

    if email_type == "proposta":
        return (
            f"{greeting}"
            f"Recebemos sua proposta referente a \"{assunto}\" e consideramos "
            f"o tema bastante alinhado com nossa estratégia atual.\n\n"
            f"Vamos encaminhar ao comitê de análise e retornaremos com os "
            f"próximos passos em breve."
            f"{sign_off}"
        )

    if email_type == "reclamacao":
        return (
            f"{greeting}"
            f"Recebemos sua mensagem referente a \"{assunto}\" e lamentamos "
            f"o ocorrido. Já encaminhamos o caso para investigação interna.\n\n"
            f"Entraremos em contato com uma resolução em até 3 dias úteis."
            f"{sign_off}"
        )

    if email_type == "agendamento":
        date_hint = f" A data sugerida ({datas[0]}) foi registrada." if datas else ""
        return (
            f"{greeting}"
            f"Recebemos sua solicitação de agendamento referente a \"{assunto}\".{date_hint}\n\n"
            f"Estamos verificando a disponibilidade interna e retornaremos "
            f"com opções de horário em breve."
            f"{sign_off}"
        )

    if email_type == "negociacao":
        scope_hint = ""
        if valores:
            scope_hint = f" Os valores mencionados ({', '.join(valores[:2])}) serão analisados pela equipe."
        return (
            f"{greeting}"
            f"Recebemos sua comunicação referente a \"{assunto}\" e já iniciamos "
            f"a análise interna das condições propostas.{scope_hint}\n\n"
            f"Retornaremos com nosso posicionamento em breve."
            f"{sign_off}"
        )

    # Fallback for untyped productive
    if label == "Produtivo":
        return (
            f"{greeting}"
            f"Recebemos sua mensagem referente a \"{assunto}\" e já estamos "
            f"encaminhando ao setor responsável para análise e tratamento.\n\n"
            f"Retornaremos com uma resposta completa em até 2 dias úteis."
            f"{sign_off}"
        )

    # Fallback for untyped unproductive (newsletter, informativo)
    return (
        f"{greeting}"
        f"Agradecemos o envio referente a \"{assunto}\". Identificamos que se "
        f"trata de um conteúdo informativo. Caso tenha alguma solicitação "
        f"específica, entre em contato pelos nossos canais de atendimento."
        f"{sign_off}"
    )


def _build_internal_action(email_type: str, text: str, entities: dict) -> str:
    norm = _normalize(text)
    assunto = entities.get("assunto", "")
    valores = entities.get("valores", [])
    datas = entities.get("datas", [])

    if email_type == "notificacao_automatica":
        if "extrato" in norm:
            month_hint = f" de {datas[0]}" if datas else ""
            return (
                f"Ação interna: Baixar extrato{month_hint} e arquivar em "
                f"Financeiro/Conciliação. Conferir saldo com controle interno."
            )
        if "comprovante" in norm or "ted" in norm or "transferencia" in norm:
            val_hint = f" de {valores[0]}" if valores else ""
            return (
                f"Ação interna: Arquivar comprovante{val_hint} em "
                f"Financeiro/Conciliação bancária."
            )
        if "seguranca" in norm or "segurança" in _normalize(text) or "acesso" in norm:
            return (
                "Ação interna: Verificar legitimidade do acesso detectado. "
                "Se legítimo, nenhuma ação necessária. Caso contrário, acionar "
                "bloqueio imediato e registrar no log de segurança."
            )
        if "informe" in norm and "rendimento" in norm:
            date_hint = f" antes de {datas[0]}" if datas else ""
            return (
                f"Ação interna: Baixar informe de rendimentos e encaminhar "
                f"para Contabilidade{date_hint}."
            )
        return (
            "Ação interna: Arquivar notificação para referência. "
            "Nenhuma ação imediata necessária."
        )

    if email_type == "newsletter":
        topic = assunto if assunto else "conteúdo recebido"
        return (
            f"Ação interna: Avaliar relevância de \"{topic}\" para a equipe. "
            f"Se pertinente, encaminhar internamente."
        )

    return (
        "Ação interna: Arquivar para referência. "
        "Nenhuma ação imediata necessária."
    )


def build_explanation(label: str, confidence: float) -> str:
    pct = round(confidence * 100)
    base = _EXPLANATIONS.get(label, "Classificação concluída.")
    return f"Este email foi classificado como {label} com {pct}% de confiança. {base}"


async def classify_email_text(
    text: str,
    hf_client: AsyncInferenceClient,
) -> tuple[str, float, int]:
    start = time.monotonic()
    try:
        result = await hf_client.zero_shot_classification(
            text=text,
            candidate_labels=CANDIDATE_LABELS,
            multi_label=False,
            model=MODEL_ID,
            hypothesis_template=HYPOTHESIS_TEMPLATE,
        )
    except InferenceTimeoutError as exc:
        raise ValueError(
            "O modelo está demorando para responder. Tente novamente em alguns instantes."
        ) from exc
    except HfHubHTTPError as exc:
        status = getattr(getattr(exc, "response", None), "status_code", None)
        if status == 503:
            raise ValueError(
                "O modelo está sendo carregado. Aguarde alguns instantes e tente novamente."
            ) from exc
        raise ValueError(
            f"Erro na API de classificação (status {status})."
        ) from exc
    except Exception as exc:
        raise ValueError("Erro inesperado ao classificar o email.") from exc

    elapsed_ms = int((time.monotonic() - start) * 1000)

    # result is a list sorted descending by score; first element is the winner
    top = result[0]
    label = _LABEL_MAP.get(top["label"], "Improdutivo")
    confidence = float(top["score"])

    return label, confidence, elapsed_ms
