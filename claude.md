# Production Rules
- **Logic:** Use a single instance of `ProsusAI/finbert` to avoid memory leaks.
- **Security:** Load all keys from `.env` using `python-dotenv`.
- **Database:** Use `supabase.table('stock_sentiment').upsert()` for updates.
- **Resilience:** If NewsAPI fails (due to the 100 req/day limit), log the error and wait for the next cycle instead of crashing.