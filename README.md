# deepak-portfolio
A modern and responsive Software Developer Portfolio showcasing my projects, technical skills, achievements, and professional experience.

## Admin email sign-in

Admin access uses a one-time code sent to the address in `ADMIN_EMAIL`; there is no admin password to enter. Configure these values in your local `.env.local` file:

- `ADMIN_EMAIL`: the email address allowed to sign in.
- `RESEND_API_KEY`: an API key from [Resend](https://resend.com/api-keys) for sending the code and contact-form notifications.
- `ADMIN_OTP_FROM_EMAIL`: the sender shown on the code email. Use an address on a domain verified in Resend. For local testing, Resend's onboarding sender may only deliver to the email address associated with your Resend account.
- `MONGODB_URI` and `MONGODB_DB`: MongoDB connection and database used to store the short-lived, hashed one-time code. Create a database/cluster in [MongoDB Atlas](https://cloud.mongodb.com/), then copy its connection string.
- `NEXTAUTH_URL` and `NEXTAUTH_SECRET`: the local URL and a long random secret used to secure sign-in sessions and OTP hashes. Generate a secret locally with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`; do not use a secret from a chat or commit it.

Restart the development server after changing `.env.local`. On the admin sign-in page, enter the configured admin email, request a code, and enter the six-digit code from your inbox within 10 minutes. A new code can be requested once per minute.

## Optional service API keys

These integrations are optional and can be left blank if you do not use the related feature:

- `GROQ_API_KEY`: [Groq Console](https://console.groq.com/keys). Enables the site AI chat and AI-generated project drafts from GitHub READMEs.
- `GITHUB_TOKEN`: [GitHub personal access tokens](https://github.com/settings/personal-access-tokens). Optional; raises the GitHub API rate limit for repository browsing and importing.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`: [Cloudinary Console](https://console.cloudinary.com/). Enable admin image uploads.

## GitHub project publishing

Set `GITHUB_USERNAME` (or the GitHub username in Admin → GitHub Settings) and optionally `GITHUB_TOKEN` in `.env.local`. A token is recommended to avoid GitHub's lower unauthenticated API rate limit. Set `GROQ_API_KEY` to draft project copy from each repository README when importing.

In Admin → Projects, refresh the GitHub repository list and select **Import project**. Imports are stored as hidden drafts so they are not published before review. AI drafts the project title, description, overview, problem/solution details, features, tags, and documentation URL when those details are available in the README. Review and edit the draft in the Projects editor, add a cover image if desired, then use the importer visibility and pin controls to publish it. Repositories not imported from GitHub do not appear on public project pages.

If Groq is unavailable or the repository has no README, the repository still imports as a hidden draft using GitHub metadata and available README text; the admin receives a warning and can complete the fields manually. AI cannot create a reliable project cover image, so add one in the project editor or upload it through Cloudinary.
