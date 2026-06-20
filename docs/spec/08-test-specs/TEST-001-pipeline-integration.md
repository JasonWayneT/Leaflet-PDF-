# Test Spec: TEST-001 — Pipeline Integration

## Metadata

- **Test ID:** `TEST-001`
- **Status:** draft
- **Type:** integration
- **Related requirements:** `FR-005`, `FR-006`, `FR-007`, `FR-013`, `FR-015`, `FR-016`, `FR-017`, `FR-018`, `NFR-001`, `NFR-002`, `NFR-003`
- **Related feature spec:** `FEAT-002`, `FEAT-004`

## Purpose

Verify that all 5 pipeline modules execute in correct sequence, all handoff contracts are respected, retry logic behaves correctly, and no unvalidated content reaches the renderer.

## Test cases

### TC-001: Happy path — full pipeline success

**Type:** integration (real AI calls)
**Requirement:** FR-005, FR-007, NFR-001, NFR-003

**Setup:** Sample plain-text 500-word document, Anthropic provider configured

**Steps:**
1. Call `runPipeline({ sourceContent, styleSelection: 'orbital-light', providerConfig })`
2. Subscribe to all EventEmitter events

**Expected:**
- Events emitted in order: `pipeline:stage-update` × 4 (Extracting → Transforming → Validating → Rendering)
- `pipeline:complete` emitted with `{ pdfBuffer: Buffer, title: string }`
- PDF buffer is non-empty and begins with `%PDF`
- `leafletpdf-token-log.jsonl` has one new entry with correct schema
- No raw exceptions thrown

**Pass criteria:** All events in order; valid PDF buffer; token log written

---

### TC-002: Validation failure → auto-retry → success

**Type:** unit (mocked validator)
**Requirement:** FR-017, AC-039–041

**Setup:** Mock Validator to return `{ passed: false, failedClaims: [...] }` on attempt 1, `{ passed: true }` on attempt 2

**Steps:**
1. Call `runPipeline(...)`
2. Observe emitted events

**Expected:**
- `pipeline:stage-update` with 'Transforming' emitted twice
- `pipeline:retry` emitted with `{ attempt: 2, max: 3 }` after first failure
- `pipeline:complete` emitted after second Transformer + Validator cycle
- Retry calls Transformer with original SourceContent (not partial output)

---

### TC-003: All 3 attempts fail validation → halt

**Type:** unit (mocked validator)
**Requirement:** FR-018, AC-042–043

**Setup:** Mock Validator always returns `{ passed: false, failedClaims: [...] }`

**Steps:**
1. Call `runPipeline(...)`
2. Observe emitted events

**Expected:**
- `pipeline:retry` emitted with `{ attempt: 2, max: 3 }` then `{ attempt: 3, max: 3 }`
- `pipeline:error` emitted with `{ stage: 'Validating', cause: 'Validation failed after 3 attempts...' }`
- `pipeline:complete` never emitted
- No PDF buffer produced

---

### TC-004: Module error → stage-level halt

**Type:** unit (mocked module)
**Requirement:** FR-006, AC-014–015

**Setup:** Mock Intake to return `Result<never>` with `{ stage: 'Extracting', cause: 'No transcript available', retryable: false }`

**Expected:**
- `pipeline:error` emitted with `{ stage: 'Extracting', cause: 'No transcript available' }`
- No subsequent modules called
- No PDF written

---

### TC-005: Token log correctness

**Type:** unit
**Requirement:** NFR-006

**Setup:** Run TC-001 with mocked AI client that returns known token counts

**Expected:**
- `leafletpdf-token-log.jsonl` entry has correct `runId` (UUID), `timestamp` (ISO-8601), `inputType`, `sourceChars`
- `tokenUsage` has entries for `titleDerive`, `claimExtract`, `transform_1`, `validate_1`
- `tokenUsage.totals` sums correctly
- Log write failure does NOT throw or interrupt pipeline

---

### TC-006: Performance baseline

**Type:** manual (real AI calls, timed)
**Requirement:** NFR-001

**Setup:** 2,000-word plain-text document; Anthropic provider; standard internet connection

**Expected:**
- Full pipeline (Extracting → complete) completes in under 3 minutes

**Notes:** Run 3 times and record median. Document the result in test notes. This is a baseline, not a gating test for CI.

## Test runner

Vitest (co-located test files). Unit tests use `vi.mock()` for AI client and Playwright. Integration test (TC-001) requires real API credentials in environment and runs separately from the unit test suite.

## Environment setup

- Unit tests: no external dependencies required; all AI calls mocked
- Integration tests: `ANTHROPIC_API_KEY` environment variable required; `npm run test:integration`

## Open questions

None.
