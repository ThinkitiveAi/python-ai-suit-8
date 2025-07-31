"""Email service for sending verification emails."""
from typing import Dict, Any
import jwt
from datetime import datetime, timedelta
from flask_mail import Message
from jinja2 import Template
from src import mail
from src.core.config import Config
from flask import current_app

class EmailService:
    """Service for handling email operations."""

    @staticmethod
    def generate_verification_token(provider_id: str) -> str:
        """Generate a verification token for email verification."""
        payload = {
            'provider_id': provider_id,
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')

    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        """Verify and decode a verification token."""
        try:
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Verification link has expired")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid verification token")

    @staticmethod
    def get_verification_email_template() -> Template:
        """Get the email template for verification emails."""
        return Template("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to Health First!</h2>
                <p>Dear Dr. {{ last_name }},</p>
                
                <p>Thank you for registering as a healthcare provider with Health First. 
                To complete your registration, please verify your email address by clicking 
                the button below:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{ verification_url }}" 
                       style="background-color: #4CAF50; color: white; padding: 14px 28px; 
                              text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Verify Email Address
                    </a>
                </div>
                
                <p>This verification link will expire in 24 hours.</p>
                
                <p>If you did not create this account, please ignore this email.</p>
                
                <p>Best regards,<br>The Health First Team</p>
                
                <hr>
                
                <p style="font-size: 12px; color: #666;">
                    If you're having trouble clicking the button, copy and paste this URL 
                    into your web browser:<br>
                    {{ verification_url }}
                </p>
            </div>
        """)

    def send_verification_email(self, provider: Dict[str, Any], verification_url: str) -> None:
        """Send a verification email to the provider."""
        template = self.get_verification_email_template()
        html_content = template.render(
            last_name=provider['last_name'],
            verification_url=verification_url
        )

        msg = Message(
            subject='Verify Your Health First Provider Account',
            recipients=[provider['email']],
            html=html_content,
            sender=Config.MAIL_DEFAULT_SENDER
        )

        try:
            mail.send(msg)
        except Exception as e:
            # Log the error but don't expose email sending errors to the client
            current_app.logger.error(f"Failed to send verification email: {str(e)}")
            raise ValueError("Failed to send verification email") 