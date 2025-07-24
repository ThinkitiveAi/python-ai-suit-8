from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from datetime import datetime
from enum import Enum
import re
import uuid


class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class ClinicAddress(BaseModel):
    street: str = Field(..., max_length=200, description="Street address")
    city: str = Field(..., max_length=100, description="City")
    state: str = Field(..., max_length=50, description="State")
    zip: str = Field(..., description="Postal code")
    
    @validator('zip')
    def validate_zip(cls, v):
        # Basic US zip code validation (can be extended for international)
        if not re.match(r'^\d{5}(-\d{4})?$', v):
            raise ValueError('Invalid zip code format')
        return v


class ProviderBase(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=50, description="First name")
    last_name: str = Field(..., min_length=2, max_length=50, description="Last name")
    email: EmailStr = Field(..., description="Email address")
    phone_number: str = Field(..., description="Phone number")
    specialization: str = Field(..., min_length=3, max_length=100, description="Medical specialization")
    license_number: str = Field(..., description="Medical license number")
    years_of_experience: int = Field(..., ge=0, le=50, description="Years of experience")
    clinic_address: ClinicAddress = Field(..., description="Clinic address")
    
    @validator('phone_number')
    def validate_phone_number(cls, v):
        # International phone number validation
        phone_pattern = r'^\+?1?\d{9,15}$'
        if not re.match(phone_pattern, v):
            raise ValueError('Invalid phone number format')
        return v
    
    @validator('license_number')
    def validate_license_number(cls, v):
        # Alphanumeric validation
        if not re.match(r'^[A-Za-z0-9]+$', v):
            raise ValueError('License number must be alphanumeric')
        return v.upper()


class ProviderCreate(ProviderBase):
    password: str = Field(..., min_length=8, description="Password")
    confirm_password: str = Field(..., description="Password confirmation")
    
    @validator('password')
    def validate_password(cls, v):
        # Password complexity validation
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v
    
    @validator('confirm_password')
    def validate_confirm_password(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v


class ProviderInDB(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone_number: str
    password_hash: str
    specialization: str
    license_number: str
    years_of_experience: int
    clinic_street: str
    clinic_city: str
    clinic_state: str
    clinic_zip: str
    verification_status: VerificationStatus = VerificationStatus.VERIFIED
    license_document_url: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "uuid-here",
                "first_name": "John",
                "last_name": "Doe",
                "email": "john.doe@clinic.com",
                "phone_number": "+1234567890",
                "specialization": "Cardiology",
                "license_number": "MD123456789",
                "years_of_experience": 10,
                "clinic_street": "123 Medical Center Dr",
                "clinic_city": "New York",
                "clinic_state": "NY",
                "clinic_zip": "10001"
            }
        }


class ProviderResponse(BaseModel):
    success: bool
    message: str
    data: dict
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Provider registered successfully",
                "data": {
                    "provider_id": "uuid-here",
                    "email": "john.doe@clinic.com",
                    "verification_status": "verified"
                }
            }
        } 