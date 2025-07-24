import re
import html
from typing import Any, Dict
from fastapi import Request
import logging

logger = logging.getLogger(__name__)

def sanitize_input(data: Any) -> Any:
    """Sanitize input data to prevent injection attacks."""
    if isinstance(data, str):
        # Remove HTML tags and escape special characters
        data = html.escape(data.strip())
        # Remove potentially dangerous characters
        data = re.sub(r'[<>"\']', '', data)
        return data
    elif isinstance(data, dict):
        return {key: sanitize_input(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    else:
        return data

def normalize_phone_number(phone: str) -> str:
    """Normalize phone number format."""
    # Remove all non-digit characters except +
    phone = re.sub(r'[^\d+]', '', phone)
    
    # Ensure it starts with + for international format
    if not phone.startswith('+'):
        if phone.startswith('1') and len(phone) == 11:
            phone = '+' + phone
        else:
            phone = '+1' + phone
    
    return phone

def validate_specialization(specialization: str) -> bool:
    """Validate medical specialization against predefined list."""
    valid_specializations = [
        "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
        "General Practice", "Internal Medicine", "Neurology", "Oncology",
        "Orthopedics", "Pediatrics", "Psychiatry", "Radiology",
        "Surgery", "Urology", "Emergency Medicine", "Family Medicine",
        "Obstetrics and Gynecology", "Ophthalmology", "Otolaryngology",
        "Pathology", "Physical Medicine", "Preventive Medicine"
    ]
    
    return specialization.strip() in valid_specializations 