from rest_framework.throttling import AnonRateThrottle, SimpleRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """Rate limit for login attempts (prevents credential brute-forcing)."""
    scope = 'login'


class RegisterRateThrottle(AnonRateThrottle):
    """Rate limit for account registration (prevents mass bot signups)."""
    scope = 'register'


class PasswordResetRateThrottle(AnonRateThrottle):
    """Rate limit for password reset requests (prevents email spam abuse)."""
    scope = 'password_reset'


class PublicFormRateThrottle(AnonRateThrottle):
    """Rate limit for public forms (Contact inquiries, free trials)."""
    scope = 'public_form'
