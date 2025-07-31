"""Configuration settings for the application."""
import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class."""
    
    # Application Settings
    SECRET_KEY = os.getenv('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = os.getenv('FLASK_DEBUG', '0') == '1'
    
    # Database Settings
    DATABASE_TYPE = 'sqlite'  # Fixed to SQLite
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///health_first.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security Settings
    BCRYPT_LOG_ROUNDS = int(os.getenv('BCRYPT_LOG_ROUNDS', '12'))
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    
    # Email Settings
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', '587'))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@healthfirst.com')
    
    # Rate Limiting Settings
    RATELIMIT_DEFAULT = "200 per day"
    RATELIMIT_STORAGE_URL = "memory://"
    RATELIMIT_STRATEGY = 'fixed-window'
    
    # Provider Registration Rate Limit
    REGISTRATION_RATE_LIMIT = "5 per hour"
    
    # Specializations List
    VALID_SPECIALIZATIONS = [
        "Cardiology",
        "Dermatology",
        "Endocrinology",
        "Family Medicine",
        "Gastroenterology",
        "Neurology",
        "Oncology",
        "Pediatrics",
        "Psychiatry",
        "Surgery"
    ]

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_ECHO = True

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    MAIL_SUPPRESS_SEND = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    
    # Override these in production
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    
    if not all([SECRET_KEY, JWT_SECRET_KEY]):
        raise ValueError("Secret keys must be set in production!")

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
} 