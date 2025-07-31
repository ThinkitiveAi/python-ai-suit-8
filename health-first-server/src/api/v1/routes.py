"""API routes for provider registration."""
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from src import limiter
from src.schemas.provider import ProviderRegistrationSchema, ProviderResponseSchema
from src.services.provider import ProviderService
from src.core.config import Config

# Create blueprint
api_bp = Blueprint('api', __name__)

# Initialize services
provider_service = ProviderService()

# Initialize schemas
registration_schema = ProviderRegistrationSchema()
response_schema = ProviderResponseSchema()

@api_bp.route('/provider/register', methods=['POST'])
@limiter.limit(Config.REGISTRATION_RATE_LIMIT)
def register_provider():
    """Register a new provider."""
    try:
        # Validate request data
        data = registration_schema.load(request.json)
        
        # Register provider
        result = provider_service.register_provider(data)
        
        # Prepare response
        response = {
            'success': True,
            'message': 'Provider registered successfully. Verification email sent.',
            'data': result
        }
        
        return jsonify(response_schema.dump(response)), 201

    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Validation error',
            'errors': e.messages
        }), 422
    
    except ValueError as e:
        if 'already exists' in str(e):
            return jsonify({
                'success': False,
                'message': str(e)
            }), 409
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'An error occurred during registration'
        }), 500

@api_bp.route('/provider/verify/<token>', methods=['GET'])
def verify_email(token):
    """Verify provider's email address."""
    try:
        result = provider_service.verify_email(token)
        
        response = {
            'success': True,
            'message': 'Email verified successfully',
            'data': result
        }
        
        return jsonify(response_schema.dump(response)), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'An error occurred during email verification'
        }), 500 