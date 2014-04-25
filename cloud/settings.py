# -*- coding: utf-8 -*-
"""
Django settings for cloud project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

import os
import socket

if socket.gethostname() in ("murad-P85-D3",):
    DEBUG = True
else:
    DEBUG = False

TEMPLATE_DEBUG = DEBUG
PROJECT_PATH = os.path.abspath(os.path.dirname(__name__))
PROJECT_PARENT_PATH = os.path.dirname(PROJECT_PATH)


def path(p):
    return p.replace('\\', '/')

ADMINS = (
    ('Murad Gasanov', 'gmn1791@ya.ru'),
)

MANAGERS = ADMINS

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = ')w@!)v4*2=wl!b3d-w&$t(x!$5=^z(_ze7@ha4s&c6l^@hl8uy'

# SECURITY WARNING: don't run with debug turned on in production!

ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'project.apertura.su']

# Application definition

INSTALLED_APPS = (
    # 'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    # 'django.contrib.messages',
    'django.contrib.staticfiles',

    'gunicorn',

    'main',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    #'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    #'django.contrib.messages.middleware.MessageMiddleware',
    #'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'main.midleware.MiddleWareProcess'
)

ROOT_URLCONF = 'cloud.urls'

WSGI_APPLICATION = 'cloud.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',  # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'cloud',                       # Or path to database file if using sqlite3.
        'USER': 'cloud',
        'PASSWORD': 'cloud',
        'HOST': '127.0.0.1',     # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': '3306',              # Set to empty string for default.
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'ru-RU'

TIME_ZONE = 'Europe/Moscow'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_ROOT = path(os.path.join(PROJECT_PARENT_PATH, "cloud_static/static"))

STATIC_URL = '/static/'

TEMPLATE_DIRS = ('templates',)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}
