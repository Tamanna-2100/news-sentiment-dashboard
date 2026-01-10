'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

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

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockSentiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

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
    if (score > 0.2) return 'Very Bullish';
    if (score > 0.1) return 'Bullish';
    if (score > 0) return 'Slightly Bullish';
    if (score < -0.2) return 'Very Bearish';
    if (score < -0.1) return 'Bearish';
    if (score < 0) return 'Slightly Bearish';
    return 'Neutral';
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
            Real-time AI sentiment analysis for {stocks.length}+ stocks using FinBERT
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Last updated: {stocks[0] ? new Date(stocks[0].updated_at).toLocaleString() : 'Loading...'}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-2">Total Stocks</div>
            <div className="text-3xl font-bold">{stocks.length}</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-6 border border-green-900/30">
            <div className="text-green-400 text-sm mb-2">Bullish</div>
            <div className="text-3xl font-bold text-green-500">
              {stocks.filter(s => s.sentiment_score > 0.1).length}
            </div>
          </div>
          <div className="bg-red-900/20 rounded-lg p-6 border border-red-900/30">
            <div className="text-red-400 text-sm mb-2">Bearish</div>
            <div className="text-3xl font-bold text-red-500">
              {stocks.filter(s => s.sentiment_score < -0.1).length}
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-2">Neutral</div>
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
              className={`rounded-lg p-6 border transition-all hover:scale-105 ${getSentimentBg(stock.sentiment_score)}`}
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
      </div>
    </div>
  );
}