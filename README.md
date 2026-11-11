<p align="center">
  <img src="public/Favicon.png" alt="iuno.lol logo" width="160">
</p>

<h1 align="center">iuno.lol</h1>

Ima too lazy to maintain this shi [iuno.lol](https://iuno.lol), so here's the code. Have fun.

## Requirements

- Node.js 20.9 or later
- npm
- MySQL 8 or a compatible MySQL server

Redis, Cloudflare R2, and the external API credentials listed in [`.env.example`](./.env.example) are only needed when using the parts of the application that depend on those services.

## Local development

### 1. Install dependencies

```sh
npm ci
```

### 2. Configure environment variables

Copy the example file to `.env.local`:

**Windows PowerShell**

```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux**

```sh
cp .env.example .env.local
```

Set at least the following values in `.env`:

| Variable | Description |
| --- | --- |
| `DB_HOST` | MySQL server host |
| `DB_PORT` | MySQL server port; usually `3306` |
| `DB_USER` | MySQL user |
| `DB_PASS` | MySQL password |
| `DB_NAME` | Database name |
| `NEXT_PUBLIC_APP_URL` | Base URL of this instance, such as `http://localhost:3000` |
| `JWT_SECRET_KEY` | Secret used to sign authentication tokens |

Generate a random value for `JWT_SECRET_KEY`:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

`TWO_FACTOR_ENCRYPTION_KEY` must also be set before using two-factor authentication. Use a private value of at least 32 characters. Keep all credentials in `.env.local`; never commit real secrets. Local environment files are ignored by Git.

The example file documents the other optional integrations. Configure only services you intend to use. Some integrations need additional setup in their provider dashboards; for example, the Discord OAuth redirect URL must match `DISCORD_REDIRECT_URI`.

### 3. Create or update the database schema

Create the database in MySQL, then apply the schema defined in `src/lib/db/schema.ts`:

```sh
npx drizzle-kit push
```

The Drizzle config reads `.env.local` when it exists, otherwise `.env`. This command applies schema changes directly to the configured database. Use a local development database, and review changes and back up data before running it against any database with data you need to keep.

### 4. Start Next.js

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run cleanup:r2` | Report orphaned Cloudflare R2 objects without deleting them |
| `npm run cleanup:r2:delete` | Delete reported orphaned R2 objects |

The R2 cleanup script reads `.env` by default. Review its output using the non-deleting command before running the delete command. Deletion is irreversible.

## Project layout

```text
iuno.lol/
├── src/
│   ├── app/
│   │   ├── [username]/      Public profile pages
│   │   ├── api/             API routes (auth, widgets, uploads, payments)
│   │   ├── dashboard/       Signed-in dashboard
│   │   └── ...              Other pages and route groups
│   ├── actions/             Server actions
│   ├── components/
│   │   ├── dashboard/       Dashboard UI
│   │   ├── profile/         Profile rendering and customization
│   │   └── ui/              Shared UI
│   └── lib/
│       ├── auth/            Authentication helpers
│       ├── db/              Database connection and schema
│       ├── features/        Feature-specific server logic
│       ├── payments/        Payment providers and fulfillment
│       └── server/security/ Server-only security utilities
├── public/                  Static assets
├── scripts/                 Maintenance scripts
├── drizzle.config.ts        Drizzle Kit configuration
└── .env.example             Environment variable template
```

Most work starts in `src/app/` for pages and API endpoints, `src/components/` for UI, or `src/lib/` for server-side logic.

## Production

Build and run the application with:

```sh
npm run build
npm run start
```

Provide the required environment variables through your hosting provider's secret manager. Set `NEXT_PUBLIC_APP_URL` to the public HTTPS origin and configure external provider callback URLs to match the deployed instance. Ensure the deployment can reach its MySQL database and any configured Redis or object-storage services.

Do not point a development environment at production data. Back up the database before applying schema changes, and use provider-specific production credentials and webhook URLs.

## Contributing

Before opening a pull request:

1. Keep changes focused and avoid including credentials, private user data, or production configuration.
2. Run `npm run lint`.
3. Run `npm run build` when changes affect application code or production configuration.
4. Describe any required environment or database schema changes.

## License

This project is licensed under the ISC license. See [LICENSE](./LICENSE) for the full text.
