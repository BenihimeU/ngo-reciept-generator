# Free preview deployment

The working zero-cost preview route for this codebase is **GitHub repository → Render web service → Neon PostgreSQL**. Render serves both the React build and `/api` from one address, so the existing HttpOnly session cookie works. GitHub Pages can publish the static frontend, but that separate `github.io` address cannot use the current same-origin login flow with a Render API.

Free tiers change. Check the providers' current limits before deployment. Do not use the free preview setup for real donor records without email verification, abuse controls, backups, and an operational review.

## 1. Push the code to GitHub

Create a GitHub repository and push this project to its `main` branch. This local checkout currently has no Git remote. Do not commit `.env` or database passwords; `.env` is ignored.

## 2. Create the PostgreSQL database on Neon

Create a free Neon project. In its **Connect** panel, copy two connection strings:

- **Direct connection** for the one-time schema migration from your Mac.
- **Pooled connection** for the running Render API.

Both should include the SSL parameters supplied by Neon. Run the schema migration locally with the direct URL:

```bash
DATABASE_URL='PASTE_NEON_DIRECT_URL_HERE' npm run db:migrate
```

The command creates the four tables in `server/db/schema.sql`. Keep both URLs private.

## 3. Deploy the combined app on Render

In Render, create a **Web Service**, connect the GitHub repository, choose the `main` branch, select **Docker**, and choose the **Free** instance type. The repository's `Dockerfile` builds React and starts the Node API on Render's `PORT`.

Set these environment variables in Render:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** connection string |
| `APP_ORIGIN` | The exact Render HTTPS URL, such as `https://ngo-receipt-generator.onrender.com` |
| `DB_POOL_MAX` | `5` |

Render assigns the URL during service creation. Add `APP_ORIGIN` once you know it and redeploy if necessary. Do not add `DATABASE_URL` to GitHub Actions or client-side `VITE_` variables.

After deployment, open `https://YOUR-SERVICE.onrender.com/api/health`. It should return `{"status":"ok"}`. Then open the service root URL, register the first NGO admin, and complete the organisation details.

Render's free web service sleeps after inactivity, so the first request can be slow. Neon's free database has usage and storage limits. See the provider links below.

## GitHub Pages frontend

The existing `.github/workflows/deploy.yml` builds the frontend when `main` is pushed. To publish it, choose **Settings → Pages → Build and deployment → GitHub Actions** in the repository. The resulting `github.io` page is a static preview. **Login and receipt saving will not work there with the current session-cookie design**, even if a separate API URL is configured. Use the Render URL for the functional app.

If GitHub Pages must be the functional frontend URL, redesign cross-origin authentication and API access before deployment. GitHub Pages cannot host the Node API or PostgreSQL database.

## Provider documentation

- [GitHub Pages with GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Render free services and limits](https://render.com/docs/free)
- [Render Docker deployment](https://render.com/docs/docker)
- [Neon pooled versus direct connections](https://neon.com/docs/connect/connection-pooling)
