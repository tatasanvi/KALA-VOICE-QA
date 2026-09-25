"""WER et CER, avec la normalisation du mémoire appliquée aux deux textes.

Reprise à l'identique du script d'analyse du mémoire : minuscules, apostrophe
typographique remplacée, tirets supprimés, chiffres puis ponctuation remplacés
par des espaces, espaces réduits. WER = distance de Levenshtein sur les mots
divisée par le nombre de mots de la référence ; CER = même calcul sur les
caractères de la chaîne normalisée (espaces compris).
"""
import re


def normalize(text: str) -> str:
    t = str(text).lower().replace("’", "'").replace("-", "").replace("‐", "")
    t = re.sub(r"\d", " ", t)
    t = re.sub(r"[^\w\s]|_", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def levenshtein(a, b) -> int:
    m, n = len(a), len(b)
    d = list(range(n + 1))
    for i in range(1, m + 1):
        p = d[:]
        d[0] = i
        for j in range(1, n + 1):
            d[j] = min(p[j] + 1, d[j - 1] + 1, p[j - 1] + (a[i - 1] != b[j - 1]))
    return d[n]


def wer_cer(reference: str, hypothesis: str):
    """Renvoie (wer, cer, ref_norm, hyp_norm) ; wer et cer valent None si la référence normalisée est vide."""
    ref, hyp = normalize(reference), normalize(hypothesis)
    if not ref:
        return None, None, ref, hyp
    wer = levenshtein(ref.split(), hyp.split()) / len(ref.split())
    cer = levenshtein(list(ref), list(hyp)) / len(ref)
    return wer, cer, ref, hyp
