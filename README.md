# draft - AI-Powered Game Generator

draft is an AI-powered web application that lets users generate, play, and share fully functional browser-based games. Using a simple prompt, users can have an AI generate a complete HTML5 game. They can then edit or fork the game, rate and comment on creations, and share their favorite games with a shareable URL.

## Features

- **AI Game Generation:**  
  Enter a detailed game prompt and have the AI generate complete, error-free HTML5 game code that runs directly in your browser.

- **Fork & Edit:**  
  Fork any existing game to create a modified version. The fork history is tracked, so you can view and load previous versions.

- **Ratings & Comments:**  
  Rate games on a 5-star scale and leave comments for feedback and community discussion.

- **User Management:**  
  Save your game creations with your username. View creations filtered by user and see a distinct list of users.

- **Shareable Links:**  
  Easily generate and copy a shareable URL so others can load your game directly from their browser.

- **Pagination & Search:**  
  Efficiently browse game creations with search functionality and pagination to avoid loading thousands of records at once.

- **Responsive & Animated UI:**  
  Built with Next.js 13, TypeScript, and Tailwind CSS, and animated with Framer Motion for a modern, minimalistic look.

## Requirements

- **API Key:**  
  You need an API key for the AI service (e.g. OpenAI). This key must be provided via environment variables.

- **Supabase Account:**  
  Set up a Supabase project for your backend database and storage needs.

- **Vercel AI SDK:**  
  The project uses Vercel's AI SDK to interface with the AI API.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/craft-ai-game-generator.git
cd craft-ai-game-generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of your project and add the following:

```env
# API Key for your AI service (e.g. OpenAI)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://vgpqapmuzeqxbnfjkmhd.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

### 4. Set Up the Database Schema

Run the following SQL scripts in your Supabase SQL editor to create (or update) the necessary tables:

#### Games Table

```sql
CREATE TABLE IF NOT EXISTS public.games (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Comments Table

```sql
CREATE TABLE IF NOT EXISTS public.comments (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Ratings Table

```sql
CREATE TABLE IF NOT EXISTS public.ratings (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Forks Table

```sql
CREATE TABLE IF NOT EXISTS public.forks (
  id SERIAL PRIMARY KEY,
  parent_game_id INTEGER NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  new_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Running the Project

To start the development server, run:

```bash
npm run dev
```

Then open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## Deployment

Deploy your project to Vercel (or your preferred hosting provider) by connecting your GitHub repository and configuring your environment variables in the deployment settings.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with any improvements or bug fixes.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [Next.js 13](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Supabase](https://supabase.com/)
- [Vercel AI SDK](https://vercel.com/docs/concepts/ai)