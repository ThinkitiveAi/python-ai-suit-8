"""Provider schema validation using Marshmallow."""
from marshmallow import Schema, fields, validate, validates, ValidationError
import phonenumbers
from src.core.config import Config

class ClinicAddressSchema(Schema):
    """Schema for clinic address validation."""
    street = fields.Str(
        required=True,
        validate=validate.Length(max=200, error="Street address cannot exceed 200 characters")
    )
    city = fields.Str(
        required=True,
        validate=validate.Length(max=100, error="City name cannot exceed 100 characters")
    )
    state = fields.Str(
        required=True,
        validate=validate.Length(max=50, error="State name cannot exceed 50 characters")
    )
    zip = fields.Str(
        required=True,
        validate=validate.Regexp(
            r'^\d{5}(-\d{4})?$',
            error="Invalid ZIP code format. Must be 5 digits or 5+4 digits"
        )
    )

class ProviderRegistrationSchema(Schema):
    """Schema for provider registration validation."""
    first_name = fields.Str(
        required=True,
        validate=validate.Length(
            min=2, max=50,
            error="First name must be between 2 and 50 characters"
        )
    )
    last_name = fields.Str(
        required=True,
        validate=validate.Length(
            min=2, max=50,
            error="Last name must be between 2 and 50 characters"
        )
    )
    email = fields.Email(
        required=True,
        validate=validate.Length(max=255, error="Email is too long")
    )
    phone_number = fields.Str(required=True)
    password = fields.Str(
        required=True,
        validate=validate.Regexp(
            r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$',
            error="Password must be at least 8 characters long and contain at least one uppercase letter, "
                  "one lowercase letter, one number, and one special character"
        )
    )
    confirm_password = fields.Str(required=True)
    specialization = fields.Str(
        required=True,
        validate=validate.Length(
            min=3, max=100,
            error="Specialization must be between 3 and 100 characters"
        )
    )
    license_number = fields.Str(
        required=True,
        validate=validate.Regexp(
            r'^[A-Za-z0-9]+$',
            error="License number must contain only letters and numbers"
        )
    )
    years_of_experience = fields.Int(
        required=True,
        validate=validate.Range(
            min=0, max=50,
            error="Years of experience must be between 0 and 50"
        )
    )
    clinic_address = fields.Nested(ClinicAddressSchema, required=True)

    @validates('phone_number')
    def validate_phone_number(self, value):
        """Validate phone number format."""
        try:
            phone_number = phonenumbers.parse(value, None)
            if not phonenumbers.is_valid_number(phone_number):
                raise ValidationError("Invalid phone number format")
        except phonenumbers.NumberParseException:
            raise ValidationError("Invalid phone number format")

    @validates('specialization')
    def validate_specialization(self, value):
        """Validate specialization is in allowed list."""
        if value not in Config.VALID_SPECIALIZATIONS:
            raise ValidationError(
                f"Invalid specialization. Must be one of: {', '.join(Config.VALID_SPECIALIZATIONS)}"
            )

    @validates('confirm_password')
    def validate_confirm_password(self, value, data):
        """Validate password confirmation matches."""
        if value != data.get('password'):
            raise ValidationError("Passwords do not match")

class ProviderResponseSchema(Schema):
    """Schema for provider registration response."""
    success = fields.Boolean(required=True)
    message = fields.Str(required=True)
    data = fields.Dict(keys=fields.Str(), values=fields.Raw(), required=True) 