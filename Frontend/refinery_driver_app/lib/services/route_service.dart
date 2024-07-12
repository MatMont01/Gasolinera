// route_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class RouteService {
  static const String baseUrl = 'http://localhost:8002/api';

  Future<List<dynamic>> getRoutes() async {
    final token = await AuthService().getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/routes/'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load routes');
    }
  }

  Future<dynamic> createRoute(Map<String, dynamic> routeData) async {
    final token = await AuthService().getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/routes/'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(routeData),
    );
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create route');
    }
  }

  Future<dynamic> updateRoute(int id, Map<String, dynamic> routeData) async {
    final token = await AuthService().getToken();
    final response = await http.patch(
      Uri.parse('$baseUrl/routes/$id/'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(routeData),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to update route');
    }
  }

  Future<dynamic> deleteRoute(int id) async {
    final token = await AuthService().getToken();
    final response = await http.delete(
      Uri.parse('$baseUrl/routes/$id/'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 204) {
      return true;
    } else {
      throw Exception('Failed to delete route');
    }
  }

  Future<List<dynamic>> getRoutesByTruckId(String truckId) async {
    final token = await AuthService().getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/routes?truck=$truckId'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load routes by truck id');
    }
  }

  Future<List<dynamic>> getRouteByDriver(String driverEmail) async {
    final token = await AuthService().getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/routes?driver=$driverEmail'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load routes by driver');
    }
  }
}
