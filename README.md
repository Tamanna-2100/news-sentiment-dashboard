# 📊 Sentiment Momentum Trader

A real-time stock sentiment analysis platform combining Python AI/ML backend with a Next.js dashboard to track market sentiment for high-momentum stocks.

## 🎯 Features

- **AI-Powered Sentiment Analysis**: Uses FinBERT (financial BERT model) to analyze news sentiment
- **Real-Time Updates**: Automatically fetches and analyzes news every 30 minutes
- **Cloud Database**: Stores sentiment scores in Supabase for real-time access
- **Modern Dashboard**: Next.js dashboard to visualize sentiment trends
- **Production Ready**: Secure environment variable management, comprehensive logging

## 📈 Tracked Stocks (100+ Top Tickers)

Comprehensive coverage of the most traded stocks across all major sectors:

- **Mega Cap Tech** - AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, etc.
- **High Growth** - PLTR, COIN, SNOW, CRWD, ABNB, UBER, etc.
- **Semiconductors** - AMD, INTC, TSM, QCOM, ASML, MU, SMCI, etc.
- **Financials** - JPM, BAC, GS, V, MA, PYPL, BLK, etc.
- **Healthcare** - UNH, JNJ, LLY, ABBV, PFE, TMO, etc.
- **Consumer** - WMT, COST, HD, NKE, MCD, DIS, etc.
- **Energy** - XOM, CVX, COP, SLB, EOG
- **Industrial** - BA, CAT, GE, UPS, F, GM, etc.
- **Major ETFs** - SPY, QQQ, IWM, DIA, VOO

*Full list of ~100 tickers covering S&P 100 + most popular retail stocks*

## 🏗️ Architecture

### Backend (Python)
- **main.py** - Orchestrator running 30-minute update cycles
- **analyzer.py** - FinBERT sentiment analysis engine
- **database.py** - Supabase database integration
- **requirements.txt** - Python dependencies

### Frontend (Next.js)
- **app/** - Next.js 14+ app directory
- Modern React components with TypeScript
- Tailwind CSS styling
- Real-time data fetching from Supabase

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase account
- NewsAPI key
- HuggingFace token (optional, for FinBERT)

### 1. Environment Setup

Create a `.env` file in the root directory:

```env
# Python Backend
NEWS_API_KEY=your_newsapi_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
HUGGINGFACE_TOKEN=your_hf_token

# Next.js Frontend (create .env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Dependencies

**Python Backend:**
```bash
pip install -r requirements.txt
```

**Next.js Dashboard:**
```bash
npm install
```

### 3. Database Schema

Create a `stock_sentiment` table in Supabase:

```sql
CREATE TABLE stock_sentiment (
  ticker TEXT PRIMARY KEY,
  sentiment_score REAL NOT NULL,
  article_count INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Run the Application

**Start Backend (in terminal 1):**
```bash
python main.py
```

**Start Dashboard (in terminal 2):**
```bash
npm run dev
```

Visit `http://localhost:3000` to view the dashboard.

## 📊 How It Works

1. **News Fetching**: Backend fetches latest news articles from NewsAPI for each tracked ticker
2. **Sentiment Analysis**: FinBERT analyzes headlines and descriptions, scoring from -1 (negative) to +1 (positive)
3. **Database Update**: Aggregated sentiment scores are upserted to Supabase
4. **Dashboard Display**: Next.js dashboard queries Supabase and visualizes the sentiment data
5. **Repeat**: Process runs every 30 minutes automatically

## 🔒 Security

- ✅ All API keys stored in environment variables
- ✅ `.gitignore` configured to exclude `.env` and `.env.local`
- ✅ No hardcoded credentials anywhere in the codebase
- ✅ Environment variables validated on startup

## 📝 Logging

The backend provides detailed logging:
```
2026-01-10 10:30:15 - database - INFO - ✓ Successfully updated AAPL in Supabase | Sentiment: 0.342 | Articles: 18
2026-01-10 10:32:45 - database - INFO - ✓ Successfully updated NVDA in Supabase | Sentiment: 0.521 | Articles: 15
2026-01-10 10:35:12 - database - INFO - ✓ Successfully updated TSLA in Supabase | Sentiment: -0.123 | Articles: 22
```

## 🛠️ Tech Stack

**Backend:**
- Python 3.10+
- Transformers (HuggingFace)
- FinBERT (ProsusAI/finbert)
- PyTorch
- Supabase Python Client
- NewsAPI Python

**Frontend:**
- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS
- Supabase JS Client

## 📦 Project Structure

```
sentiment-momentum-trader/
├── app/                    # Next.js app directory
├── public/                 # Static assets
├── .next/                  # Next.js build (gitignored)
├── node_modules/           # Node dependencies (gitignored)
├── .venv/                  # Python virtual env (gitignored)
├── __pycache__/            # Python cache (gitignored)
├── main.py                 # Python backend orchestrator
├── analyzer.py             # Sentiment analysis engine
├── database.py             # Supabase integration
├── requirements.txt        # Python dependencies
├── package.json            # Node dependencies
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── .env                    # Backend environment variables (gitignored)
├── .env.local              # Frontend environment variables (gitignored)
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- [FinBERT](https://huggingface.co/ProsusAI/finbert) by ProsusAI for financial sentiment analysis
- [NewsAPI](https://newsapi.org/) for news data
- [Supabase](https://supabase.com/) for real-time database

---

Built with ❤️ for traders who want data-driven sentiment insights.
