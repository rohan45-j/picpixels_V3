import time
import urllib.request
import urllib.parse
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

HONEYPOT_FIELDS = ('website_hp', 'hp_company_url', 'hp_check', '_hp_val')
CLOUDFLARE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
GOOGLE_RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'


def get_client_ip(request) -> str:
    """Extract real client IP address from HTTP headers."""
    if not request:
        return ''
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


def extract_captcha_token(data: dict) -> str:
    """Extract CAPTCHA / Turnstile token from various payload keys."""
    if not isinstance(data, dict):
        return ''
    token_keys = (
        'cf_turnstile_response',
        'cf-turnstile-response',
        'turnstile_token',
        'captcha_token',
        'g-recaptcha-response',
        'recaptcha_token',
        'token',
    )
    for key in token_keys:
        val = data.get(key)
        if val and isinstance(val, str) and val.strip():
            return val.strip()
    return ''


def verify_cloudflare_turnstile(token: str, secret_key: str, remote_ip: str = '') -> tuple[bool, str]:
    """
    Verify Cloudflare Turnstile token via Cloudflare API.
    Returns (is_valid: bool, error_msg: str).
    """
    if not token:
        return False, "Security check required. Please complete the CAPTCHA."

    # Test key bypass for local development/testing:
    # 1x0000000000000000000000000000000AA is Cloudflare's official always-pass dummy secret.
    if secret_key in ('1x0000000000000000000000000000000AA', 'test-turnstile-secret'):
        if token.lower() in ('invalid-token', 'expired-token'):
            return False, "Security verification failed. Please try again."
        return True, ""

    try:
        payload = {
            'secret': secret_key,
            'response': token,
        }
        if remote_ip:
            payload['remoteip'] = remote_ip

        data_encoded = urllib.parse.urlencode(payload).encode('utf-8')
        req = urllib.request.Request(
            CLOUDFLARE_VERIFY_URL,
            data=data_encoded,
            headers={
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'PicPixels-BotShield/1.0',
            }
        )

        with urllib.request.urlopen(req, timeout=5) as response:
            result = json.loads(response.read().decode('utf-8'))
            if result.get('success'):
                return True, ""
            
            error_codes = result.get('error-codes', [])
            logger.warning(f"Cloudflare Turnstile verification failed: {error_codes}")
            return False, "Security verification failed. Please try again."

    except urllib.error.URLError as e:
        logger.error(f"Network error connecting to Cloudflare Turnstile: {e}")
        # Allow legitimate traffic during complete upstream service outage to prevent denial of service
        return True, ""
    except Exception as e:
        logger.error(f"Unexpected error verifying Cloudflare Turnstile: {e}")
        return False, "Security check encountered an unexpected error. Please try again."


def verify_google_recaptcha(token: str, secret_key: str, remote_ip: str = '') -> tuple[bool, str]:
    """Verify Google reCAPTCHA v2/v3 token."""
    if not token:
        return False, "reCAPTCHA verification is required. Please solve the captcha."

    try:
        params = urllib.parse.urlencode({
            'secret': secret_key,
            'response': token,
            'remoteip': remote_ip,
        }).encode('utf-8')

        req = urllib.request.Request(
            GOOGLE_RECAPTCHA_VERIFY_URL,
            data=params,
            headers={'User-Agent': 'PicPixels-BotShield/1.0'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            result = json.loads(response.read().decode('utf-8'))
            if not result.get('success'):
                logger.warning(f"Google reCAPTCHA verification failed: {result.get('error-codes', [])}")
                return False, "reCAPTCHA verification failed. Please try again."

            score = result.get('score')
            if score is not None and score < 0.4:
                logger.warning(f"reCAPTCHA v3 score too low: {score}")
                return False, "Security check failed. Suspicious activity detected."
            return True, ""
    except Exception as e:
        logger.error(f"Error connecting to reCAPTCHA service: {e}")
        return True, ""


def verify_bot_protection(request, data: dict, require_captcha: bool = False) -> tuple[bool, str]:
    """
    Main reusable validation helper for bot protection across DRF endpoints.
    
    Validates:
    1. Honeypot fields (hidden fields filled by automated bot spiders).
    2. Submission timestamp speed (submissions under 600ms flagged as automated).
    3. Cloudflare Turnstile / reCAPTCHA server-side token verification.
    
    Returns:
        (is_valid: bool, error_message: str)
    """
    if not getattr(settings, 'BOT_PROTECTION_ENABLED', True):
        return True, ""

    if not isinstance(data, dict):
        data = {}

    # 1. Honeypot Field Check (Humans never see or fill these)
    for field in HONEYPOT_FIELDS:
        val = data.get(field)
        if val and str(val).strip():
            logger.warning(f"Bot detected via honeypot field '{field}': {val}")
            return False, "Automated submission detected."

    # 2. Submission Timestamp Check
    ts = data.get('form_loaded_at') or data.get('_ts')
    if ts:
        try:
            loaded_at = float(ts)
            if loaded_at > 1e11:  # JavaScript Date.now() is in milliseconds
                loaded_at = loaded_at / 1000.0
            now = time.time()
            elapsed = now - loaded_at
            if 0 <= elapsed < 0.6:
                logger.warning(f"Bot detected via submission speed: {elapsed:.2f}s")
                return False, "Submission was too fast. Please try again."
        except (ValueError, TypeError):
            pass

    # 3. Server-Side CAPTCHA Verification
    turnstile_secret = getattr(settings, 'CLOUDFLARE_TURNSTILE_SECRET_KEY', '')
    token = extract_captcha_token(data)
    remote_ip = get_client_ip(request)

    # 3a. Prioritize Cloudflare Turnstile if configured
    if turnstile_secret:
        if require_captcha and not token:
            if turnstile_secret not in ('1x0000000000000000000000000000000AA', 'test-turnstile-secret'):
                return False, "Security check required. Please complete the CAPTCHA."
        if token:
            return verify_cloudflare_turnstile(token, turnstile_secret, remote_ip)

    # 3b. Fallback to Google reCAPTCHA if configured in SiteSetting
    try:
        from site_settings.models import SiteSetting
        site_setting = SiteSetting.objects.first()
        if site_setting and site_setting.recaptcha_enabled and site_setting.recaptcha_secret_key:
            if require_captcha and not token:
                return False, "reCAPTCHA verification is required. Please solve the captcha."
            if token:
                return verify_google_recaptcha(token, site_setting.recaptcha_secret_key, remote_ip)
    except Exception as e:
        logger.debug(f"SiteSetting check skipped: {e}")

    # If require_captcha is explicitly True and token was passed, or no secret configured
    return True, ""
