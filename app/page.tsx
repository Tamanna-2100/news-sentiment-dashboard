'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface StockSentiment {
  ticker: string;
  sentiment_score: number;
  article_count: number;
  updated_at: string;
}

interface SentimentHistory {
  recorded_at: string;
  sentiment_score: number;
}

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockSentiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<StockSentiment | null>(null);
  const [history, setHistory] = useState<SentimentHistory[]>([]);

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedStock) {
      fetchHistory(selectedStock.ticker);
    }
  }, [selectedStock]);

  async function fetchStocks() {
    const { data, error } = await supabase
      .from('stock_sentiment')
      .select('*')
      .order('sentiment_score', { ascending: false });

    if (data) {
      setStocks(data);
      setLoading(false);
    }
  }

  async function fetchHistory(ticker: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data } = await supabase
      .from('sentiment_history')
      .select('recorded_at, sentiment_score')
      .eq('ticker', ticker)
      .gte('recorded_at', sevenDaysAgo.toISOString())
      .order('recorded_at', { ascending: true });

    if (data) {
      setHistory(data);
    }
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return 'text-green-500';
    if (score < -0.1) return 'text-red-500';
    return 'text-gray-400';
  };

  const getSentimentBg = (score: number) => {
    if (score > 0.1) return 'bg-green-500/10 border-green-500/20';
    if (score < -0.1) return 'bg-red-500/10 border-red-500/20';
    return 'bg-gray-500/10 border-gray-500/20';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.2) return '🚀 Very Positive';
    if (score > 0.1) return '📈 Positive';
    if (score > 0) return '👍 Slightly Positive';
    if (score < -0.2) return '⚠️ Very Negative';
    if (score < -0.1) return '📉 Negative';
    if (score < 0) return '👎 Slightly Negative';
    return '➡️ Neutral';
  };

  const getSimpleExplanation = (score: number) => {
    if (score > 0.2) return 'News about this stock is very positive! People are talking about it in a good way.';
    if (score > 0.1) return 'News is mostly positive. This stock is getting good coverage.';
    if (score > 0) return 'News is slightly positive. A bit more good than bad news.';
    if (score < -0.2) return 'News about this stock is very negative. People are concerned.';
    if (score < -0.1) return 'News is mostly negative. This stock is getting bad coverage.';
    if (score < 0) return 'News is slightly negative. A bit more bad than good news.';
    return 'News is balanced. Equal amounts of good and bad coverage.';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading sentiment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            📊 Sentiment Momentum Trader
          </h1>
          <p className="text-gray-400 text-lg">
            See what people are saying about {stocks.length}+ popular stocks in the news
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Last updated: {stocks[0] ? new Date(stocks[0].updated_at).toLocaleString() : 'Loading...'}
          </p>
          <div className="mt-4 bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              💡 <strong>What is this?</strong> We analyze thousands of news articles about stocks using AI. 
              Green = Good news, Red = Bad news. Click any stock to learn more!
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-2">Total Stocks Tracked</div>
            <div className="text-3xl font-bold">{stocks.length}</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-6 border border-green-900/30">
            <div className="text-green-400 text-sm mb-2">📈 Good News</div>
            <div className="text-3xl font-bold text-green-500">
              {stocks.filter(s => s.sentiment_score > 0.1).length}
            </div>
          </div>
          <div className="bg-red-900/20 rounded-lg p-6 border border-red-900/30">
            <div className="text-red-400 text-sm mb-2">📉 Bad News</div>
            <div className="text-3xl font-bold text-red-500">
              {stocks.filter(s => s.sentiment_score < -0.1).length}
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-2">➡️ Mixed News</div>
            <div className="text-3xl font-bold text-gray-400">
              {stocks.filter(s => Math.abs(s.sentiment_score) <= 0.1).length}
            </div>
          </div>
        </div>

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stocks.map((stock) => (
            <div
              key={stock.ticker}
              onClick={() => setSelectedStock(stock)}
              className={`rounded-lg p-6 border transition-all hover:scale-105 cursor-pointer ${getSentimentBg(stock.sentiment_score)}`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">{stock.ticker}</h3>
                <span className={`text-sm font-semibold ${getSentimentColor(stock.sentiment_score)}`}>
                  {getSentimentLabel(stock.sentiment_score)}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-gray-400 text-xs mb-1">Sentiment Score</div>
                  <div className={`text-3xl font-bold ${getSentimentColor(stock.sentiment_score)}`}>
                    {stock.sentiment_score > 0 ? '+' : ''}{stock.sentiment_score.toFixed(3)}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                  <div>
                    <div className="text-gray-500 text-xs">Articles</div>
                    <div className="text-sm font-semibold">{stock.article_count}</div>
                  </div>
                  <div className="w-24 bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        stock.sentiment_score > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(Math.abs(stock.sentiment_score) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {stocks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl">No sentiment data available yet.</p>
            <p className="text-gray-500 mt-2">Make sure your Python backend is running.</p>
          </div>
        )}

        {/* Stock Detail Modal */}
        {selectedStock && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedStock(null)}
          >
            <div 
              className="bg-gray-900 rounded-xl p-8 max-w-2xl w-full border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-4xl font-bold mb-2">{selectedStock.ticker}</h2>
                  <span className={`text-lg font-semibold ${getSentimentColor(selectedStock.sentiment_score)}`}>
                    {getSentimentLabel(selectedStock.sentiment_score)}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedStock(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Trend Chart */}
                {history.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-4">📈 7-Day Sentiment Trend</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={history.map(h => ({
                        date: new Date(h.recorded_at).toLocaleDateString(),
                        score: h.sentiment_score
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} domain={[-1, 1]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                          labelStyle={{ color: '#9CA3AF' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke={selectedStock.sentiment_score > 0 ? '#10B981' : '#EF4444'} 
                          strokeWidth={2}
                          dot={{ fill: selectedStock.sentiment_score > 0 ? '#10B981' : '#EF4444' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Showing sentiment changes over the past 7 days
                    </p>
                  </div>
                )}

                <div>
                  <div className="text-gray-400 text-sm mb-2">News Mood Score</div>
                  <div className={`text-5xl font-bold ${getSentimentColor(selectedStock.sentiment_score)}`}>
                    {selectedStock.sentiment_score > 0 ? '+' : ''}{selectedStock.sentiment_score.toFixed(4)}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Range: -1.0 (very bad) to +1.0 (very good)
                  </p>
                  <div className="mt-4 w-full bg-gray-800 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        selectedStock.sentiment_score > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(Math.abs(selectedStock.sentiment_score) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">📰 News Articles</div>
                    <div className="text-3xl font-bold">{selectedStock.article_count}</div>
                    <div className="text-xs text-gray-500 mt-1">analyzed by AI</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">🕒 Last Checked</div>
                    <div className="text-sm font-semibold">
                      {new Date(selectedStock.updated_at).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(selectedStock.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4">
                  <div className="text-blue-400 text-sm font-semibold mb-2">📖 What does this mean?</div>
                  <p className="text-sm text-gray-300">
                    {getSimpleExplanation(selectedStock.sentiment_score)}
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">ℹ️ How we calculate this</div>
                  <p className="text-xs text-gray-400">
                    We use AI to read news headlines about {selectedStock.ticker} and determine if they're positive, negative, or neutral. 
                    We analyzed {selectedStock.article_count} recent articles and averaged their sentiment to get this score.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}