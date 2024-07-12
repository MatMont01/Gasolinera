// auth_provider.dart
import 'package:flutter/material.dart';

import '../services/auth_service.dart';


class AuthProvider with ChangeNotifier {
  AuthService _authService = AuthService();
  String? _email;
  bool _isAuthenticated = false;

  String? get email => _email;
  bool get isAuthenticated => _isAuthenticated;

  Future<void> login(String email, String password) async {
    bool success = await _authService.login(email, password);
    if (success) {
      _email = email;
      _isAuthenticated = true;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _email = null;
    _isAuthenticated = false;
    notifyListeners();
  }

  Future<void> checkAuthStatus() async {
    String? token = await _authService.getToken();
    if (token != null) {
      _email = await _authService.getEmail();
      _isAuthenticated = true;
    } else {
      _email = null;
      _isAuthenticated = false;
    }
    notifyListeners();
  }
}
