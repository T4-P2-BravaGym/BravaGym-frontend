# App flow navigation fixes

Scope: preserve internal query/hash through login; send the unfinished admin landing
page to payments; load every page for weekly schedules and booking maps.

Acceptance: Stripe return and selected trainer survive login; admin has an operational
landing page; entries beyond 50 bookings / 100 sessions remain visible. Abort and API
errors must propagate. The homepage teaser remains deliberately limited.

No backend contract changes. No merges; human review required.
