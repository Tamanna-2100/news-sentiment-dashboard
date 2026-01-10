"""
Database module for managing Supabase interactions.
"""
import os
import logging
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SupabaseDB:
    """Handle all database operations with Supabase."""
    
    def __init__(self):
        """Initialize Supabase client with credentials from environment."""
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        logger.info("Supabase client initialized successfully")
    
    def upsert_sentiment(self, ticker: str, sentiment_score: float, article_count: int):
        """
        Upsert sentiment data into the stock_sentiment table.
        
        Args:
            ticker: Stock ticker symbol (e.g., 'AAPL')
            sentiment_score: Aggregated sentiment score
            article_count: Number of articles analyzed
        
        Returns:
            dict: Response from Supabase
        """
        try:
            data = {
                'ticker': ticker,
                'sentiment_score': sentiment_score,
                'article_count': article_count,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # Upsert: insert or update if ticker already exists
            response = self.client.table('stock_sentiment').upsert(
                data,
                on_conflict='ticker'
            ).execute()
            
            logger.info(
                f"✓ Successfully updated {ticker} in Supabase | "
                f"Sentiment: {sentiment_score:.3f} | Articles: {article_count}"
            )
            
            return response.data
            
        except Exception as e:
            logger.error(f"Error upserting data for {ticker}: {str(e)}")
            raise
    
    def get_sentiment(self, ticker: str):
        """
        Retrieve sentiment data for a specific ticker.
        
        Args:
            ticker: Stock ticker symbol
        
        Returns:
            dict: Sentiment data or None if not found
        """
        try:
            response = self.client.table('stock_sentiment').select('*').eq('ticker', ticker).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error retrieving data for {ticker}: {str(e)}")
            return None
