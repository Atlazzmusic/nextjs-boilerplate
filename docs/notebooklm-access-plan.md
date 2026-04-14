# Plan: NotebookLM-tilgang i Research Agent med eksisterende verktøy

## Mål
Gi `research-agent` kontrollert tilgang til NotebookLM som kunnskapsverktøy, uten å svekke kildekritikk, sporbarhet eller bruk av øvrige verktøy i agentplattformen.

## Premisser
- NotebookLM brukes som **kontekst- og dokumentgrensesnitt**, ikke som sannhetskilde alene.
- Alle funn som brukes i output må fortsatt være kildebelagt og klassifisert (`fact`, `validated_insight`, `signal`, `assumption`).
- Eksisterende verktøy (interne dokumenter, web-søk, databaser/API-er) skal fortsatt være tilgjengelige via en felles verktøyruter.

---

## Fase 1 — Integrasjon og tilgangsstyring

### 1) Legg til NotebookLM som eksplisitt tool-provider
Oppdater agentkonfigurasjon med en ny blokk:

```json
"tool_providers": {
  "notebooklm": {
    "enabled": true,
    "mode": "context_retrieval",
    "auth": "oauth_or_service_account",
    "allowed_operations": ["list_notebooks", "search_notes", "get_citations"],
    "rate_limits": { "rpm": 30 }
  }
}
```

### 2) Definer verktøyruter (tool router)
Ruter hver deloppgave til riktig verktøy:
- **Interne kilder først** (repo/docs/wiki/DB)
- **NotebookLM** for oppsummerte dokumentkontekster
- **Eksterne primærkilder** for verifisering
- **Nyheter** kun som signal

Routing-regler:
- `technical_research` → interne docs + primærdokumentasjon + NotebookLM for kontekst
- `market_research` → primærdata/rapporter + NotebookLM + signalaggregasjon
- `fact_verification` → primærkilder først, NotebookLM kun støtte

### 3) Innfør tydelig fallback
Hvis NotebookLM feiler/ikke har dekning:
- bruk eksisterende web/API-verktøy automatisk
- logg fallback-årsak i metadata

---

## Fase 2 — Kildesporing, kvalitet og sikkerhet

### 4) Krav til sitering fra NotebookLM
Svar fra NotebookLM må normaliseres til kildeobjekt:

```json
{
  "id": "src_nblm_001",
  "name": "NotebookLM:<notebook>/<doc>",
  "type": "secondary",
  "credibility": "medium",
  "origin": "notebooklm",
  "evidence": {
    "citation_url": "...",
    "snippet_ref": "...",
    "retrieved_at": "ISO-8601"
  }
}
```

### 5) Uavhengig verifisering før "fact"
Regel:
- NotebookLM alene kan aldri gi `fact: high`.
- Krev minst én uavhengig primærkilde for å oppgradere fra `validated_insight` til `fact`.

### 6) Personvern og tilgangsnivå
- Klassifiser notebooks (public/internal/restricted)
- Blokker sensitive notebooks for brede research-oppgaver
- Audit-logg: hvem spurte, hvilket verktøy ble brukt, hvilke kilder ble returnert

---

## Fase 3 — Operasjonell styring og læring

### 7) Evalueringsmetrikker
Innfør:
- `citation_coverage` (andel findings med validerbar kilde)
- `primary_source_ratio` (andel findings støttet av primærkilde)
- `notebooklm_hit_rate` (nyttige treff per kall)
- `conflict_rate` (andel funn med konflikt)
- `calibration_error` (confidence vs faktisk kvalitet)

### 8) Feedback-loop per kildekanal
Lagre for hver oppgave:
- `tool_used` (notebooklm/web/internal)
- `used_in_final_answer_pct`
- `human_feedback_score`
- `time_to_confidence`

Bruk dette til automatisk ned-/opprangering av verktøy i routeren.

### 9) Stoppkriterier (effektivitet)
Avslutt søk når én av disse oppfylles:
- confidence-threshold nådd
- marginal nytte av nye kilder under terskel
- tids-/kostnadsbudsjett nådd

---

## Foreslåtte endringer i agentkonfig (v5.1)

1. Legg til `tool_providers.notebooklm`
2. Legg til `tool_router.rules`
3. Legg til `verification_policy` (krav for `fact`)
4. Legg til `source_schema.evidence`
5. Legg til `privacy_policy` + `audit_policy`
6. Legg til `quality_metrics` + `stopping_criteria`

---

## Eksempel: beslutningsflyt for én oppgave
1. Tolk mål og use-case.
2. Hent interne dokumenter.
3. Kall NotebookLM for relevant kontekst.
4. Ekstraher påstander + NotebookLM-citations.
5. Verifiser kritiske påstander mot primærkilder.
6. Klassifiser findings (`fact`, `validated_insight`, `signal`, `assumption`).
7. Sett confidence med eksplisitte terskler.
8. Returner strukturert output + gaps/conflicts/risks.

Dette gir NotebookLM nytte som hurtig kontekstverktøy, samtidig som agenten beholder streng kildekritikk og kan bruke alle øvrige verktøy ved behov.
