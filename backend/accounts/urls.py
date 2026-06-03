# accounts/urls.py
from django.urls import path
from .views import login_view, refresh_token_view

urlpatterns = [
    path('accounts/login/', login_view, name='accounts-login'),
    path('accounts/refresh/', refresh_token_view, name='refresh'),
]
