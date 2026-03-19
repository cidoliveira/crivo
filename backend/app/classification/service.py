import time

from huggingface_hub import AsyncInferenceClient, InferenceTimeoutError
from huggingface_hub.errors import HfHubHTTPError

MODEL_ID = "facebook/bart-large-mnli"
CANDIDATE_LABELS = ["produtivo", "improdutivo"]

_EXPLANATIONS = {
    "Produtivo": (
        "Este email foi classificado como Produtivo pois apresenta "
        "caracteristicas de comunicacao relevante para o negocio, como "
        "solicitacao formal, acao requerida ou informacao operacional direta."
    ),
    "Improdutivo": (
        "Este email foi classificado como Improdutivo pois apresenta "
        "caracteristicas de conteudo automatizado, newsletter, notificacao "
        "de sistema ou comunicacao sem acao requerida."
    ),
}

_SUGGESTIONS = {
    "Produtivo": (
        "Ola, obrigado pelo contato.\n\n"
        "Recebemos sua mensagem sobre [assunto] e ja estamos analisando. "
        "Em breve entraremos em contato com um retorno completo sobre o tema.\n\n"
        "Atenciosamente,\n[Seu Nome]"
    ),
    "Improdutivo": (
        "Ola, obrigado pelo contato.\n\n"
        "Agradecemos sua mensagem, porem ela nao se enquadra nas demandas "
        "operacionais atendidas por este canal no momento. "
        "Caso tenha uma solicitacao especifica, entre em contato pelos canais oficiais.\n\n"
        "Atenciosamente,\n[Seu Nome]"
    ),
}

_FALLBACK_SUGGESTION = (
    "Ola, obrigado pelo contato.\n\n"
    "Recebemos sua mensagem e estamos analisando o conteudo. "
    "Em breve retornaremos com uma resposta adequada.\n\n"
    "Atenciosamente,\n[Seu Nome]"
)


def build_suggestion(label: str) -> str:
    return _SUGGESTIONS.get(label, _FALLBACK_SUGGESTION)


def build_explanation(label: str, confidence: float) -> str:
    pct = round(confidence * 100)
    base = _EXPLANATIONS.get(label, "Classificacao concluida.")
    return f"Este email foi classificado como {label} com {pct}% de confianca. {base}"


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
        )
    except InferenceTimeoutError as exc:
        raise ValueError(
            "O modelo esta demorando para responder. Tente novamente em alguns instantes."
        ) from exc
    except HfHubHTTPError as exc:
        status = getattr(getattr(exc, "response", None), "status_code", None)
        if status == 503:
            raise ValueError(
                "O modelo esta sendo carregado. Aguarde alguns instantes e tente novamente."
            ) from exc
        raise ValueError(
            f"Erro na API de classificacao (status {status})."
        ) from exc
    except Exception as exc:
        raise ValueError("Erro inesperado ao classificar o email.") from exc

    elapsed_ms = int((time.monotonic() - start) * 1000)

    # result is a list sorted descending by score; first element is the winner
    top = result[0]
    label = "Produtivo" if top["label"] == "produtivo" else "Improdutivo"
    confidence = float(top["score"])

    return label, confidence, elapsed_ms
