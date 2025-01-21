# Apicius 🧑‍🍳

[Edit in Bolt ⚡️](https://bolt.new/~/github.com/gromer/apicius-web)  
[Edit in StackBlitz ⚡️](https://stackblitz.com/~/github.com/gromer/apicius-web)

## Dependencies

- OpenAI
  - Used to parse a recipe from the input screenshot image or text.
  - Requires an OpenAI API key.
- Supabase
  - Used for data persistence.
  - Used for authentication.
  - Requires a Supabase URL and a Supabase anon key.

## Setup

### Environment Variables

Create a `.env.local` file in the root of apicius-web, and add the following:

```
VITE_OPENAI_API_KEY=
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_OPENAI_TEXT_MODEL=gpt-4o-mini
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_URL=
```

Set the `VITE_OPENAI_API_KEY`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SUPABASE_URL` environment variables in this file with the associated values from your OpenAI and Supabase accounts.

### Database Migrations

**TODO:** Add docs for database migrations.

### Running Locally - npm

```
npm install
npm run dev
```
