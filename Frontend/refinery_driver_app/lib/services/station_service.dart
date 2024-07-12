// station_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class StationService {
  static const String baseUrl = 'http://localhost:8001';

  Future<List<dynamic>> getStations() async {
    final token = await AuthService().getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/api/stations/'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load stations');
    }
  }

  Future<dynamic> getStationStocks(int stationId) async {
    final token = await AuthService().getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/api/stations/$stationId/station-stocks/'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load station stocks');
    }
  }
}
