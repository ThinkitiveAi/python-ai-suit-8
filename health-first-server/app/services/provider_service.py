from typing import Optional, Dict, Any
from datetime import datetime
import logging
import uuid
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..database import get_db, Provider
from ..models.provider import ProviderCreate, ProviderInDB, VerificationStatus
from ..utils.password_utils import hash_password

logger = logging.getLogger(__name__)

class ProviderService:
    def register_provider(self, provider_data: ProviderCreate, db: Session) -> Dict[str, Any]:
        """
        Register a new provider with comprehensive validation and security measures.
        
        Args:
            provider_data (ProviderCreate): Provider registration data
            db (Session): Database session
            
        Returns:
            Dict[str, Any]: Registration result with provider ID and status
        """
        try:
            # Check for existing email
            existing_email = db.query(Provider).filter(Provider.email == provider_data.email.lower()).first()
            if existing_email:
                raise ValueError("Email address already registered")
            
            # Check for existing phone number
            existing_phone = db.query(Provider).filter(Provider.phone_number == provider_data.phone_number).first()
            if existing_phone:
                raise ValueError("Phone number already registered")
            
            # Check for existing license number
            existing_license = db.query(Provider).filter(Provider.license_number == provider_data.license_number).first()
            if existing_license:
                raise ValueError("License number already registered")
            
            # Hash password
            password_hash = hash_password(provider_data.password)
            
            # Create provider record
            provider_id = str(uuid.uuid4())
            provider = Provider(
                id=provider_id,
                first_name=provider_data.first_name.strip(),
                last_name=provider_data.last_name.strip(),
                email=provider_data.email.lower().strip(),
                phone_number=provider_data.phone_number.strip(),
                password_hash=password_hash,
                specialization=provider_data.specialization.strip(),
                license_number=provider_data.license_number,
                years_of_experience=provider_data.years_of_experience,
                clinic_street=provider_data.clinic_address.street.strip(),
                clinic_city=provider_data.clinic_address.city.strip(),
                clinic_state=provider_data.clinic_address.state.strip(),
                clinic_zip=provider_data.clinic_address.zip.strip(),
                verification_status=VerificationStatus.VERIFIED,  # Auto-verify since no email
                license_document_url=None,
                is_active=True
            )
            
            # Add provider to database
            db.add(provider)
            db.commit()
            db.refresh(provider)
            
            # Log successful registration
            logger.info(f"Provider registered successfully: {provider_id}")
            
            return {
                "provider_id": provider_id,
                "email": provider_data.email,
                "verification_status": VerificationStatus.VERIFIED,
                "message": "Provider registered successfully"
            }
            
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Integrity error during provider registration: {e}")
            raise ValueError("Provider with this information already exists")
        except ValueError as e:
            logger.error(f"Validation error during provider registration: {e}")
            raise e
        except Exception as e:
            db.rollback()
            logger.error(f"Unexpected error during provider registration: {e}")
            raise Exception("Internal server error during registration")
    
    def get_provider_by_id(self, provider_id: str, db: Session) -> Optional[ProviderInDB]:
        """
        Get provider by ID.
        
        Args:
            provider_id (str): Provider's unique ID
            db (Session): Database session
            
        Returns:
            Optional[ProviderInDB]: Provider data if found, None otherwise
        """
        try:
            provider = db.query(Provider).filter(Provider.id == provider_id).first()
            if provider:
                return ProviderInDB.from_orm(provider)
            return None
        except Exception as e:
            logger.error(f"Error getting provider by ID {provider_id}: {e}")
            return None
    
    def get_provider_by_email(self, email: str, db: Session) -> Optional[ProviderInDB]:
        """
        Get provider by email address.
        
        Args:
            email (str): Provider's email address
            db (Session): Database session
            
        Returns:
            Optional[ProviderInDB]: Provider data if found, None otherwise
        """
        try:
            provider = db.query(Provider).filter(Provider.email == email.lower()).first()
            if provider:
                return ProviderInDB.from_orm(provider)
            return None
        except Exception as e:
            logger.error(f"Error getting provider by email {email}: {e}")
            return None
    
    def update_provider_status(self, provider_id: str, status: VerificationStatus, db: Session) -> bool:
        """
        Update provider verification status.
        
        Args:
            provider_id (str): Provider's unique ID
            status (VerificationStatus): New verification status
            db (Session): Database session
            
        Returns:
            bool: True if update successful, False otherwise
        """
        try:
            provider = db.query(Provider).filter(Provider.id == provider_id).first()
            if provider:
                provider.verification_status = status
                provider.updated_at = datetime.utcnow()
                db.commit()
                return True
            
            return False
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating provider status {provider_id}: {e}")
            return False
    
    def check_email_exists(self, email: str, db: Session) -> bool:
        """
        Check if email already exists in database.
        
        Args:
            email (str): Email address to check
            db (Session): Database session
            
        Returns:
            bool: True if email exists, False otherwise
        """
        try:
            provider = db.query(Provider).filter(Provider.email == email.lower()).first()
            return provider is not None
        except Exception as e:
            logger.error(f"Error checking email existence {email}: {e}")
            return False
    
    def check_phone_exists(self, phone: str, db: Session) -> bool:
        """
        Check if phone number already exists in database.
        
        Args:
            phone (str): Phone number to check
            db (Session): Database session
            
        Returns:
            bool: True if phone exists, False otherwise
        """
        try:
            provider = db.query(Provider).filter(Provider.phone_number == phone).first()
            return provider is not None
        except Exception as e:
            logger.error(f"Error checking phone existence {phone}: {e}")
            return False
    
    def check_license_exists(self, license_number: str, db: Session) -> bool:
        """
        Check if license number already exists in database.
        
        Args:
            license_number (str): License number to check
            db (Session): Database session
            
        Returns:
            bool: True if license exists, False otherwise
        """
        try:
            provider = db.query(Provider).filter(Provider.license_number == license_number).first()
            return provider is not None
        except Exception as e:
            logger.error(f"Error checking license existence {license_number}: {e}")
            return False

# Create global provider service instance
provider_service = ProviderService() 