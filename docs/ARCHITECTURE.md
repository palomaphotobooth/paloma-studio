# Pinnacle Recovery OS — Architecture

## Status

**Proposed for review.** Implementation begins only after this architecture and its security assumptions are approved.

## Final stack proposal

| Layer | Choice | Rationale |
| --- | --- | --- |
| Web | Next.js App Router, React, TypeScript strict | One deployable application with server-rendered UI and explicit server boundaries |
| UI | Tailwind CSS and shadcn/ui primitives | Accessible, composable tenant-themed components without brand coupling |
| Validation | Zod | Shared shape validation while domain authorization stays server-only |
| Database | Managed Supabase PostgreSQL | Transactions, constraints, indexing, RLS, backups, and mature local tooling |
| Data access | Supabase server client for user-context reads; focused SQL/RPC functions for guarded workflows | Preserves RLS identity and keeps complex transitions transactional |
| Authentication | Supabase Auth | Email/password and reset now; MFA-compatible identity later |
| Storage | Private Supabase Storage buckets | RLS-backed object ownership and short-lived signed access |
| Jobs | Durable job adapter, initially a database outbox plus a Vercel-compatible worker/cron | Avoids coupling domain events to request completion |
| Observability | Structured logs, error reporting adapter, database audit events | Tenant-safe operational insight without logging sensitive payloads |
| Testing | Vitest, Testing Library, Playwright, PostgreSQL integration suite | Covers deterministic rules, UI behavior, tenant isolation, and workflows |
| Deployment | Vercel plus managed Supabase project per environment | Separate preview/staging/production secrets and data |

Exact package versions will be pinned by the Phase 1 lockfile and reviewed through dependency updates. Business logic must not depend directly on Supabase, Vercel, an e-sign provider, or an AI provider; adapters implement small application-owned interfaces.

## System boundaries

```text
Browser
  │ HTTPS / secure session cookies
  ▼
Next.js application
  ├─ Server Components (read models)
  ├─ Server Actions / Route Handlers (validated commands)
  ├─ Application services (authorization + transactions)
  ├─ Domain policies (compliance, priority, deadlines, accounting)
  └─ Adapters (database, storage, jobs, AI, e-sign)
          │
          ├──────── PostgreSQL + RLS
          └──────── Private object storage + RLS
```

Client components never receive service credentials and never make privileged database calls. Mutations follow: authenticate → resolve active membership → validate → authorize permission → load tenant-owned records → evaluate domain/compliance policy → transact state, history, audit, and outbox → return a minimal result.

## Tenancy model

- `organizations` are security tenants. Claimant companies/trusts/estates live in `entities`, not `organizations`.
- A user may belong to multiple organizations through `organization_memberships`; every request has one explicit active organization.
- Tenant-owned primary and child tables include a non-null `organization_id`. Composite foreign keys `(organization_id, parent_id)` prevent cross-tenant relationships even if application code is defective.
- RLS reads organization membership from the authenticated database identity. Service-role credentials are restricted to isolated administrative workers and are never used for normal user requests.
- An application authorization layer enforces permissions and resource conditions in addition to RLS. RLS is the containment layer, not the entire authorization design.
- Tenant context is never accepted as sufficient merely because it appears in a request body. It is checked against the authenticated membership.

Detailed controls and policy templates are in [SECURITY.md](./SECURITY.md).

## Authorization model

RBAC is implemented as permissions assigned to roles and a role assigned to each membership. Initial system roles are seeded and immutable in meaning; future tenant custom roles use the same tables.

```text
user ─ membership ─ organization
             └──── role ─ role_permissions ─ permission
```

Application services call a centralized `authorize(context, permission, resource?)`. Resource rules supplement permission checks, for example an Outreach user may read only allowed document classes. Compliance authorization is separate: a user may hold `outreach.send` while the case policy still blocks the action. Overrides require a dedicated permission, reason, evidence where required, and audit event.

## Domain modules

1. **Identity and tenancy** — auth profile, organizations, memberships, roles, permissions.
2. **Cases** — numbering, two pipelines, property/sale/proceeds, stages, activity.
3. **Parties** — people, contact points, entities, claimant and family relationships.
4. **Research and interests** — sourced findings, recorded interests, confidence and verification.
5. **Tasks and work queue** — deterministic ranking, assignments, snooze, completion.
6. **Outreach** — compliance-aware communications, templates, sequence-generated tasks.
7. **Rules and deadlines** — jurisdiction rules, immutable versions, requirements, pinned calculations.
8. **Documents and agreements** — metadata, private object lifecycle, immutable signed artifacts.
9. **Claims** — recovery pipeline, explicit checklists, submissions and correspondence.
10. **Financials** — expenses, payments, agreement-derived disbursements, reconciliation.
11. **Audit and notifications** — append-only evidence, domain events, user attention.
12. **Imports and data sources** — staged ingestion and provenance.
13. **AI knowledge and assistance** — provider-neutral, advisory, cited, human-reviewed.

Modules expose application services rather than sharing arbitrary repository calls. Database transactions may span modules for invariants such as agreement-signing → recovery activation → checklist creation → audit/outbox append.

## Folder structure

```text
src/
  app/
    (public)/                 # login/reset and public error states
    (app)/[organizationSlug]/ # authenticated tenant routes
    api/                      # integrations/webhooks only where routes are needed
  components/
    ui/                       # shadcn primitives
    shell/                    # sidebar, header, global search
  features/
    cases/
      components/
      schemas/
      server/                 # commands, queries, authorization
    identity/ parties/ research/ tasks/ outreach/ rules/
    documents/ agreements/ claims/ financials/ imports/ ai/
  domain/
    policies/                 # pure compliance/deadline/priority/accounting rules
    events/
  server/
    auth/ db/ storage/ jobs/ audit/ observability/
  lib/                        # small framework-neutral utilities
supabase/
  migrations/                # ordered SQL; schema, functions, RLS, grants
  seed.sql                    # fictional local data only
tests/
  unit/ integration/ e2e/
docs/
```

Avoid a generic global `services` directory and giant page components. Feature folders own UI and application operations; cross-feature invariants live in named domain policies/application workflows.

## Command and query design

- **Queries** are organization-scoped read models and may use server components. Select only fields the role may see.
- **Commands** use server actions for same-origin form/UI operations and route handlers for stable integration endpoints or webhooks.
- Public identifiers are UUIDs/ULIDs; human case numbers are display identifiers and unique only within an organization.
- Commands that can be retried (imports, webhooks, submissions, agreement callbacks) require idempotency keys.
- Concurrency-sensitive records use a version or `updated_at` precondition. Financial and signed-document transitions use database locks/constraints as needed.
- Domain events are inserted into an outbox in the same transaction; workers deliver notifications or non-critical integrations later.

## Deterministic policy engines

Compliance, deadlines, priority, readiness, and accounting are pure functions over explicit typed inputs. Their result contains both a value and machine-readable reasons. Policy versions or input snapshots are retained where historical reproducibility matters.

No statutory deadline is produced without a pinned rule version and known anchor. No outreach/claim action occurs by relying on a UI state. No financial percentage is supplied as a fallback.

## Storage architecture

The database stores document metadata and a storage object key shaped like `organization-id/random-id/version-id`; it does not store a public URL. Upload flow issues a constrained signed upload after authorization, then finalizes metadata after size/type/checksum verification. Download flow re-authorizes the current membership and document class before issuing a short-lived URL. Signed agreement rows and their object versions are immutable; deletion is a separately audited lifecycle action.

## Integration abstractions

Define application-owned interfaces such as `ObjectStore`, `SignatureProvider`, `AssistantProvider`, and `JobPublisher`. Provider payloads are normalized at adapter boundaries and raw webhook bodies are retained only when necessary, encrypted/retained under policy, and never treated as trusted without signature verification.

## Architectural risks and mitigations

| Risk | Consequence | Mitigation / decision gate |
| --- | --- | --- |
| RLS policy drift or missing policies | Cross-tenant exposure | Deny-by-default migrations, composite tenant FKs, policy tests for every tenant table, schema lint in CI |
| Elevated database client used in request path | RLS bypass | Keep service key out of web runtime where possible; explicit worker package and reviewed privileged functions |
| Legal rule ambiguity or stale sources | Incorrect deadline/compliance behavior | Official citations, reviewer workflow, effective periods, case pinning, no calculation on missing inputs |
| Mutable signed files or rules | Loss of evidentiary history | Immutability triggers/permissions, checksums, append-only versions, supersession links |
| Duplicate people/cases during imports | Fragmented or overwritten work | Staging tables, tenant-scoped fingerprints, preview, explicit merge tools, no automatic overwrite |
| Multi-claimant/multi-claim complexity | Incorrect one-to-one assumptions | Claimant join model; claims point to claimant relationships; avoid case-level “the claimant” fields |
| Serverless transaction/job behavior | Half-completed workflows | Short database transactions, transactional outbox, idempotent workers and webhooks |
| Search leaks restricted data | PII/tenant disclosure | Tenant-filtered indexed search in PostgreSQL; permission-aware projections; no third-party index initially |
| Soft deletion and unique constraints | Identifiers blocked or accidentally reused | Partial unique indexes and explicit archival semantics per entity |
| AI hallucination/prompt data leakage | Unsafe advice or tenant leakage | Phase 10 only, tenant-scoped retrieval, provider data controls, citations, advisory labeling, no privileged tools |
| Scope breadth | Slow delivery and fragile system | Phase gates, vertical slices, acceptance tests, defer integrations/AI/automation |

## Decisions requiring owner review

1. Confirm Supabase Auth/Database/Storage as the initial managed platform and identify data residency requirements.
2. Define who may publish legal rule versions and approve compliance overrides.
3. Approve retention periods, legal holds, and permanent-deletion policy before storing production documents.
4. Define sensitive document classifications and role visibility.
5. Supply verified organization branding and fictional seed content; do not use production claimant data in non-production environments.
