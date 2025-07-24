from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Dict, Any
import logging
from sqlalchemy.orm import Session

from ..models.provider import ProviderCreate, ProviderResponse
from ..services.provider_service import provider_service
from ..middlewares.validation import sanitize_input, normalize_phone_number, validate_specialization
from ..database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/register", response_model=ProviderResponse, status_code=201)
def register_provider(provider_data: ProviderCreate, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Register a new healthcare provider.
    
    Args:
        provider_data (ProviderCreate): Provider registration data
        db (Session): Database session
        
    Returns:
        Dict[str, Any]: Registration response with provider details
    """
    try:
        # Sanitize input data
        sanitized_data = sanitize_input(provider_data.dict())
        
        # Normalize phone number
        sanitized_data["phone_number"] = normalize_phone_number(sanitized_data["phone_number"])
        
        # Validate specialization
        if not validate_specialization(sanitized_data["specialization"]):
            raise HTTPException(
                status_code=422,
                detail={
                    "success": False,
                    "message": "Invalid specialization. Please choose from the predefined list.",
                    "error": "INVALID_SPECIALIZATION"
                }
            )
        
        # Create ProviderCreate object from sanitized data
        sanitized_provider = ProviderCreate(**sanitized_data)
        
        # Register provider
        result = provider_service.register_provider(sanitized_provider, db)
        
        # Log successful registration
        logger.info(f"Provider registration successful: {result['provider_id']}")
        
        return {
            "success": True,
            "message": "Provider registered successfully",
            "data": {
                "provider_id": result["provider_id"],
                "email": result["email"],
                "verification_status": result["verification_status"]
            }
        }
        
    except ValueError as e:
        logger.warning(f"Validation error during provider registration: {e}")
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "message": str(e),
                "error": "VALIDATION_ERROR"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during provider registration: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": "Internal server error. Please try again later.",
                "error": "INTERNAL_SERVER_ERROR"
            }
        )

@router.get("/check-email/{email}")
def check_email_exists(email: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Check if email address is already registered.
    
    Args:
        email (str): Email address to check
        db (Session): Database session
        
    Returns:
        Dict[str, Any]: Check result
    """
    try:
        exists = provider_service.check_email_exists(email.lower(), db)
        
        return {
            "success": True,
            "data": {
                "email": email,
                "exists": exists
            }
        }
        
    except Exception as e:
        logger.error(f"Error checking email existence: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": "Internal server error.",
                "error": "INTERNAL_SERVER_ERROR"
            }
        )

@router.get("/check-phone/{phone}")
def check_phone_exists(phone: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Check if phone number is already registered.
    
    Args:
        phone (str): Phone number to check
        db (Session): Database session
        
    Returns:
        Dict[str, Any]: Check result
    """
    try:
        exists = provider_service.check_phone_exists(phone, db)
        
        return {
            "success": True,
            "data": {
                "phone": phone,
                "exists": exists
            }
        }
        
    except Exception as e:
        logger.error(f"Error checking phone existence: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": "Internal server error.",
                "error": "INTERNAL_SERVER_ERROR"
            }
        )

@router.get("/check-license/{license_number}")
def check_license_exists(license_number: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Check if license number is already registered.
    
    Args:
        license_number (str): License number to check
        db (Session): Database session
        
    Returns:
        Dict[str, Any]: Check result
    """
    try:
        exists = provider_service.check_license_exists(license_number.upper(), db)
        
        return {
            "success": True,
            "data": {
                "license_number": license_number,
                "exists": exists
            }
        }
        
    except Exception as e:
        logger.error(f"Error checking license existence: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": "Internal server error.",
                "error": "INTERNAL_SERVER_ERROR"
            }
        ) 