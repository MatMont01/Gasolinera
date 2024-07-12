# models.py
from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLES = (
        ('seller', 'Seller'),
        ('station_admin', 'Station Admin'),
        ('refinery_admin', 'Refinery Admin'),
        ('driver', 'Driver'),
        ('access_admin', 'Access Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLES, default='seller')
    assigned_station = models.ForeignKey('Station', null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_users')
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups',
    )

    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

class Station(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
