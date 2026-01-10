"""
Sentiment analysis module using FinBERT for financial news.
"""
import os
import logging
from typing import List, Dict
from newsapi import NewsApiClient
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SentimentAnalyzer:
    """Analyze news sentiment using FinBERT model."""
    
    def __init__(self):
        """Initialize NewsAPI client and FinBERT model."""
        # Initialize NewsAPI
        news_api_key = os.getenv('NEWS_API_KEY')
        if not news_api_key:
            raise ValueError("NEWS_API_KEY must be set in .env file")
        
        self.news_client = NewsApiClient(api_key=news_api_key)
        logger.info("NewsAPI client initialized successfully")
        
        # Initialize FinBERT model
        huggingface_token = os.getenv('HUGGINGFACE_TOKEN')
        if huggingface_token:
            os.environ['HUGGING_FACE_HUB_TOKEN'] = huggingface_token
        
        model_name = "ProsusAI/finbert"
        logger.info(f"Loading FinBERT model: {model_name}")
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.model.eval()  # Set to evaluation mode
        
        logger.info("FinBERT model loaded successfully")
    
    def fetch_news(self, ticker: str, company_name: str) -> List[Dict]:
        """
        Fetch latest news articles for a stock.
        
        Args:
            ticker: Stock ticker symbol
            company_name: Company name for search query
        
        Returns:
            List of article dictionaries
        """
        try:
            # Fetch top headlines and general articles
            response = self.news_client.get_everything(
                q=f"{ticker} OR {company_name}",
                language='en',
                sort_by='publishedAt',
                page_size=20
            )
            
            articles = response.get('articles', [])
            logger.info(f"Fetched {len(articles)} articles for {ticker}")
            return articles
            
        except Exception as e:
            logger.error(f"Error fetching news for {ticker}: {str(e)}")
            return []
    
    def analyze_sentiment(self, text: str) -> float:
        """
        Analyze sentiment of a single text using FinBERT.
        
        Args:
            text: Text to analyze
        
        Returns:
            Sentiment score: -1 (negative) to +1 (positive)
        """
        try:
            # Tokenize and prepare input
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            )
            
            # Get model predictions
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            # FinBERT outputs: [positive, negative, neutral]
            positive = predictions[0][0].item()
            negative = predictions[0][1].item()
            neutral = predictions[0][2].item()
            
            # Calculate sentiment score: positive - negative
            sentiment_score = positive - negative
            
            return sentiment_score
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {str(e)}")
            return 0.0
    
    def analyze_ticker(self, ticker: str, company_name: str) -> Dict:
        """
        Analyze sentiment for a specific ticker.
        
        Args:
            ticker: Stock ticker symbol
            company_name: Company name for search
        
        Returns:
            Dictionary with sentiment_score and article_count
        """
        logger.info(f"Starting analysis for {ticker} ({company_name})")
        
        # Fetch news articles
        articles = self.fetch_news(ticker, company_name)
        
        if not articles:
            logger.warning(f"No articles found for {ticker}")
            return {'sentiment_score': 0.0, 'article_count': 0}
        
        # Analyze sentiment for each article
        sentiments = []
        for article in articles:
            # Combine title and description for analysis
            text = f"{article.get('title', '')} {article.get('description', '')}"
            if text.strip():
                sentiment = self.analyze_sentiment(text)
                sentiments.append(sentiment)
        
        # Calculate average sentiment
        if sentiments:
            avg_sentiment = sum(sentiments) / len(sentiments)
            logger.info(
                f"Analysis complete for {ticker} | "
                f"Avg Sentiment: {avg_sentiment:.3f} | "
                f"Articles: {len(sentiments)}"
            )
        else:
            avg_sentiment = 0.0
            logger.warning(f"No valid sentiments calculated for {ticker}")
        
        return {
            'sentiment_score': avg_sentiment,
            'article_count': len(sentiments)
        }
