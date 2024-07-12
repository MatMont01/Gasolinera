// fuel_type_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class FuelTypeService {
  static const String baseUrl = 'http://localhost:8001/api';

  Future<List<dynamic>> getFuelTypes() async {
    final token = await AuthService().getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/fueltypes/'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load fuel types');
    }
  }

  Future<dynamic> createFuelType(Map<String, dynamic> fuelTypeData) async {
    final token = await AuthService().getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/fueltypes/'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(fuelTypeData),
    );
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create fuel type');
    }
  }

  Future<dynamic> updateFuelType(int id, Map<String, dynamic> fuelTypeData) async {
    final token = await AuthService().getToken();
    final response = await http.patch(
      Uri.parse('$baseUrl/fueltypes/$id/'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(fuelTypeData),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to update fuel type');
    }
  }

  Future<dynamic> deleteFuelType(int id) async {
    final token = await AuthService().getToken();
    final response = await http.delete(
      Uri.parse('$baseUrl/fueltypes/$id/'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 204) {
      return true;
    } else {
      throw Exception('Failed to delete fuel type');
    }
  }
}
