"""
Health First Server - Provider Registration Module
"""
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pymongo import MongoClient
from src.core.config import Config

# Initialize extensions
db = SQLAlchemy()
mail = Mail()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
mongo_client = None

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    mail.init_app(app)
    limiter.init_app(app)

    # Setup MongoDB if configured
    if app.config['DATABASE_TYPE'] == 'mongodb':
        global mongo_client
        mongo_client = MongoClient(app.config['MONGODB_URI'])

    # Register blueprints
    from src.api.v1.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api/v1')

    # Create database tables for SQLAlchemy
    if app.config['DATABASE_TYPE'] in ['mysql', 'postgresql']:
        with app.app_context():
            db.create_all()

    return app 