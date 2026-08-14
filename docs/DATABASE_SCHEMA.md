# Pinnacle Recovery OS — Database Schema Proposal

## Design conventions

This is a logical schema for architecture review, not a final migration. PostgreSQL is the system of record.

- Primary keys are UUIDs (prefer time-sortable UUIDs when supported); timestamps are `timestamptz` in UTC; money is integer minor units plus ISO currency.
- Every tenant-owned table has non-null `organization_id`, timestamps, and usually `archived_at`/`deleted_at`.
- Tenant parent references use composite foreign keys such as `(organization_id, case_id)` → `cases(organization_id, id)`. Each referenced parent has a matching unique constraint.
- Enumerations with stable technical meaning may use PostgreSQL enums/check constraints. Configurable stages/types use reference tables.
- JSONB is limited to audit snapshots, provider payloads, validated rule parameters, import source rows, and display metadata where columns would not be meaningful.
- Business timestamps (`sale_date`, `document_date`) remain distinct from record timestamps (`created_at`).
- User-facing sequence numbers are allocated transactionally per organization/year/prefix; they are not primary keys.

## Identity and tenancy

| Table | Purpose and principal fields |
| --- | --- |
| `user_profiles` | Application profile keyed to auth user: `id`, display name, locale, last active organization; no password data |
| `organizations` | Tenant: slug, legal/display name, logo key, accent, address/contact, security settings, status |
| `organization_memberships` | `organization_id`, `user_id`, `role_id`, membership status, invited/accepted timestamps; unique active pair |
| `roles` | Tenant-null system roles or tenant custom roles: name, description, system key |
| `permissions` | Stable permission key and description |
| `role_permissions` | Role-to-permission mapping |
| `case_number_sequences` | Organization, prefix, year, last allocated integer |

`organizations` is itself the tenant root and does not contain an `organization_id`. Authentication users are global identities; all business access is through membership. This is the intentional exception to the general tenant-column rule.

## Cases and property

| Table | Purpose and principal fields |
| --- | --- |
| `cases` | Case number, acquisition stage, recovery stage, jurisdiction/rule version, priority, deadline state, next action, owner/assignee, lifecycle timestamps |
| `case_stage_history` | Pipeline type, from/to stage, reason, actor, changed timestamp |
| `properties` | Case, APN, original/normalized address, city/state/postal/county, former-owner display snapshot |
| `tax_sales` | Case/property, sale type/date, deed recordation date, sale price, tax obligation |
| `excess_proceeds` | Case/tax sale, amount, currency, status, verification actor/date |
| `source_records` | Case, optional target type/id, source type/title/URL, retrieved/verified timestamps, source document |
| `interests` | Case, claimant/entity holder references, type, recording data, balance, priority, status, source, verification |
| `case_deadlines` | Case, type, due date, risk, pinned rule version, anchor type/date, explanation, calculated/manual provenance |

One case may support multiple properties/sales/proceeds records if later needed, even when the initial workflow normally creates one. A designated primary relationship can be stored explicitly rather than inferred.

## Parties and claimant relationships

| Table | Purpose and principal fields |
| --- | --- |
| `people` | Names, known birth/death dates, deceased flag, notes; no unnecessary government identifiers |
| `person_addresses` | Person, address, type, dates, source, confidence, verified/contactable flags |
| `person_phones` | Person, normalized/encrypted display value as policy requires, type, source, confidence, verification |
| `person_emails` | Person, normalized value, type, source, confidence, verification |
| `person_social_profiles` | Person, platform, handle/URL, source, confidence, verification |
| `entities` | Claimant-side legal entity: name, entity type, state, registration, status |
| `entity_representatives` | Entity, person, authority status, effective dates and supporting document |
| `case_claimants` | Case plus exactly one of person/entity, claimant type, owner relationship, potential/verified interest, authority, confidence, status |
| `family_relationships` | Case, from-person, to-person, relationship type, confidence, verified state, evidence; never an heirship determination |

A check constraint enforces exactly one claimant subject (`person_id XOR entity_id`). Claims and communications reference `case_claimants`, preserving case-specific authority and interest.

## Research, tasks, and outreach

| Table | Purpose and principal fields |
| --- | --- |
| `research_findings` | Case, optional subject, research type, finding, source fields, date found, numeric confidence, verified actor/date, researcher |
| `tasks` | Case, optional claimant, title/type, assignee, due date, priority, status, snooze, completion notes, creator |
| `task_priority_components` | Task/case score contribution, reason key, signed points, policy version |
| `contact_compliance_checks` | Claimant/contact record, method, checked time/by, state, source/evidence, notes, expiry if applicable |
| `communications` | Case/claimant, contact method, channel, direction, occurred time, template version, summary/response/outcome, actor, follow-up |
| `communication_templates` | Tenant, name/channel, status and current version pointer |
| `communication_template_versions` | Immutable template content, version, jurisdiction/effective dates, approval metadata |
| `outreach_sequences` | Tenant, name, status, jurisdiction/application filters |
| `outreach_sequence_steps` | Sequence, day offset, channel, task template, ordering |
| `case_sequence_enrollments` | Case/claimant, sequence version, start/status; generates tasks only in MVP |

## Jurisdictions, rules, and compliance

| Table | Purpose and principal fields |
| --- | --- |
| `jurisdictions` | Hierarchical country/state/county identity and official name/code |
| `jurisdiction_rules` | Stable rule identity, category, jurisdiction, title, lifecycle status |
| `rule_versions` | Rule, version, effective start/end, published/reviewed metadata, official citation/source, immutable parameters |
| `rule_requirements` | Version, requirement key/title, action blocked, severity, ordering, applicability parameters |
| `case_rule_assignments` | Case, rule version, relevant date/type, assigned reason/time; immutable historical pin |
| `case_compliance_items` | Case, assignment/requirement, requirement snapshot, status, evidence, completed/reviewed actor/date |
| `compliance_overrides` | Item/action, previous result, reason, actor, approval metadata and expiry |

Database exclusion constraints should prevent overlapping published effective periods for the same rule/applicability scope. Publishing creates immutable rows; drafts may be edited until publication.

## Agreements and documents

| Table | Purpose and principal fields |
| --- | --- |
| `document_types` | Tenant-null system types or tenant-specific types, sensitivity class, retention behavior |
| `documents` | Case, optional claimant, type, current version, title, lifecycle/verification state |
| `document_versions` | Document, immutable storage key, original filename, media type, bytes, checksum, source/document date, uploader, AI-review flag |
| `agreement_templates` | Tenant, jurisdiction, name, status |
| `agreement_template_versions` | Immutable content/render schema, effective dates, version, approval |
| `agreements` | Case/claimant, template/version, status, compensation configuration, effective/expiration/signature data |
| `agreement_versions` | Rendered document version, status, generated/signed document version, supersedes, signature/provider metadata |

Triggers and grants deny update/delete of published template versions, signed agreement versions, and finalized document versions. Corrections append and supersede.

## Claims and agency work

| Table | Purpose and principal fields |
| --- | --- |
| `claims` | Case/claimant, agency, type/status, requested/submitted/approved minor amounts, currency, submission/receipt/decision/payment fields |
| `claim_checklist_templates` | Tenant/jurisdiction/rule version, name/status |
| `claim_checklist_template_items` | Template, requirement key/title, required flag/order/blocking action |
| `claim_checklist_items` | Claim, immutable requirement snapshot, status, evidence document, completed/reviewed data |
| `agency_correspondence` | Claim, direction/channel, occurred/received date, summary, agency reference, document |

Agreement signing creates a claim only where the configured workflow says to do so; the transition is idempotent and transactional.

## Financials

| Table | Purpose and principal fields |
| --- | --- |
| `expenses` | Case, category, description, amount/currency, date/vendor, receipt, reimbursable and approval state |
| `payments` | Case/claim, type, amount/currency, expected/received date, status, external reference |
| `disbursements` | Payment/case, recipient claimant/entity/organization, category, amount/currency, status/date |
| `accounting_snapshots` | Case, approved recovery, expense totals, net recovery, distributions, agreement version, reconciled actor/time |

Amounts use integer minor units and currency equality is required for reconciliation. Accounting snapshots preserve the exact agreement and inputs used; their totals are checked transactionally.

## Operations, audit, and ingestion

| Table | Purpose and principal fields |
| --- | --- |
| `activity_logs` | Tenant-facing case timeline event and safe display metadata |
| `audit_logs` | Append-only actor, action, entity/id, request correlation, old/new JSONB, timestamp, optional IP/user agent |
| `domain_events` | Transactional outbox event, aggregate, payload, attempts and delivery state |
| `notifications` | Recipient membership, type, case/task, read/dismissed timestamps |
| `data_sources` | Tenant/jurisdiction, type, official URL, permission/automation status, last check/success |
| `imports` | Source/file, status, mapping, counts, creator and committed timestamp |
| `import_rows` | Import, row number, raw normalized data, fingerprint, validation state/errors, resolved case |
| `knowledge_sources` | Tenant/jurisdiction, source/citation, effective/expiration dates, content type, approval |
| `knowledge_chunks` | Source, content, locator and embedding reference (added only in AI phase) |

Audit logs must be partitionable by time/organization as volume grows. Sensitive values are redacted or represented as field-level changes; secrets and complete file contents never enter audit JSON.

## Essential constraints and indexes

- Unique: organization slug; active membership `(organization_id, user_id)`; case `(organization_id, case_number)`; normalized APN/source fingerprints where domain rules permit.
- Partial indexes exclude soft-deleted rows from active uniqueness and common views.
- Index all tenant access paths with `organization_id` first, including `(organization_id, case_id)`, stage, due date, status, normalized search values, and foreign keys.
- Full-text/trigram indexes power tenant-scoped global search initially.
- Checks: exactly one claimant subject; non-negative monetary values where appropriate; valid confidence 0–100; effective end after start; signed timestamp required for signed status.
- Deferrable transaction checks or a guarded SQL function enforce financial reconciliation and multi-row transitions.

## Migration strategy

1. Supabase CLI SQL migrations are the authoritative, immutable history under `supabase/migrations`.
2. Each feature migration includes tables, constraints, indexes, grants, RLS policies, comments, and rollback/forward-fix notes in its review description.
3. Apply migrations to disposable local PostgreSQL and run policy/integration tests in CI, then preview/staging, take/verify backup for risky production changes, and finally deploy production.
4. Use expand/migrate/contract for destructive changes: add compatible structures, backfill in resumable batches, switch code, verify, then remove in a later release.
5. Never edit an applied migration. Correct it with a new migration.
6. Seed scripts contain stable reference data and clearly fictional demo records; production seeding is separate and idempotent.
7. Generate TypeScript database types in CI and fail on uncommitted drift.

## Open schema decisions

- Retention and encryption/search policy for phone/email/contact values.
- Whether a case can contain multiple concurrent recovery claims in the first operational release (schema supports it).
- Jurisdiction inheritance rules (state defaults plus county overrides) and approval workflow.
- Required precision/currencies beyond USD before Phase 9.
- Audit retention, legal hold, and export requirements.
