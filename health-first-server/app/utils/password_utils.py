from passlib.context import CryptContext
import logging

logger = logging.getLogger(__name__)

# Configure password hashing with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt with salt rounds >= 12.
    
    Args:
        password (str): Plain text password
        
    Returns:
        str: Hashed password
    """
    try:
        return pwd_context.hash(password, rounds=12)
    except Exception as e:
        logger.error(f"Error hashing password: {e}")
        raise e

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password (str): Plain text password to verify
        hashed_password (str): Hashed password to compare against
        
    Returns:
        bool: True if password matches, False otherwise
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Error verifying password: {e}")
        return False

def is_password_strong(password: str) -> bool:
    """
    Check if password meets security requirements.
    
    Args:
        password (str): Password to check
        
    Returns:
        bool: True if password meets requirements
    """
    if len(password) < 8:
        return False
    
    import re
    
    # Check for uppercase letter
    if not re.search(r'[A-Z]', password):
        return False
    
    # Check for lowercase letter
    if not re.search(r'[a-z]', password):
        return False
    
    # Check for number
    if not re.search(r'\d', password):
        return False
    
    # Check for special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    
    return True 