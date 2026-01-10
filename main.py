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

# Define tickers to track
TICKERS = {
    'AAPL': 'Apple',
    'NVDA': 'NVIDIA',
    'TSLA': 'Tesla'
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
