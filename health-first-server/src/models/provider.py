"""Provider model for SQLite database."""
import uuid
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.types import TypeDecorator, CHAR
from src import db

class GUID(TypeDecorator):
    """Platform-independent GUID type."""
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        return dialect.type_descriptor(CHAR(32))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif not isinstance(value, uuid.UUID):
            return "%.32x" % uuid.UUID(value).int
        else:
            return "%.32x" % value.int

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                value = uuid.UUID(value)
            return value

class Provider(db.Model):
    """SQLite Provider model."""
    __tablename__ = 'providers'

    id = db.Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    years_of_experience = db.Column(db.Integer, nullable=False)
    clinic_address = db.Column(db.JSON, nullable=False)
    verification_status = db.Column(
        db.String(20),
        nullable=False,
        default='pending',
        server_default='pending'
    )
    license_document_url = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True, server_default='1')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        """Convert the model instance to a dictionary."""
        return {
            'provider_id': str(self.id),
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone_number': self.phone_number,
            'specialization': self.specialization,
            'license_number': self.license_number,
            'years_of_experience': self.years_of_experience,
            'clinic_address': self.clinic_address,
            'verification_status': self.verification_status,
            'license_document_url': self.license_document_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 