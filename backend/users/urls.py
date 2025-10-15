from __future__ import annotations

from django.urls import path

from .views import CurrentUserView, LoginView, RegistrationView

app_name = "users"

urlpatterns = [
    path("register/", RegistrationView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", CurrentUserView.as_view(), name="me"),
]
