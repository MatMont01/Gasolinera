// truck_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class TruckService {
  static const String baseUrl = 'http://localhost:8002/api';

  Future<Map<String, double>> getCurrentLocation() async {

    return {
      'latitude': 40.712776,
      'longitude': -74.005974,
    };
  }

  Future<List<dynamic>> getTrucks() async {
    final token = await AuthService().getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/trucks/'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load trucks');
    }
  }

  Future<dynamic> createTruck(Map<String, dynamic> truckData) async {
    final token = await AuthService().getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/trucks/'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(truckData),
    );
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create truck');
    }
  }

  Future<dynamic> updateTruck(int id, Map<String, dynamic> truckData) async {
    final token = await AuthService().getToken();
    final response = await http.patch(
      Uri.parse('$baseUrl/trucks/$id/'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(truckData),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to update truck');
    }
  }

  Future<dynamic> deleteTruck(int id) async {
    final token = await AuthService().getToken();
    final response = await http.delete(
      Uri.parse('$baseUrl/trucks/$id/'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 204) {
      return true;
    } else {
      throw Exception('Failed to delete truck');
    }
  }

  Future<List<dynamic>> getDrivers() async {
    final token = await AuthService().getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/users/role/driver/'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load drivers');
    }
  }

  Future<Map<String, double>> getTruckLocation() async {
    final token = await AuthService().getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/truck/location/'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return {
        'latitude': double.parse(data['latitude']),
        'longitude': double.parse(data['longitude']),
      };
    } else {
      throw Exception('Failed to load truck location');
    }
  }

  Future<List<dynamic>> getCheckpointsByRoute(int routeId) async {
    final token = await AuthService().getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/route/$routeId/checkpoints/'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body).map((checkpoint) {
        return {
          ...checkpoint,
          'latitude': double.parse(checkpoint['latitude']),
          'longitude': double.parse(checkpoint['longitude']),
        };
      }).toList();
    } else {
      throw Exception('Failed to load checkpoints by route');
    }
  }

  Future<dynamic> markCheckpointDelivered(int checkpointId, int stationId, String fuelTypeName, double quantity) async {
    final token = await AuthService().getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/routecheckpoints/$checkpointId/deliver/'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'station_id': stationId,
        'fuel_type_name': fuelTypeName,
        'quantity': quantity,
      }),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to mark checkpoint delivered');
    }
  }
}
