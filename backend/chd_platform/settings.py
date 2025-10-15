"""Django settings for chd_platform project."""
from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "insecure-development-key")
DEBUG = os.getenv("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS: list[str] = os.getenv("DJANGO_ALLOWED_HOSTS", "*").split(",")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "questions",
    "gamification",
    "users",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "chd_platform.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

WSGI_APPLICATION = "chd_platform.wsgi.application"
ASGI_APPLICATION = "chd_platform.asgi.application"

DEFAULT_DB_NAME = os.getenv("POSTGRES_DB", "chd_db")
DEFAULT_DB_USER = os.getenv("POSTGRES_USER", "chd_user")
DEFAULT_DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "chd_password")
DEFAULT_DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DEFAULT_DB_PORT = os.getenv("POSTGRES_PORT", "5432")

if os.getenv("DATABASE_URL"):
    try:
        import dj_database_url  # type: ignore
    except ModuleNotFoundError:  # pragma: no cover - optional dependency
        dj_database_url = None

    if dj_database_url:
        DATABASES = {
            "default": dj_database_url.parse(os.environ["DATABASE_URL"], conn_max_age=600, ssl_require=False)
        }
    else:
        raise RuntimeError("DATABASE_URL is set but dj-database-url is not installed.")
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": DEFAULT_DB_NAME,
            "USER": DEFAULT_DB_USER,
            "PASSWORD": DEFAULT_DB_PASSWORD,
            "HOST": DEFAULT_DB_HOST,
            "PORT": DEFAULT_DB_PORT,
        }
    }

if os.getenv("USE_SQLITE", "0") == "1":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "users.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

CORS_ALLOWED_ORIGINS = [origin for origin in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",") if origin]
CORS_ALLOW_CREDENTIALS = True
