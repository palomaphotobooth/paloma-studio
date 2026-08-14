# Pinnacle Recovery OS — Security Model

## Security objectives

The system may hold sensitive identity, contact, legal, and financial records. Its primary objectives are tenant confidentiality, least-privilege access, trustworthy evidence/history, safe file handling, and recoverability. Security controls apply at the UI, application service, database, and storage layers; hiding a button is never authorization.

## Trust boundaries and threat model

Treat browsers, request parameters, imported files, webhooks, AI output, integration payloads, and tenant administrators as untrusted for the permissions they do not hold. Principal threats include:

- guessing another tenant's record or storage identifier;
- changing `organization_id`, role, claimant, or case identifiers in a direct request;
- using a legitimate role to access restricted financial/documents data;
- bypassing compliance by calling a server action or API directly;
- uploading malicious files or replacing a signed artifact;
- injection through forms, CSVs, document metadata, or future AI context;
- leaking PII through logs, analytics, errors, exports, previews, or non-production systems;
- credential/session theft, abusive authentication attempts, and forged webhooks;
- stale jurisdiction rules or unauthorized compliance overrides;
- accidental deletion, ransomware, or failed restoration.

## Identity and sessions

- Delegate password hashing, password reset tokens, email verification, and future MFA to Supabase Auth; never store plaintext passwords.
- Use secure, HTTP-only, same-site cookies and rotate/refresh sessions through supported server helpers. Validate the authenticated identity on every server operation.
- Require recent authentication/MFA when available for owner security actions, permanent deletion, exports, role changes, and secrets/integration configuration.
- Rate-limit login, reset, invitation, export, signed URL, import, and integration endpoints by suitable user/IP/tenant keys.
- Do not reveal whether an email exists in reset/invitation error responses.

## Tenant isolation

Tenant isolation has four independent controls:

1. **Context:** resolve the active organization from an authenticated, active membership. A URL slug/request field is only a selector, never proof of access.
2. **Application authorization:** every query/command declares a permission and passes tenant IDs explicitly.
3. **Relational integrity:** every tenant child carries `organization_id`; composite foreign keys prevent cross-tenant joins.
4. **RLS and grants:** authenticated roles receive no broad table bypass; policies require current organization membership and appropriate operation conditions.

Illustrative policy shape (actual helper functions must be security-reviewed and tested):

```sql
create policy cases_select_member on public.cases
for select to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = cases.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);
```

Writes should normally go through guarded application services/RPC functions that also verify permissions and domain policy. Ownership checks must occur before returning “not found” details to avoid identifier enumeration. Tenant isolation tests enumerate select/insert/update/delete, parent-child mismatches, search, exports, signed URLs, realtime (if enabled), and privileged functions.

## Roles and permission enforcement

- Initial role names map to stable permissions; avoid scattered role-name conditionals.
- Deny by default when permission metadata or tenant context is missing.
- Financial fields and sensitive document classes are filtered at query/serializer level, not redacted after reaching the client.
- Compliance blocks are domain authorization. The same policy runs for UI commands, APIs, background jobs, and bulk operations.
- Overrides require explicit permission, a reason, the original blocking rule/version, actor, timestamp, and (where configured) a second approver.
- Service-role database credentials are forbidden in browser bundles and normal user request paths. Privileged workers use narrowly scoped functions and explicit tenant parameters with audit correlation.

## Database and audit security

- Enable RLS on every exposed tenant table before granting access; new tables fail CI if they lack an ownership classification and policy tests.
- Revoke permissive defaults. Pin function `search_path`; prefer `security invoker`; review every `security definer` function and restrict execute grants.
- Parameterize SQL and validate commands with Zod. Escape spreadsheet formula prefixes in CSV exports.
- `audit_logs` are append-only to application roles. Record actor, organization, action, object, correlation ID, before/after field changes, time, and appropriate network metadata.
- Audit stage changes, agreement generation/signing, compliance results/overrides, document deletion, contact restrictions, claim submission/status, payments, exports, and permission changes.
- Redact credentials, reset tokens, raw files, unnecessary contact values, and sensitive full payloads from application/audit logs.

## File security

- Buckets are private. Object keys use organization ID and cryptographically random identifiers; filenames are metadata, never paths.
- Authorize tenant, permission, document class, and record lifecycle before issuing short-lived signed upload/download URLs.
- Enforce allowlisted content types, maximum size, extension/content consistency, checksum, and malware scanning before a file becomes available. Store uploads in quarantine until checks complete.
- Set `Content-Disposition: attachment` and safe content headers for risky formats; do not render arbitrary HTML/SVG inline.
- Signed agreement/document versions are immutable and checksum-addressed. Supersession appends a version and audit event.
- Storage object deletion is asynchronous only after authorized database lifecycle change and retention/legal-hold checks.

## Application and API security

- Prefer same-origin server actions with framework CSRF protections; route handlers validate origin/CSRF tokens as appropriate. Never use GET for mutation.
- Use restrictive Content Security Policy, frame protection, referrer policy, permissions policy, HSTS, and secure cookies.
- Encode untrusted output and sanitize approved rich-text fields with an allowlist. Do not interpolate user input into HTML, SQL, object paths, or shell commands.
- Webhooks require provider signature and timestamp verification, replay protection/idempotency, and schema validation before processing.
- Return safe errors to users and correlation IDs for diagnosis; do not expose SQL, secrets, internal paths, or other tenants' existence.
- Apply pagination and bounded query/import limits to resist denial-of-service and accidental bulk exposure.

## Privacy and sensitive data

- Collect only data necessary for a documented recovery workflow. Do not collect unnecessary SSNs or full bank details.
- Classify fields/documents (ordinary business, confidential PII, restricted legal/financial). Map permissions, logging, export, and retention to class.
- Encrypt transport and managed storage. Evaluate application-level encryption for high-risk contact/identifier fields after search requirements are defined.
- Production data must not be copied into local/preview environments. Demo data is fictional.
- Establish data-subject, legal-hold, retention, archival, export, and permanent-deletion procedures with counsel before production onboarding.

## Rule, AI, and automation safety

- Only authorized reviewers publish jurisdiction rule versions. Store official citations, effective periods, approval, and review dates.
- Cases pin rule versions. Missing rule or anchor data produces “calculation unavailable,” not a guessed deadline.
- AI is disabled until Phase 10 review. Future retrieval is tenant- and jurisdiction-scoped; provider retention/training settings and data-processing terms require approval.
- AI cannot call privileged submission, payment, compliance approval, or entitlement tools. Output is labeled advisory, cited, and unverified.
- Automated email/SMS/calling and scraping remain disabled until separate legal, provider, consent, and abuse-control reviews.

## Secrets and environments

- Keep secrets in managed environment stores, never Git, client-exposed variables, logs, screenshots, or seed files.
- Separate local, preview, staging, and production projects/credentials. Preview deployments use synthetic data and least-privileged resources.
- Rotate keys on schedule and immediately after suspected exposure. Inventory secret owner, purpose, scope, and last rotation.
- Restrict production database/storage dashboards with MFA and least privilege. Review access periodically and promptly revoke departed users.

## Availability, backup, and incident response

- Configure managed database point-in-time recovery and storage versioning/backup appropriate to retention obligations.
- Define recovery point and recovery time objectives before launch. Perform and record restoration drills; a backup is not accepted until restore is tested.
- Monitor elevated auth failures, denied cross-tenant attempts, bulk exports/downloads, role changes, compliance overrides, signed artifact changes, and worker failures.
- Maintain an incident runbook: triage, contain credentials/sessions, preserve evidence, assess tenants/data, notify required parties, recover, and document corrective action.
- Use transactional outbox retries and idempotency so notification/provider outages do not corrupt core case state.

## Required security tests before production

1. Organization A is denied Organization B rows for every CRUD operation and relationship mutation.
2. Guessed case/document IDs and storage keys do not reveal existence or signed content.
3. Each role's allowed/denied permission matrix passes through direct server calls.
4. A compliance-blocked action fails through UI, server action, route handler, bulk operation, and worker.
5. Signed agreements and published rule versions reject update/delete.
6. Import/upload limits, malicious metadata, type spoofing, and spreadsheet formulas are safely handled.
7. Session expiry/revocation, reset, invitation, and future MFA flows behave correctly.
8. Backup restoration and audit-event completeness are verified.

## Security review gates

- **Architecture approval:** tenancy, auth provider, residency, roles, retention ownership.
- **Phase 1 exit:** RLS policy matrix, role enforcement, audit baseline, environment/secrets review.
- **Before files:** classification, malware scanning, signed URL and retention design.
- **Before outreach:** current compliance policy, manual evidence, override governance.
- **Before production:** threat-model update, external assessment, restore exercise, incident contacts.
- **Before AI/integrations:** provider privacy/security review and adversarial authorization tests.
