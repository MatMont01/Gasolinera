from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import CustomUser, Station


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'

    def validate(self, data):
        role = data.get('role')
        assigned_station = data.get('assigned_station')

        if role in ['station_admin', 'seller'] and not assigned_station:
            raise serializers.ValidationError("assigned_station is required for station_admin and seller roles")

        return data


class StationSerializer(serializers.ModelSerializer):
    assigned_users = CustomUserSerializer(many=True, read_only=True)

    class Meta:
        model = Station
        fields = '__all__'
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = CustomUser.objects.filter(email=email).first()

        if user and user.check_password(password):
            data = super().validate(attrs)
            data['role'] = user.role
            return data

        raise serializers.ValidationError('Invalid email or password')