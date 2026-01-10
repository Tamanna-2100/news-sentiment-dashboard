"""
Main orchestrator for sentiment analysis backend.
Runs continuous loop to fetch news, analyze sentiment, and update database.
"""
import time
import logging
from datetime import datetime
from analyzer import SentimentAnalyzer
from database import SupabaseDB
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define tickers to track - Top 100 most traded stocks
TICKERS = {
    # Mega Cap Tech
    'AAPL': 'Apple', 'MSFT': 'Microsoft', 'GOOGL': 'Google', 'AMZN': 'Amazon', 'NVDA': 'NVIDIA',
    'META': 'Meta', 'TSLA': 'Tesla', 'AVGO': 'Broadcom', 'ORCL': 'Oracle', 'ADBE': 'Adobe',
    'CRM': 'Salesforce', 'INTC': 'Intel', 'AMD': 'AMD', 'CSCO': 'Cisco', 'ACN': 'Accenture',
    
    # High Growth Tech
    'NFLX': 'Netflix', 'SHOP': 'Shopify', 'SQ': 'Block', 'SPOT': 'Spotify', 'UBER': 'Uber',
    'ABNB': 'Airbnb', 'SNOW': 'Snowflake', 'CRWD': 'CrowdStrike', 'ZS': 'Zscaler', 'DDOG': 'Datadog',
    'PLTR': 'Palantir', 'RBLX': 'Roblox', 'U': 'Unity', 'COIN': 'Coinbase', 'RIVN': 'Rivian',
    
    # Semiconductors
    'TSM': 'Taiwan Semi', 'ASML': 'ASML', 'QCOM': 'Qualcomm', 'AMAT': 'Applied Materials', 'LRCX': 'Lam Research',
    'KLAC': 'KLA Corp', 'MRVL': 'Marvell', 'MU': 'Micron', 'SMCI': 'Super Micro', 'ON': 'ON Semiconductor',
    
    # Financials
    'JPM': 'JPMorgan', 'BAC': 'Bank of America', 'WFC': 'Wells Fargo', 'C': 'Citigroup', 'GS': 'Goldman Sachs',
    'MS': 'Morgan Stanley', 'BLK': 'BlackRock', 'SCHW': 'Charles Schwab', 'AXP': 'American Express', 'V': 'Visa',
    'MA': 'Mastercard', 'PYPL': 'PayPal', 'BX': 'Blackstone', 'KKR': 'KKR', 'CME': 'CME Group',
    
    # Healthcare
    'UNH': 'UnitedHealth', 'JNJ': 'Johnson & Johnson', 'LLY': 'Eli Lilly', 'ABBV': 'AbbVie', 'PFE': 'Pfizer',
    'TMO': 'Thermo Fisher', 'ABT': 'Abbott', 'MRK': 'Merck', 'DHR': 'Danaher', 'BMY': 'Bristol Myers',
    
    # Consumer
    'AMZN': 'Amazon', 'COST': 'Costco', 'WMT': 'Walmart', 'HD': 'Home Depot', 'NKE': 'Nike',
    'MCD': 'McDonalds', 'SBUX': 'Starbucks', 'TGT': 'Target', 'DIS': 'Disney', 'CMCSA': 'Comcast',
    
    # Energy
    'XOM': 'Exxon', 'CVX': 'Chevron', 'COP': 'ConocoPhillips', 'SLB': 'Schlumberger', 'EOG': 'EOG Resources',
    
    # Industrial & Auto
    'BA': 'Boeing', 'CAT': 'Caterpillar', 'GE': 'General Electric', 'HON': 'Honeywell', 'UPS': 'UPS',
    'F': 'Ford', 'GM': 'General Motors', 'LCID': 'Lucid', 'NIO': 'NIO',
    
    # Communications
    'T': 'AT&T', 'VZ': 'Verizon', 'TMUS': 'T-Mobile', 'NFLX': 'Netflix',
    
    # ETFs (Most Traded)
    'SPY': 'S&P 500', 'QQQ': 'Nasdaq 100', 'IWM': 'Russell 2000', 'DIA': 'Dow Jones', 'VOO': 'Vanguard S&P'
}

# Update interval in seconds (30 minutes)
UPDATE_INTERVAL = 30 * 60


def run_analysis_cycle():
    """Run one complete cycle of sentiment analysis for all tickers."""
    logger.info("="*60)
    logger.info(f"Starting analysis cycle at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("="*60)
    
    try:
        # Initialize components
        analyzer = SentimentAnalyzer()
        db = SupabaseDB()
        
        # Process each ticker
        for ticker, company_name in TICKERS.items():
            try:
                # Analyze sentiment
                result = analyzer.analyze_ticker(ticker, company_name)
                
                # Update database
                db.upsert_sentiment(
                    ticker=ticker,
                    sentiment_score=result['sentiment_score'],
                    article_count=result['article_count']
                )
                
            except Exception as e:
                logger.error(f"Error processing {ticker}: {str(e)}")
                continue
        
        logger.info("="*60)
        logger.info("Analysis cycle completed successfully")
        logger.info("="*60)
        
    except Exception as e:
        logger.error(f"Error in analysis cycle: {str(e)}")
        raise


def main():
    """Main entry point - run continuous sentiment analysis loop."""
    logger.info("🚀 Sentiment Analysis Backend Started")
    logger.info(f"Tracking tickers: {', '.join(TICKERS.keys())}")
    logger.info(f"Update interval: {UPDATE_INTERVAL // 60} minutes")
    logger.info("")
    
    cycle_count = 0
    
    while True:
        try:
            cycle_count += 1
            logger.info(f"\n📊 Starting Cycle #{cycle_count}")
            
            # Run analysis cycle
            run_analysis_cycle()
            
            # Wait before next cycle
            logger.info(f"\n⏰ Next update in {UPDATE_INTERVAL // 60} minutes...")
            logger.info(f"Waiting until {datetime.fromtimestamp(time.time() + UPDATE_INTERVAL).strftime('%Y-%m-%d %H:%M:%S')}\n")
            time.sleep(UPDATE_INTERVAL)
            
        except KeyboardInterrupt:
            logger.info("\n\n🛑 Shutting down gracefully...")
            break
        except Exception as e:
            logger.error(f"Unexpected error in main loop: {str(e)}")
            logger.info("Retrying in 5 minutes...")
            time.sleep(300)  # Wait 5 minutes before retry


if __name__ == "__main__":
    main()
