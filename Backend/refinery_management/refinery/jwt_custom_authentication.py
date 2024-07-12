# refinery/jwt_custom_authentication.py

import requests
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions
from rest_framework_simplejwt.tokens import AccessToken


class JWTCustomAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)

        if isinstance(raw_token, bytes):
            raw_token = raw_token.decode('utf-8')

        verify_response = requests.post(
            "http://localhost:8000/api/token/verify/",
            json={"token": raw_token}
        )
        if verify_response.status_code != 200:
            raise exceptions.AuthenticationFailed('Invalid token', code='invalid_token')

        access_token = AccessToken(raw_token)
        user_id = access_token['user_id']

        user_response = requests.get(
            f"http://localhost:8000/api/users/{user_id}/",
            headers={"Authorization": f"Bearer {raw_token}"}
        )
        if user_response.status_code == 200:
            user_data = user_response.json()
            user = self.create_user(user_data)
            return user, validated_token
        else:
            raise exceptions.AuthenticationFailed('User not found', code='user_not_found')

    def create_user(self, user_data):
        user = type('User', (object,), user_data)
        user.is_authenticated = True
        return user
