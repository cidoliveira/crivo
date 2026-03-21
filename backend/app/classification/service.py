import time

from huggingface_hub import AsyncInferenceClient, InferenceTimeoutError
from huggingface_hub.errors import HfHubHTTPError

MODEL_ID = "facebook/bart-large-mnli"
CANDIDATE_LABELS = ["produtivo", "improdutivo"]

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

def build_suggestion(label: str, text: str = "") -> str:
    # Extract first meaningful line as subject hint
    lines = [l.strip() for l in text.strip().split('\n') if l.strip() and len(l.strip()) > 10]
    subject_hint = lines[0][:80] if lines else "sua mensagem"

    if label == "Produtivo":
        return (
            f"Prezado(a),\n\n"
            f"Recebemos sua mensagem referente a \"{subject_hint}\" e já estamos "
            f"encaminhando ao setor responsável para análise e tratamento.\n\n"
            f"Retornaremos com uma resposta completa em até 2 dias úteis.\n\n"
            f"Atenciosamente,\n[Seu Nome]"
        )
    else:
        return (
            f"Prezado(a),\n\n"
            f"Agradecemos o envio da mensagem referente a \"{subject_hint}\". "
            f"Identificamos que se trata de um conteúdo informativo que não requer "
            f"ação imediata de nossa parte.\n\n"
            f"Caso tenha alguma solicitação específica, por favor entre em contato "
            f"diretamente pelos nossos canais de atendimento.\n\n"
            f"Atenciosamente,\n[Seu Nome]"
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
    label = "Produtivo" if top["label"] == "produtivo" else "Improdutivo"
    confidence = float(top["score"])

    return label, confidence, elapsed_ms
