# Pinnacle Recovery OS — Build Plan

## Delivery strategy

Build vertical, secure slices in dependency order. Each phase includes schema, RLS, application authorization, audit events, domain tests, accessible UI states, and documentation. A phase is complete only when its acceptance tests pass in a production-like environment; placeholders are clearly labeled and do not imply capability.

The architecture documents are the current deliverable. **Do not start Phase 1 until the owner approves the proposed platform, tenant model, rule governance, and security decisions.**

## Phase 0 — Architecture review (current)

Deliverables:

- Product requirements baseline.
- Architecture and folder proposal.
- Logical database schema and migration strategy.
- Security/threat model and test gates.
- Phased plan, risks, decisions, and definition of done.

Exit: owner records decisions for Supabase, data residency, legal-rule publishers, compliance overrides, sensitive document access, retention/deletion, and the Phase 1 scope.

## Phase 1 — Foundation

Deliver:

- Next.js strict-TypeScript project, lint/format/test/build CI, environment validation.
- Supabase local setup and migrations for user profiles, organizations, memberships, roles, permissions, audit/outbox baseline.
- Email/password, reset, session, invitation/bootstrap flow; MFA-compatible design.
- Active-organization routing and server-side `authorize` service.
- RLS, composite tenant constraints, and cross-tenant integration tests.
- Dark, responsive application shell, tenant-driven branding tokens, sidebar, basic organization settings.
- Structured safe logging, error/loading/empty states, and documented local setup.

Exit criteria:

- User authenticates and belongs to the fictional Pinnacle seed tenant.
- Sidebar/settings load only after membership resolution.
- Role permissions are enforced by direct server requests.
- Every tenant CRUD policy test proves Organization A cannot access Organization B.
- Permission/membership changes produce audit events.

## Phase 2 — Cases

Deliver cases, organization-scoped numbering, acquisition/recovery stages, property/sale/proceeds/source records, create/list/filter/detail views, global case/APN search, stage history, and audit/activity events.

Exit: create a fictional `RIV-2026` case, find it, view its complete core record, change its acquisition stage, and verify immutable history and cross-tenant denial.

## Phase 3 — People and research

Deliver reusable tenant-owned people/entities, structured contact points, claimant joins, family relationships, research findings, provenance, confidence, verification, and deceased status.

Exit: multiple claimants attach to one case; one person attaches to several cases without cross-tenant joins; history remains append-oriented; UI never labels a researched relationship as legal heirship.

## Phase 4 — Tasks and Work Mode

Deliver task CRUD/assignment/dates/priorities, snooze/complete, deterministic priority components, dashboard action queue, and one-task Work Mode.

Exit: operator receives the highest authorized actionable task, sees ranking reasons, completes/snoozes/skips, advances, and dashboard state changes transactionally.

## Phase 5 — Outreach

Deliver communication log, outcomes, follow-up task creation, versioned original templates, manual sequence-to-task generation, and contact compliance record framework. No automated sending.

Exit: an approved contact call can be logged and schedules follow-up; blocked/not-checked contact fails through direct server calls; timeline and audit reflect the action.

## Phase 6 — Compliance and deadlines

Deliver jurisdictions, reviewed source metadata, immutable rule versions/effective dates, case assignments, compliance snapshots, hard-block policies, governed overrides, and explicit deadline calculations/risk views.

Exit: a pinned Riverside test rule blocks and explains outreach; completing requirements unlocks it; later rule publication does not change the historical case; missing anchors produce no deadline.

## Phase 7 — Agreements and documents

Deliver private/quarantined upload, document classifications, metadata/versions, secure download, template/agreement versioning, generation adapter boundary, signature state and immutable signed version. Defer e-sign integration.

Exit: generate from approved fictional template, upload a signed artifact, deny mutation/replacement, retain checksums/history, and prove another tenant/restricted role cannot download it.

## Phase 8 — Claims

Deliver agreement-signing recovery activation, claims, jurisdiction checklist snapshots, submission/tracking/receipt, agency correspondence, decisions, payment status, and recovery pipeline.

Exit: idempotent signed transition creates/activates the configured recovery workflow; processor completes checklist, submits, records receipt/decision/payment, and all guarded transitions are audited.

## Phase 9 — Financials

Deliver agreement-derived projected compensation, expenses/approval, recovery payment, disbursements, immutable accounting snapshots, and reconciliation reports.

Exit: gross equals approved deductions plus distributions using the signed agreement inputs; mismatches fail; restricted roles are denied; corrections supersede rather than erase history.

## Phase 10 — AI assistance

After privacy/security review, deliver provider-neutral assistant interface, tenant/jurisdiction-scoped knowledge sources, cited case summaries, missing-information analysis, research/correspondence summaries, drafting, and verification labels.

Exit: adversarial tests show no cross-tenant retrieval or privileged actions; outputs cite sources and never claim legal entitlement/compliance approval.

## Phase 11 — CSV imports

Deliver private CSV upload, mapping, normalized preview, validation, duplicate candidates, explicit resolution, commit transaction, errors/report, and safe formula handling on export.

Exit: fictional county data previews and imports valid rows without overwriting; invalid/duplicate rows remain reviewable; retry is idempotent and audited.

## Phase 12 — White-label SaaS

Only after Pinnacle validates V1: tenant onboarding, organization creation, custom branding/domain/sender, tenant templates/workflows, billing, usage limits, self-service invitations, and platform administration isolated from tenant administration.

## Cross-phase quality gates

Every pull request must include:

1. A bounded domain change with migration and policy impact called out.
2. Unit tests for deterministic business policies.
3. PostgreSQL integration tests for tenant/RBAC/compliance behavior.
4. Playwright coverage for a major user workflow where applicable.
5. Strict typecheck, lint, tests, production build, migration reset, and generated-type drift checks.
6. Accessible loading, empty, validation, permission-denied, and unexpected-error states.
7. Audit and observability review without sensitive payloads.
8. Updated README/domain docs and no secrets or real claimant data.

Suggested CI commands once Phase 1 creates the project:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
supabase db reset
pnpm db:types:check
```

## Initial implementation sequence inside Phase 1

1. Scaffold project/tooling and environment schema.
2. Add local Supabase configuration and identity/tenant migrations.
3. Add RLS helper functions/policies and isolation test harness before feature data.
4. Implement session and active-membership resolution.
5. Seed permissions/system roles and central authorization service.
6. Build organization-aware shell and settings read/update command.
7. Append audit/outbox events for membership/setting changes.
8. Run the full quality/security gate and document deployment/restore procedures.

## Risk register and owner decisions

| Priority | Risk / decision | Required action |
| --- | --- | --- |
| Critical | Tenant/RLS implementation error | Approve defense-in-depth model; require policy matrix tests on every tenant table |
| Critical | Legal/compliance rule authority | Name publisher/reviewer and define authoritative official-source procedure before Phase 6 |
| High | Retention and sensitive files | Set classification, retention, legal hold, deletion, and role-access policy before Phase 7 |
| High | Platform/data residency | Confirm Supabase/Vercel regions, agreements, backups, and production access model before Phase 1 production deployment |
| High | Scope and workflow ambiguity | Conduct operator walkthrough at each phase; avoid building later-phase placeholders as working features |
| Medium | Multi-claim and estate complexity | Validate representative Riverside scenarios during schema review; keep claimant/claim relationships many-to-many capable |
| Medium | Serverless jobs/integrations | Adopt transactional outbox and idempotency before notifications/providers |
| Medium | Search vs encrypted PII | Decide threat/search needs before storing production contact data |
| Deferred | AI, automated outreach, scraping, e-sign, billing | Separate legal/security/product approval at their phase; no premature integration |

## V1 operational acceptance scenario

Using fictional data, an authorized operator imports/creates an opportunity; records APN, property, sale and proceeds; links/researches multiple possible claimants; documents contact compliance; performs and logs outreach; marks interest; generates and stores an immutable signed agreement; activates a claim; collects explicit checklist documents; submits and tracks agency correspondence; records approval/payment; produces reconciled accounting; and closes the case. The complete journey must retain rule versions, evidence, permissions, and audit history.

## Definition of done for this documentation handoff

- The five requested documents exist and agree on stack, boundaries, schema, tenancy, authorization, migrations, phases, and risks.
- No application feature has been implemented before architecture review.
- The proposal explicitly records open owner/legal/security decisions rather than guessing them.
