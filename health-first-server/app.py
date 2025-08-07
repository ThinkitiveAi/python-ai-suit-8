"""Health First Provider Registration and Authentication API"""
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import uuid
import bcrypt
from marshmallow import Schema, fields, validate, validates, ValidationError
import jwt
import os
from dotenv import load_dotenv
from flask_swagger_ui import get_swaggerui_blueprint
from flasgger import Swagger, swag_from
from functools import wraps

# Load environment variables
load_dotenv()

# Update the database configuration
app = Flask(__name__)

# Configure SQLite database with absolute path
import os
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'health_first.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Update the JWT settings at the top of the file
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 1800))  # 30 minutes
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 604800))  # 7 days
app.config['JWT_REMEMBER_ME_EXPIRES'] = int(os.getenv('JWT_REMEMBER_ME_EXPIRES', 2592000))  # 30 days

# Rate Limiting Settings
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION = timedelta(minutes=30)
RATE_LIMIT_WINDOW = timedelta(minutes=15)

# Configure Swagger
app.config['SWAGGER'] = {
    'title': 'Health First Provider Registration API',
    'uiversion': 3,
    'version': '1.0.0',
    'description': 'API for healthcare provider registration and verification',
    'specs_route': '/api/docs/',
    'securityDefinitions': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'description': 'Bearer token for authentication (e.g., Bearer eyJhbGciOiJIUzI1NiIs...)'
        }
    },
    'security': [
        {
            'Bearer': []
        }
    ]
}
swagger = Swagger(app)

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Provider Model
class Provider(db.Model):
    """Provider model for storing healthcare provider information."""
    __tablename__ = 'provider'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    years_of_experience = db.Column(db.Integer, nullable=False)
    clinic_address = db.Column(db.JSON, nullable=False)
    verification_status = db.Column(db.String(20), default='pending')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Login tracking fields
    last_login = db.Column(db.DateTime, nullable=True)
    failed_login_attempts = db.Column(db.Integer, default=0)
    locked_until = db.Column(db.DateTime, nullable=True)
    login_count = db.Column(db.Integer, default=0)

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'specialization': self.specialization,
            'verification_status': self.verification_status,
            'is_active': self.is_active
        }

    def is_locked(self):
        if self.locked_until and self.locked_until > datetime.utcnow():
            return True
        return False

    def increment_failed_attempts(self):
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            self.locked_until = datetime.utcnow() + LOCKOUT_DURATION
        db.session.commit()

    def reset_failed_attempts(self):
        self.failed_login_attempts = 0
        self.locked_until = None
        db.session.commit()

# Update the Patient model with additional fields
class Patient(db.Model):
    """Patient model for storing patient information."""
    __tablename__ = 'patient'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    
    # Address
    address = db.Column(db.JSON, nullable=False)
    
    # Emergency Contact
    emergency_contact = db.Column(db.JSON, nullable=True)
    
    # Medical History
    medical_history = db.Column(db.JSON, nullable=True)  # Store as array of strings
    
    # Insurance Info
    insurance_info = db.Column(db.JSON, nullable=True)
    
    # Verification and Status
    email_verified = db.Column(db.Boolean, default=False)
    phone_verified = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Login tracking
    last_login = db.Column(db.DateTime, nullable=True)
    login_count = db.Column(db.Integer, default=0)
    failed_login_attempts = db.Column(db.Integer, default=0)
    locked_until = db.Column(db.DateTime, nullable=True)
    last_failed_attempt = db.Column(db.DateTime, nullable=True)
    suspicious_activity_score = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sessions = db.relationship('PatientSession', backref='patient', lazy=True)

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone_number': self.phone_number,
            'date_of_birth': self.date_of_birth.isoformat(),
            'email_verified': self.email_verified,
            'phone_verified': self.phone_verified,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

    def is_locked(self):
        if self.locked_until and self.locked_until > datetime.utcnow():
            return True, self.locked_until
        return False, None

    def increment_failed_attempts(self):
        now = datetime.utcnow()
        self.failed_login_attempts += 1
        self.last_failed_attempt = now

        # Progressive lockout strategy
        if self.failed_login_attempts >= 5 and (not self.last_failed_attempt or 
            (now - self.last_failed_attempt).total_seconds() < 86400):  # 24 hours
            self.locked_until = now + timedelta(hours=24)
            self.suspicious_activity_score += 2
        elif self.failed_login_attempts >= 3:
            self.locked_until = now + timedelta(hours=1)
            self.suspicious_activity_score += 1

        db.session.commit()

    def reset_failed_attempts(self):
        self.failed_login_attempts = 0
        self.locked_until = None
        self.last_failed_attempt = None
        db.session.commit()

    def record_login(self, ip_address, user_agent):
        self.last_login = datetime.utcnow()
        self.login_count += 1
        self.reset_failed_attempts()
        db.session.commit()

class PatientSession(db.Model):
    """Model for storing patient sessions and device information."""
    __tablename__ = 'patient_sessions'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.String(36), db.ForeignKey('patient.id'), nullable=False)
    refresh_token_hash = db.Column(db.String(255), unique=True, nullable=False)
    device_info = db.Column(db.JSON, nullable=True)
    ip_address = db.Column(db.String(45), nullable=False)  # IPv6 compatible
    user_agent = db.Column(db.String(255), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_revoked = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_used_at = db.Column(db.DateTime, nullable=True)
    location_info = db.Column(db.JSON, nullable=True)

    @staticmethod
    def hash_token(token):
        return bcrypt.hashpw(token.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify_token(self, token):
        return bcrypt.checkpw(token.encode('utf-8'), self.refresh_token_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'device_info': self.device_info,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat(),
            'last_used_at': self.last_used_at.isoformat() if self.last_used_at else None,
            'expires_at': self.expires_at.isoformat()
        }

# Refresh Token Model
class RefreshToken(db.Model):
    """Model for storing refresh tokens."""
    __tablename__ = 'refresh_token'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    provider_id = db.Column(db.String(36), db.ForeignKey('provider.id'), nullable=False)
    token_hash = db.Column(db.String(255), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_revoked = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_used_at = db.Column(db.DateTime, nullable=True)

    @staticmethod
    def hash_token(token):
        return bcrypt.hashpw(token.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify_token(self, token):
        return bcrypt.checkpw(token.encode('utf-8'), self.token_hash.encode('utf-8'))

# Authentication Middleware
def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({
                'success': False,
                'message': 'Missing authentication token',
                'error_code': 'MISSING_TOKEN'
            }), 401

        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            provider = db.session.get(Provider, payload['provider_id'])

            if not provider:
                return jsonify({
                    'success': False,
                    'message': 'Invalid authentication token',
                    'error_code': 'INVALID_TOKEN'
                }), 401

            if not provider.is_active:
                return jsonify({
                    'success': False,
                    'message': 'Account is inactive',
                    'error_code': 'INACTIVE_ACCOUNT'
                }), 403

            if provider.verification_status != 'verified':
                return jsonify({
                    'success': False,
                    'message': 'Account is not verified',
                    'error_code': 'UNVERIFIED_ACCOUNT'
                }), 403

            if provider.is_locked():
                return jsonify({
                    'success': False,
                    'message': 'Account is locked',
                    'error_code': 'ACCOUNT_LOCKED'
                }), 423

            request.provider = provider
            return f(*args, **kwargs)

        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'message': 'Token has expired',
                'error_code': 'TOKEN_EXPIRED'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'message': 'Invalid authentication token',
                'error_code': 'INVALID_TOKEN'
            }), 401

    return decorated

def patient_jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({
                'success': False,
                'message': 'Missing authentication token',
                'error_code': 'MISSING_TOKEN'
            }), 401

        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            patient = Patient.query.get(payload['patient_id'])

            if not patient:
                return jsonify({
                    'success': False,
                    'message': 'Invalid authentication token',
                    'error_code': 'INVALID_TOKEN'
                }), 401

            if not patient.is_active:
                return jsonify({
                    'success': False,
                    'message': 'Account is inactive',
                    'error_code': 'INACTIVE_ACCOUNT'
                }), 403

            is_locked, lock_until = patient.is_locked()
            if is_locked:
                return jsonify({
                    'success': False,
                    'message': f'Account is locked. Try again after {lock_until}',
                    'error_code': 'ACCOUNT_LOCKED'
                }), 423

            request.patient = patient
            return f(*args, **kwargs)

        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'message': 'Token has expired',
                'error_code': 'TOKEN_EXPIRED'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'message': 'Invalid authentication token',
                'error_code': 'INVALID_TOKEN'
            }), 401

    return decorated

# Add after the Provider model and before the schemas

class ProviderAvailability(db.Model):
    """Model for provider availability schedules."""
    __tablename__ = 'provider_availability'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    provider_id = db.Column(db.String(36), db.ForeignKey('provider.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.String(5), nullable=False)  # HH:mm format
    end_time = db.Column(db.String(5), nullable=False)    # HH:mm format
    timezone = db.Column(db.String(50), nullable=False)
    is_recurring = db.Column(db.Boolean, default=False)
    recurrence_pattern = db.Column(db.String(10), nullable=True)  # daily/weekly/monthly
    recurrence_end_date = db.Column(db.Date, nullable=True)
    slot_duration = db.Column(db.Integer, default=30)  # in minutes
    break_duration = db.Column(db.Integer, default=0)  # in minutes
    status = db.Column(db.String(20), default='available')  # available/booked/cancelled/blocked/maintenance
    max_appointments_per_slot = db.Column(db.Integer, default=1)
    current_appointments = db.Column(db.Integer, default=0)
    appointment_type = db.Column(db.String(20), default='consultation')  # consultation/follow_up/emergency/telemedicine
    location = db.Column(db.JSON, nullable=False)
    pricing = db.Column(db.JSON, nullable=True)
    notes = db.Column(db.String(500), nullable=True)
    special_requirements = db.Column(db.JSON, nullable=True)  # Array of strings
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    slots = db.relationship('AppointmentSlot', backref='availability', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'provider_id': self.provider_id,
            'date': self.date.isoformat(),
            'start_time': self.start_time,
            'end_time': self.end_time,
            'timezone': self.timezone,
            'is_recurring': self.is_recurring,
            'recurrence_pattern': self.recurrence_pattern,
            'recurrence_end_date': self.recurrence_end_date.isoformat() if self.recurrence_end_date else None,
            'slot_duration': self.slot_duration,
            'break_duration': self.break_duration,
            'status': self.status,
            'max_appointments_per_slot': self.max_appointments_per_slot,
            'current_appointments': self.current_appointments,
            'appointment_type': self.appointment_type,
            'location': self.location,
            'pricing': self.pricing,
            'notes': self.notes,
            'special_requirements': self.special_requirements
        }

class AppointmentSlot(db.Model):
    """Model for individual appointment slots."""
    __tablename__ = 'appointment_slots'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    availability_id = db.Column(db.String(36), db.ForeignKey('provider_availability.id'), nullable=False)
    provider_id = db.Column(db.String(36), db.ForeignKey('provider.id'), nullable=False)
    slot_start_time = db.Column(db.DateTime, nullable=False)
    slot_end_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='available')  # available/booked/cancelled/blocked
    patient_id = db.Column(db.String(36), db.ForeignKey('patient.id'), nullable=True)
    appointment_type = db.Column(db.String(20), nullable=False)
    booking_reference = db.Column(db.String(50), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'availability_id': self.availability_id,
            'provider_id': self.provider_id,
            'slot_start_time': self.slot_start_time.isoformat(),
            'slot_end_time': self.slot_end_time.isoformat(),
            'status': self.status,
            'patient_id': self.patient_id,
            'appointment_type': self.appointment_type,
            'booking_reference': self.booking_reference
        }

# Add after the existing schemas

class LocationSchema(Schema):
    """Schema for location validation."""
    type = fields.Str(required=True, validate=validate.OneOf(
        ['clinic', 'hospital', 'telemedicine', 'home_visit']
    ))
    address = fields.Str(required=True)
    room_number = fields.Str(required=False, allow_none=True)

class PricingSchema(Schema):
    """Schema for pricing validation."""
    base_fee = fields.Float(required=True)
    insurance_accepted = fields.Bool(required=True)
    currency = fields.Str(required=False, default='USD')

class AvailabilitySchema(Schema):
    """Schema for provider availability validation."""
    date = fields.Date(required=True)
    start_time = fields.Str(required=True, validate=validate.Regexp(r'^([0-1][0-9]|2[0-3]):[0-5][0-9]$'))
    end_time = fields.Str(required=True, validate=validate.Regexp(r'^([0-1][0-9]|2[0-3]):[0-5][0-9]$'))
    timezone = fields.Str(required=True)
    slot_duration = fields.Int(required=False, default=30)
    break_duration = fields.Int(required=False, default=0)
    is_recurring = fields.Bool(required=False, default=False)
    recurrence_pattern = fields.Str(required=False, validate=validate.OneOf(['daily', 'weekly', 'monthly']))
    recurrence_end_date = fields.Date(required=False)
    appointment_type = fields.Str(required=False, default='consultation', validate=validate.OneOf(
        ['consultation', 'follow_up', 'emergency', 'telemedicine']
    ))
    location = fields.Nested(LocationSchema())
    pricing = fields.Nested(PricingSchema(), required=False)
    special_requirements = fields.List(fields.Str(), required=False)
    notes = fields.Str(required=False, validate=validate.Length(max=500))

    @validates('date')
    def validate_date(self, value):
        if value < datetime.now().date():
            raise ValidationError('Cannot create availability for past dates')
        return value


    @validates('slot_duration')
    def validate_slot_duration(self, value):
        if value < 15 or value > 240:
            raise ValidationError('Slot duration must be between 15 and 240 minutes')
        return value

availability_schema = AvailabilitySchema()

# Validation Schema
class ClinicAddressSchema(Schema):
    street = fields.Str(required=True, validate=validate.Length(max=200))
    city = fields.Str(required=True, validate=validate.Length(max=100))
    state = fields.Str(required=True, validate=validate.Length(max=50))
    zip = fields.Str(required=True, validate=validate.Regexp(r'^\d{5}(-\d{4})?$'))

class ProviderSchema(Schema):
    first_name = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    last_name = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    email = fields.Email(required=True)
    phone_number = fields.Str(required=True, validate=validate.Regexp(r'^\+[1-9]\d{1,14}$'))
    password = fields.Str(required=True, validate=validate.Regexp(
        r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
    ))
    confirm_password = fields.Str(required=True)
    specialization = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    license_number = fields.Str(required=True, validate=validate.Regexp(r'^[A-Za-z0-9]+$'))
    years_of_experience = fields.Int(required=True, validate=validate.Range(min=0, max=50))
    clinic_address = fields.Nested(ClinicAddressSchema(), required=True)

    def validate_confirm_password(self, value, data):
        if value != data['password']:
            raise ValidationError('Passwords do not match')

provider_schema = ProviderSchema()

class LoginSchema(Schema):
    """Schema for login validation."""
    identifier = fields.Str(required=True)
    password = fields.Str(required=True)
    remember_me = fields.Bool(missing=False)

login_schema = LoginSchema()

# After the Provider model and before the routes, update the schema classes:

class AddressSchema(Schema):
    """Schema for address validation."""
    street = fields.Str(required=True, validate=validate.Length(max=200))
    city = fields.Str(required=True, validate=validate.Length(max=100))
    state = fields.Str(required=True, validate=validate.Length(max=50))
    zip = fields.Str(required=True, validate=validate.Regexp(r'^\d{5}(-\d{4})?$'))

class EmergencyContactSchema(Schema):
    """Schema for emergency contact validation."""
    name = fields.Str(required=True, validate=validate.Length(max=100))
    phone = fields.Str(required=True, validate=validate.Regexp(r'^\+[1-9]\d{1,14}$'))
    relationship = fields.Str(required=True, validate=validate.Length(max=50))

class InsuranceInfoSchema(Schema):
    """Schema for insurance information validation."""
    provider = fields.Str(required=True)
    policy_number = fields.Str(required=True)

class PatientRegistrationSchema(Schema):
    """Schema for patient registration validation."""
    first_name = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    last_name = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    email = fields.Email(required=True)
    phone_number = fields.Str(required=True, validate=validate.Regexp(r'^\+[1-9]\d{1,14}$'))
    password = fields.Str(required=True, validate=validate.Regexp(
        r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
    ))
    confirm_password = fields.Str(required=True)
    date_of_birth = fields.Date(required=True)
    gender = fields.Str(required=True, validate=validate.OneOf(
        ['male', 'female', 'other', 'prefer_not_to_say']
    ))
    address = fields.Nested(AddressSchema())
    emergency_contact = fields.Nested(EmergencyContactSchema(), required=False, allow_none=True)
    medical_history = fields.List(fields.Str(), required=False, allow_none=True)
    insurance_info = fields.Nested(InsuranceInfoSchema(), required=False, allow_none=True)

    @validates('date_of_birth')
    def validate_age(self, value):
        today = datetime.now().date()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 13:
            raise ValidationError('Must be at least 13 years old')
        if value > today:
            raise ValidationError('Date of birth cannot be in the future')
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise ValidationError('Passwords do not match')
        return data

patient_schema = PatientRegistrationSchema()

class DeviceInfoSchema(Schema):
    """Schema for device information validation."""
    device_type = fields.Str(required=True)
    device_name = fields.Str(required=True)
    app_version = fields.Str(required=True)

class PatientLoginSchema(Schema):
    """Schema for patient login validation."""
    identifier = fields.Str(required=True)
    password = fields.Str(required=True)
    remember_me = fields.Bool(missing=False)
    device_info = fields.Nested(DeviceInfoSchema(), required=False, allow_none=True)

patient_login_schema = PatientLoginSchema()

def generate_tokens(provider_id: str, remember_me: bool = False) -> tuple:
    """Generate access and refresh tokens."""
    # Access token
    access_expires = app.config['JWT_ACCESS_TOKEN_EXPIRES']
    if remember_me:
        access_expires = app.config['JWT_REMEMBER_ME_EXPIRES']

    access_token = jwt.encode(
        {
            'provider_id': provider_id,
            'exp': datetime.utcnow() + timedelta(seconds=access_expires)
        },
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )

    # Refresh token
    refresh_expires = app.config['JWT_REFRESH_TOKEN_EXPIRES']
    if remember_me:
        refresh_expires = app.config['JWT_REMEMBER_ME_EXPIRES']

    refresh_token_value = str(uuid.uuid4())
    refresh_token = RefreshToken(
        provider_id=provider_id,
        token_hash=RefreshToken.hash_token(refresh_token_value),
        expires_at=datetime.utcnow() + timedelta(seconds=refresh_expires)
    )
    db.session.add(refresh_token)
    db.session.commit()

    return access_token, refresh_token_value, access_expires

# Helper functions
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def generate_verification_token(provider_id):
    return jwt.encode(
        {'provider_id': provider_id},
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )

# Add before the routes

def generate_time_slots(start_time: str, end_time: str, duration: int, break_duration: int = 0) -> list:
    """Generate time slots between start and end time with given duration and breaks."""
    slots = []
    current = datetime.strptime(start_time, '%H:%M')
    end = datetime.strptime(end_time, '%H:%M')
    
    while current + timedelta(minutes=duration) <= end:
        slot_end = current + timedelta(minutes=duration)
        slots.append({
            'start': current.strftime('%H:%M'),
            'end': slot_end.strftime('%H:%M')
        })
        current = slot_end + timedelta(minutes=break_duration)
    
    return slots

def get_next_date(current_date: datetime, pattern: str) -> datetime:
    """Get next date based on recurrence pattern."""
    if pattern == 'daily':
        return current_date + timedelta(days=1)
    elif pattern == 'weekly':
        return current_date + timedelta(weeks=1)
    elif pattern == 'monthly':
        # Handle month end cases
        year = current_date.year + (current_date.month // 12)
        month = (current_date.month % 12) + 1
        day = min(current_date.day, [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
        return datetime(year, month, day)
    return current_date

def create_appointment_slots(availability: ProviderAvailability) -> list:
    """Create individual appointment slots from availability."""
    slots = []
    current_date = availability.date
    end_date = availability.recurrence_end_date if availability.is_recurring else current_date

    while current_date <= end_date:
        # Generate time slots for the day
        day_slots = generate_time_slots(
            availability.start_time,
            availability.end_time,
            availability.slot_duration,
            availability.break_duration
        )

        # Create appointment slots
        for slot in day_slots:
            start_time = datetime.strptime(f"{current_date} {slot['start']}", '%Y-%m-%d %H:%M')
            end_time = datetime.strptime(f"{current_date} {slot['end']}", '%Y-%m-%d %H:%M')
            
            appointment_slot = AppointmentSlot(
                availability_id=availability.id,
                provider_id=availability.provider_id,
                slot_start_time=start_time,
                slot_end_time=end_time,
                status='available',
                appointment_type=availability.appointment_type
            )
            slots.append(appointment_slot)

        if availability.is_recurring:
            current_date = get_next_date(current_date, availability.recurrence_pattern).date()
        else:
            break

    return slots
\
\

@app.route('/api/v1/provider/register', methods=['POST'])
@swag_from({
    'tags': ['Provider Registration'],
    'summary': 'Register a new healthcare provider',
    'description': 'Register a new healthcare provider with validation and email verification',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'first_name': {'type': 'string', 'minLength': 2, 'maxLength': 50},
                    'last_name': {'type': 'string', 'minLength': 2, 'maxLength': 50},
                    'email': {'type': 'string', 'format': 'email'},
                    'phone_number': {'type': 'string', 'pattern': r'^\+[1-9]\d{1,14}$'},
                    'password': {'type': 'string', 'format': 'password'},
                    'confirm_password': {'type': 'string'},
                    'specialization': {'type': 'string', 'minLength': 3, 'maxLength': 100},
                    'license_number': {'type': 'string', 'pattern': '^[A-Za-z0-9]+$'},
                    'years_of_experience': {'type': 'integer', 'minimum': 0, 'maximum': 50},
                    'clinic_address': {
                        'type': 'object',
                        'properties': {
                            'street': {'type': 'string', 'maxLength': 200},
                            'city': {'type': 'string', 'maxLength': 100},
                            'state': {'type': 'string', 'maxLength': 50},
                            'zip': {'type': 'string', 'pattern': r'^\d{5}(-\d{4})?$'}
                        }
                    }
                }
            }
        }
    ],
    'responses': {
        '201': {
            'description': 'Provider registered successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'provider_id': {'type': 'string'},
                            'email': {'type': 'string'},
                            'verification_status': {'type': 'string'},
                            'verification_token': {'type': 'string'}
                        }
                    }
                }
            }
        },
        '409': {
            'description': 'Provider already exists',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'}
                }
            }
        },
        '422': {
            'description': 'Validation error',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'errors': {'type': 'object'}
                }
            }
        }
    }
})
def register_provider():
    try:
        # Validate request data
        data = provider_schema.load(request.json)
        
        # Check for existing provider
        if Provider.query.filter_by(email=data['email'].lower()).first():
            return jsonify({'success': False, 'message': 'Email already registered'}), 409
        if Provider.query.filter_by(phone_number=data['phone_number']).first():
            return jsonify({'success': False, 'message': 'Phone number already registered'}), 409
        if Provider.query.filter_by(license_number=data['license_number']).first():
            return jsonify({'success': False, 'message': 'License number already registered'}), 409

        # Create new provider
        provider = Provider(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'].lower(),
            phone_number=data['phone_number'],
            password_hash=hash_password(data['password']),
            specialization=data['specialization'],
            license_number=data['license_number'],
            years_of_experience=data['years_of_experience'],
            clinic_address=data['clinic_address']
        )
        
        db.session.add(provider)
        db.session.commit()

        # Generate verification token
        verification_token = generate_verification_token(provider.id)

        return jsonify({
            'success': True,
            'message': 'Provider registered successfully. Verification email sent.',
            'data': {
                'provider_id': provider.id,
                'email': provider.email,
                'verification_status': provider.verification_status,
                'verification_token': verification_token  # In production, send this via email
            }
        }), 201

    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Validation error',
            'errors': e.messages
        }), 422
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/v1/provider/verify/<token>', methods=['GET'])
@swag_from({
    'tags': ['Provider Registration'],
    'summary': 'Verify provider email',
    'description': 'Verify provider email using the verification token',
    'parameters': [
        {
            'name': 'token',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'Email verification token'
        }
    ],
    'responses': {
        '200': {
            'description': 'Email verified successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'provider_id': {'type': 'string'},
                            'email': {'type': 'string'},
                            'verification_status': {'type': 'string'}
                        }
                    }
                }
            }
        },
        '400': {
            'description': 'Invalid token or already verified',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'}
                }
            }
        }
    }
})
def verify_email(token):
    try:
        # Decode token
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        provider_id = payload['provider_id']

        # Update provider status
        provider = db.session.get(Provider, provider_id)
        if not provider:
            return jsonify({'success': False, 'message': 'Provider not found'}), 404

        if provider.verification_status == 'verified':
            return jsonify({'success': False, 'message': 'Email already verified'}), 400

        provider.verification_status = 'verified'
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Email verified successfully',
            'data': {
                'provider_id': provider.id,
                'email': provider.email,
                'verification_status': provider.verification_status
            }
        }), 200

    except jwt.InvalidTokenError:
        return jsonify({'success': False, 'message': 'Invalid verification token'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/v1/provider/login', methods=['POST'])
@swag_from({
    'tags': ['Provider Authentication'],
    'summary': 'Provider login',
    'description': 'Login with email/phone and password',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'identifier': {
                        'type': 'string',
                        'description': 'Email or phone number'
                    },
                    'password': {
                        'type': 'string',
                        'format': 'password'
                    },
                    'remember_me': {
                        'type': 'boolean',
                        'default': False
                    }
                }
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Login successful',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'access_token': {'type': 'string'},
                            'refresh_token': {'type': 'string'},
                            'expires_in': {'type': 'integer'},
                            'token_type': {'type': 'string'},
                            'provider': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'first_name': {'type': 'string'},
                                    'last_name': {'type': 'string'},
                                    'email': {'type': 'string'},
                                    'specialization': {'type': 'string'},
                                    'verification_status': {'type': 'string'},
                                    'is_active': {'type': 'boolean'}
                                }
                            }
                        }
                    }
                }
            }
        },
        '401': {
            'description': 'Invalid credentials',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'error_code': {'type': 'string'}
                }
            }
        }
    }
})
def login():
    try:
        # Validate request data
        data = login_schema.load(request.json)
        identifier = data['identifier']
        password = data['password']
        remember_me = data.get('remember_me', False)

        # Find provider by email or phone
        provider = Provider.query.filter(
            (Provider.email == identifier) | (Provider.phone_number == identifier)
        ).first()

        if not provider:
            return jsonify({
                'success': False,
                'message': 'Invalid credentials',
                'error_code': 'INVALID_CREDENTIALS'
            }), 401

        # Check if account is locked
        if provider.is_locked():
            return jsonify({
                'success': False,
                'message': f'Account is locked. Try again after {provider.locked_until}',
                'error_code': 'ACCOUNT_LOCKED'
            }), 423

        # Verify password
        if not provider.check_password(password):
            provider.increment_failed_attempts()
            return jsonify({
                'success': False,
                'message': 'Invalid credentials',
                'error_code': 'INVALID_CREDENTIALS'
            }), 401

        # Check if account is verified
        if provider.verification_status != 'verified':
            return jsonify({
                'success': False,
                'message': 'Account is not verified',
                'error_code': 'UNVERIFIED_ACCOUNT'
            }), 403

        # Check if account is active
        if not provider.is_active:
            return jsonify({
                'success': False,
                'message': 'Account is inactive',
                'error_code': 'INACTIVE_ACCOUNT'
            }), 403

        # Generate tokens
        access_token, refresh_token, expires_in = generate_tokens(provider.id, remember_me)

        # Update provider login info
        provider.last_login = datetime.utcnow()
        provider.login_count += 1
        provider.reset_failed_attempts()
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'expires_in': expires_in,
                'token_type': 'Bearer',
                'provider': provider.to_dict()
            }
        }), 200

    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Validation error',
            'errors': e.messages
        }), 422
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/v1/provider/refresh', methods=['POST'])
@swag_from({
    'tags': ['Provider Authentication'],
    'summary': 'Refresh access token',
    'description': 'Get new access token using refresh token',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'refresh_token': {
                        'type': 'string',
                        'description': 'Refresh token'
                    }
                }
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Token refreshed successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'access_token': {'type': 'string'},
                            'expires_in': {'type': 'integer'}
                        }
                    }
                }
            }
        }
    }
})
def refresh_token():
    try:
        refresh_token = request.json.get('refresh_token')
        if not refresh_token:
            return jsonify({
                'success': False,
                'message': 'Refresh token is required',
                'error_code': 'MISSING_TOKEN'
            }), 400

        # Find refresh token in database
        stored_token = RefreshToken.query.filter_by(
            token_hash=RefreshToken.hash_token(refresh_token),
            is_revoked=False
        ).first()

        if not stored_token:
            return jsonify({
                'success': False,
                'message': 'Invalid refresh token',
                'error_code': 'INVALID_TOKEN'
            }), 401

        # Check if token is expired
        if stored_token.expires_at < datetime.utcnow():
            stored_token.is_revoked = True
            db.session.commit()
            return jsonify({
                'success': False,
                'message': 'Refresh token has expired',
                'error_code': 'TOKEN_EXPIRED'
            }), 401

        # Generate new access token
        access_token = jwt.encode(
            {
                'provider_id': stored_token.provider_id,
                'exp': datetime.utcnow() + timedelta(seconds=app.config['JWT_ACCESS_TOKEN_EXPIRES'])
            },
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )

        # Update last used timestamp
        stored_token.last_used_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Token refreshed successfully',
            'data': {
                'access_token': access_token,
                'expires_in': app.config['JWT_ACCESS_TOKEN_EXPIRES']
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/v1/provider/logout', methods=['POST'])
@jwt_required
@swag_from({
    'tags': ['Provider Authentication'],
    'summary': 'Provider logout',
    'description': 'Revoke refresh token and invalidate session',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'refresh_token': {
                        'type': 'string',
                        'description': 'Refresh token to revoke'
                    }
                }
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Logged out successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'}
                }
            }
        }
    }
})
def logout():
    try:
        refresh_token = request.json.get('refresh_token')
        if refresh_token:
            stored_token = RefreshToken.query.filter_by(
                token_hash=RefreshToken.hash_token(refresh_token),
                provider_id=request.provider.id,
                is_revoked=False
            ).first()

            if stored_token:
                stored_token.is_revoked = True
                db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Logged out successfully'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/v1/provider/logout-all', methods=['POST'])
@jwt_required
@swag_from({
    'tags': ['Provider Authentication'],
    'summary': 'Logout from all devices',
    'description': 'Revoke all refresh tokens for the provider',
    'security': [{'Bearer': []}],
    'responses': {
        '200': {
            'description': 'Logged out from all devices successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'}
                }
            }
        }
    }
})
def logout_all():
    try:
        # Revoke all refresh tokens for the provider
        RefreshToken.query.filter_by(
            provider_id=request.provider.id,
            is_revoked=False
        ).update({'is_revoked': True})
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Logged out from all devices successfully'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/v1/patient/register', methods=['POST'])
@swag_from({
    'tags': ['Patient Registration'],
    'summary': 'Register a new patient',
    'description': 'Register a new patient with validation and verification',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'first_name': {'type': 'string', 'minLength': 2, 'maxLength': 50},
                    'last_name': {'type': 'string', 'minLength': 2, 'maxLength': 50},
                    'email': {'type': 'string', 'format': 'email'},
                    'phone_number': {'type': 'string', 'pattern': r'^\+[1-9]\d{1,14}$'},
                    'password': {'type': 'string', 'format': 'password'},
                    'confirm_password': {'type': 'string'},
                    'date_of_birth': {'type': 'string', 'format': 'date'},
                    'gender': {'type': 'string', 'enum': ['male', 'female', 'other', 'prefer_not_to_say']},
                    'address': {
                        'type': 'object',
                        'properties': {
                            'street': {'type': 'string', 'maxLength': 200},
                            'city': {'type': 'string', 'maxLength': 100},
                            'state': {'type': 'string', 'maxLength': 50},
                            'zip': {'type': 'string', 'pattern': r'^\d{5}(-\d{4})?$'}
                        }
                    },
                    'emergency_contact': {
                        'type': 'object',
                        'properties': {
                            'name': {'type': 'string', 'maxLength': 100},
                            'phone': {'type': 'string', 'pattern': r'^\+[1-9]\d{1,14}$'},
                            'relationship': {'type': 'string', 'maxLength': 50}
                        }
                    },
                    'medical_history': {
                        'type': 'array',
                        'items': {'type': 'string'}
                    },
                    'insurance_info': {
                        'type': 'object',
                        'properties': {
                            'provider': {'type': 'string'},
                            'policy_number': {'type': 'string'}
                        }
                    }
                }
            }
        }
    ],
    'responses': {
        '201': {
            'description': 'Patient registered successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'patient_id': {'type': 'string'},
                            'email': {'type': 'string'},
                            'phone_number': {'type': 'string'},
                            'email_verified': {'type': 'boolean'},
                            'phone_verified': {'type': 'boolean'}
                        }
                    }
                }
            }
        },
        '422': {
            'description': 'Validation error',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'errors': {'type': 'object'}
                }
            }
        }
    }
})
def register_patient():
    try:
        # Validate request data
        data = patient_schema.load(request.json)
        
        # Check for existing patient
        if Patient.query.filter_by(email=data['email'].lower()).first():
            return jsonify({
                'success': False,
                'message': 'Email already registered',
                'error_code': 'DUPLICATE_ACCOUNT',
                'existing_fields': ['email']
            }), 409

        if Patient.query.filter_by(phone_number=data['phone_number']).first():
            return jsonify({
                'success': False,
                'message': 'Phone number already registered',
                'error_code': 'DUPLICATE_ACCOUNT',
                'existing_fields': ['phone_number']
            }), 409

        # Hash password
        password_hash = bcrypt.hashpw(
            data['password'].encode('utf-8'),
            bcrypt.gensalt(rounds=12)
        ).decode('utf-8')

        # Create patient
        patient = Patient(
            first_name=data['first_name'].strip(),
            last_name=data['last_name'].strip(),
            email=data['email'].lower().strip(),
            phone_number=data['phone_number'].strip(),
            password_hash=password_hash,
            date_of_birth=data['date_of_birth'],
            gender=data['gender'],
            address={
                'street': data['address']['street'].strip(),
                'city': data['address']['city'].strip(),
                'state': data['address']['state'].strip(),
                'zip': data['address']['zip'].strip()
            }
        )

        # Add optional fields
        if 'emergency_contact' in data:
            patient.emergency_contact = {
                'name': data['emergency_contact']['name'].strip(),
                'phone': data['emergency_contact']['phone'].strip(),
                'relationship': data['emergency_contact']['relationship'].strip()
            }

        if 'medical_history' in data:
            patient.medical_history = [item.strip() for item in data['medical_history']]

        if 'insurance_info' in data:
            patient.insurance_info = {
                'provider': data['insurance_info']['provider'].strip(),
                'policy_number': data['insurance_info']['policy_number'].strip()
            }

        db.session.add(patient)
        db.session.commit()

        # Generate verification token
        verification_token = generate_verification_token(patient.id)

        # In a production environment, you would send an email here
        # For now, we'll just return the token in the response
        return jsonify({
            'success': True,
            'message': 'Patient registered successfully. Verification email sent.',
            'data': {
                'patient_id': patient.id,
                'email': patient.email,
                'phone_number': patient.phone_number,
                'email_verified': patient.email_verified,
                'phone_verified': patient.phone_verified,
                'verification_token': verification_token  # Remove in production
            }
        }), 201

    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Validation failed',
            'errors': e.messages
        }), 422
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/v1/patient/login', methods=['POST'])
@swag_from({
    'tags': ['Patient Authentication'],
    'summary': 'Patient login',
    'description': 'Login with email/phone and password',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'identifier': {
                        'type': 'string',
                        'description': 'Email or phone number'
                    },
                    'password': {
                        'type': 'string',
                        'format': 'password'
                    },
                    'remember_me': {
                        'type': 'boolean',
                        'default': False
                    },
                    'device_info': {
                        'type': 'object',
                        'properties': {
                            'device_type': {'type': 'string'},
                            'device_name': {'type': 'string'},
                            'app_version': {'type': 'string'}
                        }
                    }
                }
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Login successful',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'access_token': {'type': 'string'},
                            'refresh_token': {'type': 'string'},
                            'expires_in': {'type': 'integer'},
                            'token_type': {'type': 'string'},
                            'patient': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'first_name': {'type': 'string'},
                                    'last_name': {'type': 'string'},
                                    'email': {'type': 'string'},
                                    'phone_number': {'type': 'string'},
                                    'email_verified': {'type': 'boolean'},
                                    'phone_verified': {'type': 'boolean'},
                                    'is_active': {'type': 'boolean'},
                                    'last_login': {'type': 'string'}
                                }
                            }
                        }
                    }
                }
            }
        },
        '401': {
            'description': 'Invalid credentials',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'error_code': {'type': 'string'}
                }
            }
        }
    }
})
def patient_login():
    try:
        # Validate request data
        data = patient_login_schema.load(request.json)
        identifier = data['identifier']
        password = data['password']
        remember_me = data.get('remember_me', False)
        device_info = data.get('device_info')

        # Find patient by email or phone
        patient = Patient.query.filter(
            (Patient.email == identifier) | (Patient.phone_number == identifier)
        ).first()

        if not patient:
            return jsonify({
                'success': False,
                'message': 'Invalid credentials',
                'error_code': 'INVALID_CREDENTIALS'
            }), 401

        # Check if account is locked
        is_locked, lock_until = patient.is_locked()
        if is_locked:
            return jsonify({
                'success': False,
                'message': f'Account is locked. Try again after {lock_until}',
                'error_code': 'ACCOUNT_LOCKED',
                'locked_until': lock_until.isoformat()
            }), 423

        # Verify password
        if not patient.check_password(password):
            patient.increment_failed_attempts()
            return jsonify({
                'success': False,
                'message': 'Invalid credentials',
                'error_code': 'INVALID_CREDENTIALS'
            }), 401

        # Check if account is active
        if not patient.is_active:
            return jsonify({
                'success': False,
                'message': 'Account is inactive',
                'error_code': 'INACTIVE_ACCOUNT'
            }), 403

        # Generate tokens
        access_token = jwt.encode(
            {
                'patient_id': patient.id,
                'email': patient.email,
                'exp': datetime.utcnow() + timedelta(minutes=30)
            },
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )

        refresh_token = str(uuid.uuid4())
        
        # Create session
        session = PatientSession(
            patient_id=patient.id,
            refresh_token_hash=PatientSession.hash_token(refresh_token),
            device_info=device_info,
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string,
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        
        db.session.add(session)

        # Record login
        patient.record_login(request.remote_addr, request.user_agent.string)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'expires_in': 1800,  # 30 minutes
                'token_type': 'Bearer',
                'patient': patient.to_dict()
            }
        }), 200

    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Validation error',
            'errors': e.messages
        }), 422
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# Add a test endpoint to verify email
@app.route('/api/v1/patient/verify-test/<patient_id>', methods=['GET'])
def verify_patient_test(patient_id):
    """Test endpoint to verify patient email (for development only)"""
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({
                'success': False,
                'message': 'Patient not found'
            }), 404

        patient.email_verified = True
        patient.phone_verified = True
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Patient verified successfully',
            'data': {
                'patient_id': patient.id,
                'email': patient.email,
                'email_verified': patient.email_verified,
                'phone_verified': patient.phone_verified
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/v1/patient/refresh', methods=['POST'])
@patient_jwt_required
@swag_from({
    'tags': ['Patient Authentication'],
    'summary': 'Refresh access token',
    'description': 'Get new access token using refresh token',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'refresh_token': {
                        'type': 'string',
                        'description': 'Refresh token'
                    }
                }
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Token refreshed successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'access_token': {'type': 'string'},
                            'expires_in': {'type': 'integer'}
                        }
                    }
                }
            }
        }
    }
})
def patient_refresh_token():
    try:
        refresh_token = request.json.get('refresh_token')
        if not refresh_token:
            return jsonify({
                'success': False,
                'message': 'Refresh token is required',
                'error_code': 'MISSING_TOKEN'
            }), 400

        # Find refresh token in database
        stored_token = PatientSession.query.filter_by(
            refresh_token_hash=PatientSession.hash_token(refresh_token),
            is_revoked=False
        ).first()

        if not stored_token:
            return jsonify({
                'success': False,
                'message': 'Invalid refresh token',
                'error_code': 'INVALID_TOKEN'
            }), 401

        # Check if token is expired
        if stored_token.expires_at < datetime.utcnow():
            stored_token.is_revoked = True
            db.session.commit()
            return jsonify({
                'success': False,
                'message': 'Refresh token has expired',
                'error_code': 'TOKEN_EXPIRED'
            }), 401

        # Generate new access token
        access_token = jwt.encode(
            {
                'patient_id': stored_token.patient_id,
                'exp': datetime.utcnow() + timedelta(seconds=app.config['JWT_ACCESS_TOKEN_EXPIRES'])
            },
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )

        # Update last used timestamp
        stored_token.last_used_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Token refreshed successfully',
            'data': {
                'access_token': access_token,
                'expires_in': app.config['JWT_ACCESS_TOKEN_EXPIRES']
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/v1/patient/logout', methods=['POST'])
@patient_jwt_required
@swag_from({
    'tags': ['Patient Authentication'],
    'summary': 'Patient logout',
    'description': 'Revoke refresh token and invalidate session',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'Authorization',
            'in': 'header',
            'type': 'string',
            'required': True,
            'description': 'Bearer token for authentication (e.g., Bearer eyJhbGciOiJIUzI1NiIs...)'
        },
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'refresh_token': {
                        'type': 'string',
                        'description': 'Refresh token to revoke'
                    }
                }
            }
        }
    ],
    'responses': {
        '200': {
            'description': 'Logged out successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'}
                }
            }
        },
        '401': {
            'description': 'Missing or invalid authentication token',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'error_code': {'type': 'string'}
                }
            }
        }
    }
})
def patient_logout():
    try:
        refresh_token = request.json.get('refresh_token')
        if refresh_token:
            stored_token = PatientSession.query.filter_by(
                refresh_token_hash=PatientSession.hash_token(refresh_token),
                patient_id=request.patient.id,
                is_revoked=False
            ).first()

            if stored_token:
                stored_token.is_revoked = True
                db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Logged out successfully'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/v1/patient/logout-all', methods=['POST'])
@patient_jwt_required
@swag_from({
    'tags': ['Patient Authentication'],
    'summary': 'Logout from all devices',
    'description': 'Revoke all refresh tokens for the patient',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'Authorization',
            'in': 'header',
            'type': 'string',
            'required': True,
            'description': 'Bearer token for authentication (e.g., Bearer eyJhbGciOiJIUzI1NiIs...)'
        }
    ],
    'responses': {
        '200': {
            'description': 'Logged out from all devices successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'}
                }
            }
        },
        '401': {
            'description': 'Missing or invalid authentication token',
            'schema': {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'error_code': {'type': 'string'}
                }
            }
        }
    }
})
def patient_logout_all():
    try:
        # Revoke all refresh tokens for the patient
        PatientSession.query.filter_by(
            patient_id=request.patient.id,
            is_revoked=False
        ).update({'is_revoked': True})
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Logged out from all devices successfully'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# Add after the existing routes

@app.route('/api/v1/provider/availability', methods=['POST'])
@jwt_required
@swag_from({
    'tags': ['Provider Availability'],
    'summary': 'Create availability slots',
    'description': 'Create new availability slots for a provider',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'date': {'type': 'string', 'format': 'date'},
                    'start_time': {'type': 'string', 'pattern': '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'},
                    'end_time': {'type': 'string', 'pattern': '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'},
                    'timezone': {'type': 'string'},
                    'slot_duration': {'type': 'integer', 'minimum': 15, 'maximum': 240},
                    'break_duration': {'type': 'integer', 'minimum': 0},
                    'is_recurring': {'type': 'boolean'},
                    'recurrence_pattern': {'type': 'string', 'enum': ['daily', 'weekly', 'monthly']},
                    'recurrence_end_date': {'type': 'string', 'format': 'date'},
                    'appointment_type': {'type': 'string'},
                    'location': {
                        'type': 'object',
                        'properties': {
                            'type': {'type': 'string'},
                            'address': {'type': 'string'},
                            'room_number': {'type': 'string'}
                        }
                    },
                    'pricing': {
                        'type': 'object',
                        'properties': {
                            'base_fee': {'type': 'number'},
                            'insurance_accepted': {'type': 'boolean'},
                            'currency': {'type': 'string'}
                        }
                    }
                }
            }
        }
    ]
})
def create_availability():
    try:
        # Validate request data
        data = availability_schema.load(request.json)
        
        # Create availability record
        availability = ProviderAvailability(
            provider_id=request.provider.id,
            date=data['date'],
            start_time=data['start_time'],
            end_time=data['end_time'],
            timezone=data['timezone'],
            slot_duration=data.get('slot_duration', 30),
            break_duration=data.get('break_duration', 0),
            is_recurring=data.get('is_recurring', False),
            recurrence_pattern=data.get('recurrence_pattern'),
            recurrence_end_date=data.get('recurrence_end_date'),
            appointment_type=data.get('appointment_type', 'consultation'),
            location=data['location'],
            pricing=data.get('pricing'),
            special_requirements=data.get('special_requirements', []),
            notes=data.get('notes')
        )
        
        # Check for conflicts
        start_time = datetime.combine(data['date'], datetime.strptime(data['start_time'], '%H:%M').time())
        end_time = datetime.combine(data['date'], datetime.strptime(data['end_time'], '%H:%M').time())

        # Save availability
        db.session.add(availability)
        db.session.commit()

        # Create appointment slots
        slots = create_appointment_slots(availability)
        db.session.bulk_save_objects(slots)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Availability slots created successfully',
            'data': {
                'availability_id': availability.id,
                'slots_created': len(slots),
                'date_range': {
                    'start': data['date'].isoformat(),
                    'end': data['recurrence_end_date'].isoformat() if data.get('recurrence_end_date') else data['date'].isoformat()
                },
                'total_appointments_available': len(slots)
            }
        }), 201

    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Validation error',
            'errors': e.messages
        }), 422
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/v1/provider/<provider_id>/availability', methods=['GET'])
@swag_from({
    'tags': ['Provider Availability'],
    'summary': 'Get provider availability',
    'description': 'Get availability slots for a provider',
    'parameters': [
        {
            'name': 'start_date',
            'in': 'query',
            'type': 'string',
            'format': 'date',
            'required': True
        },
        {
            'name': 'end_date',
            'in': 'query',
            'type': 'string',
            'format': 'date',
            'required': True
        },
        {
            'name': 'status',
            'in': 'query',
            'type': 'string',
            'enum': ['available', 'booked', 'cancelled', 'blocked'],
            'required': False
        },
        {
            'name': 'appointment_type',
            'in': 'query',
            'type': 'string',
            'required': False
        }
    ]
})
def get_provider_availability(provider_id):
    try:
        # Validate dates
        start_date = datetime.strptime(request.args.get('start_date'), '%Y-%m-%d').date()
        end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d').date()
        status = request.args.get('status')
        appointment_type = request.args.get('appointment_type')

        # Build query
        query = AppointmentSlot.query.filter(AppointmentSlot.provider_id == provider_id)

        if status:
            query = query.filter(AppointmentSlot.status == status)
        if appointment_type:
            query = query.filter(AppointmentSlot.appointment_type == appointment_type)

        slots = query.all()

        # Group slots by date
        slots_by_date = {}
        for slot in slots:
            date_str = slot.slot_start_time.date().isoformat()
            if date_str not in slots_by_date:
                slots_by_date[date_str] = []
            slots_by_date[date_str].append(slot.to_dict())

        # Get availability summary
        total_slots = len(slots)
        available_slots = sum(1 for slot in slots if slot.status == 'available')
        booked_slots = sum(1 for slot in slots if slot.status == 'booked')
        cancelled_slots = sum(1 for slot in slots if slot.status == 'cancelled')

        return jsonify({
            'success': True,
            'data': {
                'provider_id': provider_id,
                'availability_summary': {
                    'total_slots': total_slots,
                    'available_slots': available_slots,
                    'booked_slots': booked_slots,
                    'cancelled_slots': cancelled_slots
                },
                'availability': [
                    {
                        'date': date,
                        'slots': slots
                    }
                    for date, slots in slots_by_date.items()
                ]
            }
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': 'Invalid date format. Use YYYY-MM-DD'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# Create tables and run app
def init_db():
    """Initialize the database and create all tables."""
    try:
        # Remove the database file if it exists
        # if os.path.exists('health_first.db'):
        #     os.remove('health_first.db')
        #     print("Removed existing database.")

        with app.app_context():
            # Create all tables
            db.create_all()
            print("Database initialized successfully!")
            
            # List all created tables
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print("\nAvailable tables:")
            for table in tables:
                print(f"- {table}")
                
            print(f"\nDatabase location: {os.path.join(basedir, 'health_first.db')}")
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        raise

# Add CORS support
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


# Add appointment booking endpoint
@app.route('/api/v1/appointment/book', methods=['POST'])
@patient_jwt_required
def book_appointment():
    try:
        # Get patient ID from JWT token
        token = request.headers.get('Authorization').split(' ')[1]
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        patient_id = payload['patient_id']
        
        # Validate request data
        data = request.get_json()
        slot_id = data.get('slot_id')
        notes = data.get('notes', '')
        
        if not slot_id:
            return jsonify({
                'success': False,
                'message': 'Slot ID is required',
                'error_code': 'MISSING_SLOT_ID'
            }), 400
        
        # Find the appointment slot
        slot = db.session.get(AppointmentSlot, slot_id)
        if not slot:
            return jsonify({
                'success': False,
                'message': 'Appointment slot not found'
            }), 404
        
        # Check if slot is available
        if slot.status != 'available':
            return jsonify({
                'success': False,
                'message': f'Slot is not available (status: {slot.status})'
            }), 409
        
        # Generate booking reference
        booking_reference = f"APT-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Update the slot
        slot.status = 'booked'
        slot.patient_id = patient_id
        slot.booking_reference = booking_reference
        slot.updated_at = datetime.utcnow()
        
        # Commit the changes
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Appointment booked successfully',
            'data': {
                'booking_reference': booking_reference,
                'appointment_id': slot.id,
                'slot_id': slot_id,
                'patient_id': patient_id,
                'provider_id': slot.provider_id,
                'appointment_time': slot.slot_start_time.isoformat(),
                'appointment_type': slot.appointment_type,
                'notes': notes
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error booking appointment: {str(e)}'
        }), 500


# Add cancel appointment endpoint
@app.route('/api/v1/appointment/cancel', methods=['POST'])
@patient_jwt_required
def cancel_appointment():
    try:
        token = request.headers.get('Authorization').split(' ')[1]
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        patient_id = payload['patient_id']
        data = request.get_json()
        slot_id = data.get('slot_id')
        cancellation_reason = data.get('cancellation_reason', '')
        if not slot_id:
            return jsonify({'success': False, 'message': 'Slot ID is required'}), 400
        slot = db.session.get(AppointmentSlot, slot_id)
        if not slot:
            return jsonify({'success': False, 'message': 'Appointment slot not found'}), 404
        if slot.status != 'booked' or slot.patient_id != patient_id:
            return jsonify({'success': False, 'message': 'Appointment not found or not booked by you'}), 404
        if slot.slot_start_time <= datetime.utcnow():
            return jsonify({'success': False, 'message': 'Cannot cancel past appointments'}), 400
        slot.status = 'cancelled'
        slot.patient_id = None
        slot.booking_reference = None
        slot.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'success': True, 'message': 'Appointment cancelled successfully', 'data': {'appointment_id': slot.id, 'slot_id': slot_id, 'cancelled_time': slot.updated_at.isoformat(), 'cancellation_reason': cancellation_reason, 'original_appointment_time': slot.slot_start_time.isoformat()}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error cancelling appointment: {str(e)}'}), 500

# Add update appointment endpoint
@app.route('/api/v1/appointment/update', methods=['PUT'])
@patient_jwt_required
def update_appointment():
    try:
        token = request.headers.get('Authorization').split(' ')[1]
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        patient_id = payload['patient_id']
        data = request.get_json()
        current_slot_id = data.get('current_slot_id')
        new_slot_id = data.get('new_slot_id')
        notes = data.get('notes', '')
        if not current_slot_id or not new_slot_id:
            return jsonify({'success': False, 'message': 'Both current_slot_id and new_slot_id are required'}), 400
        current_slot = db.session.get(AppointmentSlot, current_slot_id)
        if not current_slot:
            return jsonify({'success': False, 'message': 'Current appointment slot not found'}), 404
        if current_slot.status != 'booked' or current_slot.patient_id != patient_id:
            return jsonify({'success': False, 'message': 'Current appointment not found or not booked by you'}), 404
        new_slot = db.session.get(AppointmentSlot, new_slot_id)
        if not new_slot:
            return jsonify({'success': False, 'message': 'New appointment slot not found'}), 404
        if new_slot.status != 'available':
            return jsonify({'success': False, 'message': f'New slot is not available (status: {new_slot.status})'}), 409
        if new_slot.slot_start_time <= datetime.utcnow():
            return jsonify({'success': False, 'message': 'Cannot book appointments in the past'}), 400
        new_booking_reference = f"APT-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        current_slot.status = 'cancelled'
        current_slot.patient_id = None
        current_slot.booking_reference = None
        current_slot.updated_at = datetime.utcnow()
        new_slot.status = 'booked'
        new_slot.patient_id = patient_id
        new_slot.booking_reference = new_booking_reference
        new_slot.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'success': True, 'message': 'Appointment updated successfully', 'data': {'old_appointment_id': current_slot.id, 'new_appointment_id': new_slot.id, 'old_slot_id': current_slot_id, 'new_slot_id': new_slot_id, 'patient_id': patient_id, 'provider_id': new_slot.provider_id, 'new_appointment_time': new_slot.slot_start_time.isoformat(), 'new_appointment_type': new_slot.appointment_type, 'new_booking_reference': new_booking_reference, 'notes': notes, 'updated_at': new_slot.updated_at.isoformat()}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error updating appointment: {str(e)}'}), 500


# Add view appointment list endpoint
@app.route('/api/v1/appointment/list', methods=['GET'])
@patient_jwt_required
def view_appointment_list():
    try:
        # Get patient ID from JWT token
        token = request.headers.get('Authorization').split(' ')[1]
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        patient_id = payload['patient_id']
        
        # Initialize query for patient's appointments
        query = AppointmentSlot.query.filter(AppointmentSlot.patient_id == patient_id)
        
        # Get query parameters for filtering
        status_filter = request.args.get('status', None)  # booked, cancelled, all
        start_date = request.args.get('start_date', None)
        end_date = request.args.get('end_date', None)
        provider_id = request.args.get('provider_id', None)
        
        # Apply filters
        if status_filter and status_filter != 'all':
            query = query.filter(AppointmentSlot.status == status_filter)
        
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                query = query.filter(AppointmentSlot.slot_start_time >= datetime.combine(start_date_obj, datetime.min.time()))
            except ValueError:
                return jsonify({'success': False, 'message': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
        
        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                query = query.filter(AppointmentSlot.slot_end_time <= datetime.combine(end_date_obj, datetime.max.time()))
            except ValueError:
                return jsonify({'success': False, 'message': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
        
        if provider_id:
            query = query.filter(AppointmentSlot.provider_id == provider_id)
        
        # Order by appointment time (most recent first)
        query = query.order_by(AppointmentSlot.slot_start_time.desc())
        
        # Execute query
        appointments = query.all()
        
        # Get provider information for each appointment
        appointment_list = []
        for appointment in appointments:
            # Get provider details
            provider = db.session.get(Provider, appointment.provider_id)
            provider_info = {
                'id': provider.id if provider else None,
                'name': f"{provider.first_name} {provider.last_name}" if provider else 'Unknown Provider',
                'specialization': provider.specialization if provider else None,
                'email': provider.email if provider else None
            } if provider else None
            
            appointment_data = {
                'appointment_id': appointment.id,
                'slot_id': appointment.id,
                'booking_reference': appointment.booking_reference,
                'status': appointment.status,
                'appointment_date': appointment.slot_start_time.date().isoformat(),
                'appointment_time': appointment.slot_start_time.time().isoformat(),
                'appointment_end_time': appointment.slot_end_time.time().isoformat(),
                'appointment_type': appointment.appointment_type,
                'provider': provider_info,
                'created_at': appointment.created_at.isoformat(),
                'updated_at': appointment.updated_at.isoformat(),
                'is_past': appointment.slot_start_time < datetime.utcnow(),
                'is_today': appointment.slot_start_time.date() == datetime.utcnow().date(),
                'is_upcoming': appointment.slot_start_time > datetime.utcnow()
            }
            appointment_list.append(appointment_data)
        
        # Calculate summary statistics
        total_appointments = len(appointments)
        booked_appointments = sum(1 for apt in appointments if apt.status == 'booked')
        cancelled_appointments = sum(1 for apt in appointments if apt.status == 'cancelled')
        past_appointments = sum(1 for apt in appointments if apt.slot_start_time < datetime.utcnow())
        upcoming_appointments = sum(1 for apt in appointments if apt.slot_start_time > datetime.utcnow())
        
        return jsonify({
            'success': True,
            'message': 'Appointment list retrieved successfully',
            'data': {
                'patient_id': patient_id,
                'summary': {
                    'total_appointments': total_appointments,
                    'booked_appointments': booked_appointments,
                    'cancelled_appointments': cancelled_appointments,
                    'past_appointments': past_appointments,
                    'upcoming_appointments': upcoming_appointments
                },
                'filters_applied': {
                    'status': status_filter,
                    'start_date': start_date,
                    'end_date': end_date,
                    'provider_id': provider_id
                },
                'appointments': appointment_list
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving appointment list: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Initialize database
    init_db()
    # Run the app - expose to all network interfaces
    app.run(host='0.0.0.0', port=5007, debug=True)
