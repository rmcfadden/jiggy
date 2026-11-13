# jiggy

- [`frontend/`](frontend) — web and mobile apps plus shared packages (npm + turbo monorepo).
  `cd frontend && npm install && npm run dev`
- `backend/` — REST API in three dialects (C#, Rust, TypeScript). Coming soon.

## Social sign-in providers (Google, Facebook)

Register the app with each provider to get a client ID and client secret. There is no access token to paste in: the backend gets one later, when the callback exchanges the authorization code. The `add-identity-provider` CLI stores the provider's config.

> **Status:** Rust backend and web app implement the flow (`GET /api/identity-providers`, `/<name>/authorize`, `/<name>/callback`; the web app has the buttons and `/sso/callback`). The TypeScript and C# backends only have the CLI so far.

### Callback URL

The CLI builds it as `$SITE_BASE_URL/api/identity-providers/<name>/callback`, or you can pass `--redirect-uri`. For a provider named `google` against the local frontend:

```
http://localhost:5174/api/identity-providers/google/callback
```

This assumes the dev server proxies `/api` to the backend. Otherwise use the backend's origin (for example `http://localhost:3000/...`). The URL must match exactly in the provider's console and in the CLI.

### Google

1. Open https://console.cloud.google.com/ and create or select a project.
2. Configure the **OAuth consent screen** (Google Auth Platform). Choose **External**, fill in the app name and email, and add yourself as a **test user** while the app is in Testing.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
4. Add the callback URL under **Authorized redirect URIs**. `http://localhost` is allowed for development.
5. Copy the client ID and client secret.

### Facebook

1. Open https://developers.facebook.com/apps and create an app with the "Authenticate and request data from users with Facebook Login" use case.
2. **Facebook Login → Settings**: add the callback URL under **Valid OAuth Redirect URIs**.
3. **App settings → Basic**: copy the App ID (client ID) and App Secret.
4. While the app is in **Development** mode, only people with a role on the app can sign in. Add yourself under App roles. The `email` permission works in dev mode for those users.

### Register with the CLI

From `backend/typescript` (the Rust backend has the same commands):

```sh
SITE_BASE_URL=http://localhost:5174 npm run add-identity-provider -- google \
  --preset=google --client-id=... --client-secret=... --claims=email,first_name,last_name

npm run add-identity-provider -- facebook \
  --preset=facebook --client-id=<app id> --client-secret=<app secret> \
  --claims=email,first_name,last_name,avatar
```

Change a provider later with `npm run update-identity-provider -- <name> ...`.

## Email confirmation

Signing up with an email address mails a confirmation link. Opening it (`/confirm-email?code=...`) marks the email as verified (`emails.is_verified`). Unverified emails do not block sign-in; the verified flag decides whether single sign-on may attach a provider login to an existing password account (see below).

- **How it works:** the code is a long random token of type `email_confirmation`. Only its SHA-256 hash is stored, it expires after `EMAIL_CONFIRMATION_TTL` seconds (default 86400) and works once. It is linked to the email through `email_tokens`.
- **The message:** the `confirm_email` template (English, from `backend/data/templates.json`) holds `subject`, `text` and `html` with `{{username}}` and `{{confirm_url}}`. Link base: `SITE_BASE_URL` (default `http://localhost:5174`).
- **Resending:** `POST /api/emails/resend` (signed in; at most once a minute). `GET /api/emails/status` says whether the email is confirmed; the profile page uses both.
- **Logging:** sends, failures and confirmations are written to the `logs` table (types Error, Information, Verbose, Trace). A mail failure never fails signup.

SMTP settings (all three backends; environment, then `.env`, then `.env.development`):

| Variable | Meaning |
|---|---|
| `SMTP_HOST` | Mail server. **Unset = nothing is sent**; the message, including the link, is written to the log instead. |
| `SMTP_PORT` | Default 587 (465 for `tls`). |
| `SMTP_SECURE` | `starttls` (default), `tls` or `none`. |
| `SMTP_USERNAME`, `SMTP_PASSWORD` | Optional login. |
| `SMTP_FROM` | Sender, default `no-reply@localhost`. |

To try it locally, run any SMTP sink on port 1025 and start a backend with `SMTP_HOST=127.0.0.1 SMTP_PORT=1025 SMTP_SECURE=none`.

### How single sign-on links accounts (Rust)

1. A provider login that was linked before signs in as that user.
2. Otherwise, the provider must report the email as verified **and** a local account must have that same email **confirmed**. Then the provider is linked to that account. An unconfirmed local email never qualifies, so nobody can register someone else's address and inherit their later Google login. Facebook does not report verification, so it never links by email.
3. Otherwise a new account is created (username from the provider's name). Its email is stored verified when the provider vouched for it, otherwise a confirmation link is mailed.
