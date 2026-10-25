# WA Convo Flow Builder Enhancement Plan

## Goal
Replace the one-time generic seed set with editable, configurable flow templates and extend the flow runtime/UI for the requested automation capabilities without committing real secrets or business-specific credentials.

## Current baseline
The project already has React Flow canvas editing, keyword/exact/regex triggers, AI replies, conditional nodes, wait-for-reply state, tags, HTTP requests, test execution, import/export, execution logs, and enable/disable controls.

## Implementation approach
1. Add flow lifecycle and routing metadata: draft/published/paused status, priority, trigger deduplication, business-hours configuration, and execution metadata.
2. Add reusable runtime nodes for buttons/menu messages, lead fields, human handoff, follow-up scheduling, broadcast/opt-in checks, order updates, and call-related best-effort messaging with provider capability guards.
3. Add API endpoints for publish/pause, analytics summary, execution logs, flow templates, and safe replacement of built-in seed data.
4. Replace the old ten built-ins with editable templates covering welcome/menu, AI language reply, services, lead collection, human handoff, business hours, VIP/CRM tagging, follow-up, order/status, and opt-in broadcast.
5. Extend the dashboard with node palette/configuration, lifecycle controls, priority, template creation, analytics/log views, import/export, and responsive builder layout.
6. Validate backend compilation, dashboard build, flow migrations, and API behavior locally before any GitHub push or Hostinger deployment.

## Product constraints
- Call reject/forwarding remains capability-checked and best-effort because WhatsApp provider support varies.
- AI, CRM, broadcast, and order behavior remain configurable and require the relevant provider/data settings.
- No real API keys, passwords, phone numbers, or private business data are added to source control.
