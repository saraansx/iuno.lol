# iuno.lol

iuno.lol is a customizable link-in-bio platform. Create a profile page with links, music, live widgets, themes, and visual effects.

## Features

- Customizable profile pages, links, themes, and effects
- Music players and profile widgets
- Discord sign-in and account features
- Custom domains and image hosting

Some features depend on third-party services. See [`.env.example`](./.env.example) for the available configuration.

## Tech stack

- Next.js 16 and React 19
- TypeScript
- MySQL with Drizzle ORM
- Redis and Cloudflare R2 for optional services

## Run locally

### Prerequisites

- Node.js 20.9 or newer
- npm
- A MySQL database

### Setup

1. Install dependencies:

   ```sh
   npm ci
   ```

2. Create your local environment file:

   **Windows PowerShell**

   ```powershell
   Copy-Item .env.example .env.local
   ```

   **macOS / Linux**

   ```sh
   cp .env.example .env.local
   ```

3. Edit `.env.local`. At minimum, set your MySQL connection (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, and `DB_NAME`), a local app URL, and a strong `JWT_SECRET_KEY`. Generate a secret with:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   Keep `.env.local` private and never commit real credentials. `.env.local` is ignored by Git.

4. Apply the Drizzle schema to your **development database**:

   ```sh
   npx drizzle-kit push
   ```

   Review schema changes before applying them, and do not use this command against a production database without a migration and backup plan.

5. Start the development server:

   ```sh
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

Discord sign-in, email delivery, uploads, payments, and other integrations need their own credentials and provider setup. These are not required just to start the development server, but the corresponding features will not work until configured. Configure Discord's OAuth redirect URL to match `DISCORD_REDIRECT_URI`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Contributing

Contributions are welcome. Open an issue to discuss a substantial change before submitting a pull request. Please avoid including credentials, personal data, or production configuration in issues and pull requests.

## License

The package metadata declares the ISC license.
