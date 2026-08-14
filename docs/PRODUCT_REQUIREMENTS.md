# Pinnacle Recovery OS — Product Requirements

## Document purpose

This document is the implementation-oriented product baseline for Pinnacle Recovery OS (future white-label name: RecoveryOS). It distills the approved product brief into testable outcomes. It is not legal guidance and does not authorize a recovery practice in any jurisdiction.

## Product outcome

Pinnacle Recovery OS is a secure, multi-tenant operating system for surplus-funds recovery. Its primary record is a **case**, not a lead. It should tell an operator what happened, what matters, and what to do next across this lifecycle:

`DISCOVER → QUALIFY → RESEARCH → LOCATE → CONTACT → SIGN → PREPARE CLAIM → SUBMIT → TRACK → APPROVE → PAY → CLOSE`

The first tenant is Pinnacle Recovery Group and the first configured jurisdiction is Riverside County, California. Neither is to be hard-coded into reusable product logic or presentation components.

## Product principles

1. **Case first:** property, sale, proceeds, claimants, interests, research, communications, agreements, documents, compliance, claims, tasks, deadlines, and money are related records around a case.
2. **Action oriented:** deterministic task and risk rules should prioritize the next safe action rather than merely display stored records.
3. **Safety before automation:** compliance blocks are enforced in the application service and database boundary, not only hidden in the UI.
4. **Explicit evidence:** readiness, deadlines, priority, and financial totals are explainable and derived from stored inputs.
5. **Human verification:** uncertain research and AI-extracted data remain unverified until a user confirms them.
6. **Tenant ownership:** every tenant-owned row carries `organization_id`; cross-tenant access is denied by both server authorization and PostgreSQL row-level security (RLS).
7. **Original, current content:** legal rules require authoritative, current sources and versioned effective dates. The product must not reproduce legacy course scripts or agreements.
8. **Data minimization:** do not collect unnecessary SSNs or complete financial account numbers.

## Personas and initial roles

| Role | Primary capabilities | Explicit restrictions |
| --- | --- | --- |
| Owner | Full tenant administration and operations | None within the tenant |
| Admin | Most operations and configuration | Owner-only destructive/security actions |
| Researcher | Cases, people, entities, and research | Sensitive financial settings/actions |
| Outreach | Approved contact methods and communication logs | Blocked outreach and restricted documents |
| Claim Processor | Signed cases, claim documents, submissions, correspondence | Tenant/user administration |
| Read Only | Authorized views | Mutations |

Authorization is permission-based internally so custom roles can later use capabilities such as `case.read`, `research.write`, `outreach.send`, `agreement.generate`, `claim.submit`, `financial.read`, and `users.manage`.

## Core domain requirements

### Cases and pipelines

- Generate organization-scoped case numbers, initially in a configurable pattern such as `RIV-2026-0001`.
- Maintain separate acquisition and recovery stages; never collapse them into a single pipeline.
- Acquisition stages: New, Needs Research, Researching, Qualified, Skip Trace Needed, Claimant Located, Compliance Review, Ready to Contact, Contacted, Follow Up, Interested, Agreement Sent, Agreement Signed, Not Interested, Dead.
- Recovery stages: Client Onboarding, Documents Needed, Claim Research, Claim Ready, Submitted, Agency Review, Additional Documents Requested, Pending Decision, Approved, Payment Pending, Paid, Closed, Denied, Disputed.
- Signing an agreement activates a recovery workflow transactionally.
- Stage changes append immutable history and audit records.
- Support archived and soft-deleted business records.

### Case workspace

The case header presents case number, former owner, jurisdiction, APN, property, tax sale, proceeds, claim deadline and risk, claimant/owner status, research confidence, superior-interest count, stage, and next action. Tabs are Overview, Property, Claimants, Interests, Research, Outreach, Documents, Compliance, Claim, Tasks, Financials, and Activity.

Overview aggregates explicit checklist-based claim readiness, compliance readiness, deadline details and source, tasks, missing documents, recent activity, and financial state. AI assistance is advisory and clearly labeled.

### People, claimants, and entities

- A person is tenant-owned and reusable across cases; claimant is a relationship between a case and either a person or an entity.
- Store phones, emails, addresses, and social profiles as child records with provenance and verification state.
- Support former owners, heirs, estate representatives, trustees, entity representatives, lienholders, judgment creditors, and other claimant relationships.
- Represent family relationships as directed, structured edges with confidence, evidence, location/contact state, and authority status. Do not infer or declare legal heirship.
- Keep claimant entities distinct from tenant organizations.

### Property, proceeds, and interests

- Store APN, standardized and original address, county, sale/recordation dates, sale price, tax obligation, excess proceeds, verification date, and multiple sources.
- Store interests independently with type, holder, recording data, estimated balance, priority position, status, source, notes, and verification state.
- Never treat a potential interest as verified without a user action and supporting evidence.

### Research and outreach

- Research findings are append-oriented records with subject, type, finding, source, date, confidence, verification, researcher, and notes.
- Communications capture claimant, channel, direction, timestamp, template version, summary, response, outcome, next follow-up, and actor.
- Outreach sequences generate recommended tasks in MVP; they do not automatically call, email, or text.
- Each contact method has a manual compliance check state: Not Checked, Approved, Blocked, or Manual Review, with evidence and reviewer.
- A server-side policy denies outreach when required contact compliance is incomplete or blocked.

### Jurisdictions, compliance, and deadlines

- Jurisdictions contain versioned rules with non-overlapping effective periods, requirements, authoritative citations, and publication/review metadata.
- A case pins the applicable rule version; later edits create a new version and do not rewrite historical decisions.
- Case compliance items snapshot the applicable requirement and record completion, evidence, actor, and override reason.
- Rules can hard-block named actions such as first outreach, agreement generation, or claim submission.
- Deadline calculations run only when the rule, anchor type, and anchor value are known. Store the resulting date, rule version, anchor, calculation explanation, and calculation timestamp.
- Surface Safe, Watch, High, Critical, and Expired risk plus 90/60/30/14/7-day views.

### Agreements and documents

- Templates and rendered agreements are versioned by tenant and jurisdiction.
- A signed agreement version is immutable; correction produces a new superseding version without replacing history.
- Files are private, organization-owned objects addressed by non-guessable keys. Access uses short-lived signed URLs after authorization.
- Store type, claimant (optional), uploader, source, document date, verification, checksum, and notes.
- AI-derived metadata is visibly marked **AI extracted — review required** until confirmed.
- Future analysis is named **Document Review Assistance**, never legal validation.

### Claims, tasks, and work mode

- Claims track claimant, agency, type, requested/submitted/approved amounts, submission and receipt data, status, decision, denial, and payment dates.
- Checklist templates are jurisdiction/version-specific; case checklist items are explicit snapshots.
- Tasks support case, optional claimant, assignment, due date, priority, type, status, snooze, and completion notes.
- Work Mode serves one authorized actionable task at a time and advances after complete, snooze, or skip.
- A deterministic priority score records component reasons; no unexplained AI score is shown.

### Financials

- Keep potential, projected, approved, and paid amounts semantically distinct.
- Compensation derives from the applicable signed agreement configuration; no default percentage is permitted.
- Track itemized expenses, payments, and disbursements.
- Final accounting must reconcile gross recovery to approved deductions and distributions, with all changes audited.

### Imports, search, reporting, and notifications

- CSV import supports upload, mapping, preview, validation, duplicate detection, row errors, and an explicit commit step; it never silently overwrites.
- Data sources record provenance and manual/automated status without assuming scraping permission.
- Global search covers case number, APN, names, addresses, phones, emails, entities, and county, always tenant-scoped.
- MVP reports cover pipeline, recovery values, funnel conversion, elapsed times, outreach effectiveness, and financial outcomes.
- In-app notifications cover deadlines, assignments, staleness, agreement signing, claim responses, missing documents, and compliance blocks.

## AI boundaries

An AI provider interface may later summarize, organize, draft, identify gaps, suggest actions, and flag inconsistencies. AI cannot establish entitlement or heirship, give legal advice, approve compliance, invent facts, or submit a claim. Knowledge items retain jurisdiction, source, effective/expiration date, content type, and citation. Important AI outputs must cite the internal source and carry a verification warning.

## MVP success journey

V1 succeeds when an authorized operator can create/import a Riverside opportunity; record property, proceeds, people, research, and compliance; perform approved outreach; version and sign an agreement; activate and submit a claim with documents; track agency actions, approval, and payment; reconcile final accounting; and close the case with a complete audit trail.

## Non-functional acceptance criteria

- TypeScript is strict; inputs are validated at every trust boundary.
- Organization A cannot access Organization B data by UI, direct request, guessed identifier, storage key, or database query under an application session.
- Permissions and compliance blocks remain effective on direct server/API requests.
- Signed artifacts and historical rule versions cannot be mutated through ordinary application paths.
- Sensitive actions are rate-limited and auditable.
- Desktop is the initial priority, with usable tablet/mobile layouts and accessible contrast and keyboard behavior.
- Demo/seed records are fictional and development tools cannot be enabled in production.

## Out of scope before architecture approval

The current handoff produces documentation only. It does not implement Phase 1, legal rule content, automated outreach, scraping, e-signature, AI execution, billing, or the complete application.
