"""Provider service for handling registration and related operations."""
from typing import Dict, Any, Optional
import bcrypt
from sqlalchemy import or_
from flask import current_app, url_for
from src import db
from src.models.provider import Provider
from src.services.email import EmailService
from src.core.config import Config

class ProviderService:
    """Service for handling provider operations."""

    def __init__(self):
        """Initialize the service."""
        self.email_service = EmailService()

    def _hash_password(self, password: str) -> str:
        """Hash a password using bcrypt."""
        salt = bcrypt.gensalt(rounds=Config.BCRYPT_LOG_ROUNDS)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def _check_existing_provider(self, email: str, phone_number: str, license_number: str) -> Optional[str]:
        """Check if a provider with given details already exists."""
        existing = Provider.query.filter(
            or_(
                Provider.email == email.lower(),
                Provider.phone_number == phone_number,
                Provider.license_number == license_number
            )
        ).first()

        if existing:
            if existing.email == email.lower():
                return 'email'
            if existing.phone_number == phone_number:
                return 'phone_number'
            return 'license_number'
        return None

    def register_provider(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new provider."""
        try:
            # Check for existing provider
            duplicate_field = self._check_existing_provider(
                data['email'],
                data['phone_number'],
                data['license_number']
            )
            if duplicate_field:
                raise ValueError(f"Provider with this {duplicate_field} already exists")

            # Hash password
            password_hash = self._hash_password(data['password'])

            # Create provider
            provider = Provider(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'].lower(),
                phone_number=data['phone_number'],
                password_hash=password_hash,
                specialization=data['specialization'],
                license_number=data['license_number'],
                years_of_experience=data['years_of_experience'],
                clinic_address=data['clinic_address']
            )
            
            db.session.add(provider)
            db.session.commit()

            # Generate verification URL
            verification_token = self.email_service.generate_verification_token(str(provider.id))
            verification_url = url_for(
                'api.verify_email',
                token=verification_token,
                _external=True
            )

            # Send verification email
            self.email_service.send_verification_email(provider.to_dict(), verification_url)

            return {
                'provider_id': str(provider.id),
                'email': provider.email,
                'verification_status': provider.verification_status
            }

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error during provider registration: {str(e)}")
            raise

    def verify_email(self, token: str) -> Dict[str, Any]:
        """Verify provider's email using the verification token."""
        try:
            # Verify token
            payload = self.email_service.verify_token(token)
            provider_id = payload['provider_id']

            # Update provider status
            provider = Provider.query.get(provider_id)
            if not provider:
                raise ValueError("Provider not found")
            
            if provider.verification_status == 'verified':
                raise ValueError("Email already verified")
            
            provider.verification_status = 'verified'
            db.session.commit()

            return {
                'provider_id': str(provider.id),
                'email': provider.email,
                'verification_status': provider.verification_status
            }

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error during email verification: {str(e)}")
            raise 