"""Main application entry point."""
import os
from src import create_app
from src.core.config import config

# Get environment
env = os.getenv('FLASK_ENV', 'development')
config_class = config.get(env, config['default'])

# Create app
app = create_app(config_class)

if __name__ == '__main__':
    app.run(
        host=app.config.get('HOST', '0.0.0.0'),
        port=app.config.get('PORT', 5007),
        debug=app.config.get('DEBUG', False)
    ) 