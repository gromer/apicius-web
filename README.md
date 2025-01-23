# Apicius 🧑‍🍳

[Edit in Bolt ⚡️](https://bolt.new/~/github.com/gromer/apicius-web)  
[Edit in StackBlitz ⚡️](https://stackblitz.com/~/github.com/gromer/apicius-web)

## Dependencies

- Supabase
  - Used for data persistence.
  - Used for authentication.
  - Requires a Supabase URL and a Supabase anon key.

## Setup

### Environment Variables

Create a `.env.local` file in the root of apicius-web, and add the following:

```
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_URL=
```

Set the `VITE_SUPABASE_ANON_KEY`, and `VITE_SUPABASE_URL` environment variables in this file with the associated values from your Supabase account.

### Database Migrations

**TODO:** Add docs for database migrations.

### Running Locally - npm

```
npm install
npm run dev
```
