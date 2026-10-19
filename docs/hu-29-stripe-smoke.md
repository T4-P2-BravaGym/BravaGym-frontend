# HU-29 Stripe checkout verification — 2026-10-19

Frontend branch: `feature/hu-29-stripe-checkout-fe`, based on `dev`.
Backend dependency: [PR 265](https://github.com/T4-P2-BravaGym/BravaGym-backend/pull/265).
[Spec](https://github.com/T4-P2-BravaGym/BravaGym-backend/blob/feature/hu-29-stripe-checkout/specs/HU-29-stripe-checkout.md).

## Implemented behavior

- Pending payments offer **Pagar con tarjeta** and the existing explicitly labelled simulated payment.
- Checkout sends only the optional validated discount code to the API and navigates to its `checkout_url`.
- Both `?stripe=success` and `?stripe=cancel` reload the list. Neither changes payment state or calls simulated pay.
- The return notice offers **Actualizar pagos** if webhook delivery is delayed.
- A 503 shows an unavailable message; simulated pay remains usable.
- Payment actions are disabled while a payment request is in flight.

## Local setup

Use the backend Stripe branch and test keys in its ignored `.env`:

```dotenv
STRIPE_SUCCESS_URL=http://localhost:5173/mi-area/pagos?stripe=success
STRIPE_CANCEL_URL=http://localhost:5173/mi-area/pagos?stripe=cancel
```

```sh
stripe listen --forward-to http://localhost:8000/api/v1/webhooks/stripe
```

Set the listener's signing secret in the backend `.env` before starting the API.
No Stripe secret belongs in Vite configuration. Use a separate test database.

## Verification performed

- Frontend CI passed (build, lint and full test suite). Local suite: 99 passed before adding the final discount case; all 6 page tests passed after that addition.
- Frontend lint and production build passed. Dependency audit: zero vulnerabilities.
- Backend checkout/webhook tests: 12 passed. Full backend suite after fixing existing Stripe OpenAPI error schemas: 754 passed, coverage 96.51%.
- Stripe CLI connected in test mode and obtained a signing secret, saved only to ignored local configuration.
- Real test-mode Checkout creation through the running API: HTTP 200; payment remained pending.
- Invalid webhook signature through the running API: HTTP 400.
- Correct success/cancel URLs verified from backend settings.

## Pending hosted-checkout smoke

Browser control continued returning `Local browser use is disabled in Work settings` even after the user enabled it and the tool session was reset. The 4242 card submission and the resulting real webhook delivery have **not** been verified. Automated webhook tests are not evidence of a completed hosted Checkout.

After enabling browser access, log in as a synthetic member, open **Mis pagos**, choose **Pagar con tarjeta**, and pay with `4242 4242 4242 4242`, a future expiration date and any test CVC. Verify:

1. Stripe CLI receives the completed event and the local endpoint returns 200.
2. Return URL is `/mi-area/pagos?stripe=success`.
3. API/database show `status=paid`, `method=stripe`, and a nonempty `provider_ref` matching the Checkout session.
4. Cancellation returns to `/mi-area/pagos?stripe=cancel` without confirming payment.

No merges. Stripe Refunds API is outside this change.
