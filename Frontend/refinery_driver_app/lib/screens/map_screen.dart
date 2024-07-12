import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'dart:async';
import '../services/truck_service.dart';
import '../services/station_service.dart';
import '../services/route_service.dart';
import '../services/fuel_type_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class MapScreen extends StatefulWidget {
  @override
  _MapScreenState createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  Completer<GoogleMapController> _controller = Completer();
  WebSocketChannel? channel;
  Map<String, double>? truckLocation;
  List<dynamic> checkpoints = [];
  List<dynamic> stations = [];
  List<dynamic> routes = [];
  int? routeId;
  int? truckId;
  String? error;
  List<dynamic> fuelTypes = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  void _fetchData() async {
    try {
      final truckData = await TruckService().getTruckLocation();
      setState(() {
        truckLocation = truckData;
      });

      final email = await _getUserEmail();
      if (email != null) {
        final userRoutes = await RouteService().getRouteByDriver(email);
        if (userRoutes.isNotEmpty) {
          setState(() {
            routeId = userRoutes[0]['id'];
            truckId = userRoutes[0]['truck_id'];
          });
        }
      }

      if (routeId != null) {
        final checkpointData = await TruckService().getCheckpointsByRoute(routeId!);
        setState(() {
          checkpoints = checkpointData.map((checkpoint) {
            final route = routes.firstWhere(
                  (r) => r['id'] == checkpoint['route'],
              orElse: () => null,
            );
            final fuelType = fuelTypes.firstWhere(
                  (ft) => ft['id'] == route?['fuel_type'],
              orElse: () => null,
            );
            return {
              ...checkpoint,
              'fuelTypeName': fuelType?['name'] ?? 'N/A',
              'quantity': checkpoint['liters_delivered'],
            };
          }).where((checkpoint) =>
          checkpoint.containsKey('latitude') &&
              checkpoint.containsKey('longitude'))
              .toList();
        });
      }

      final stationsData = await StationService().getStations();
      setState(() {
        stations = stationsData;
      });

      final routesData = await RouteService().getRoutes();
      setState(() {
        routes = routesData;
      });

      final fuelTypeData = await FuelTypeService().getFuelTypes();
      setState(() {
        fuelTypes = fuelTypeData;
      });

      // Iniciar WebSocket después de obtener el truckId
      _connectWebSocket();
    } catch (err) {
      setState(() {
        error = err.toString();
      });
    }
  }

  void _connectWebSocket() {
    if (truckId != null) {
      try {
        channel = WebSocketChannel.connect(
          Uri.parse('ws://localhost:8002/ws/trucks/$truckId/'),
        );
        channel!.stream.listen((message) {
          print('Received: $message');
        });
        _startLocationUpdates();
      } catch (e) {
        print('Error connecting to WebSocket: $e');
      }
    }
  }

  void _startLocationUpdates() {
    Timer.periodic(Duration(seconds: 30), (timer) async {
      try {
        final location = await TruckService().getCurrentLocation();
        if (channel != null) {
          channel!.sink.add(jsonEncode({
            'location': {
              'latitude': location['latitude'],
              'longitude': location['longitude'],
            }
          }));
        }
      } catch (e) {
        print('Error getting location: $e');
      }
    });
  }

  Future<String?> _getUserEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('email');
  }

  Future<void> _handleDelivery(int checkpointId) async {
    final checkpoint = checkpoints.firstWhere((cp) => cp['id'] == checkpointId, orElse: () => null);
    if (checkpoint == null) {
      print('Checkpoint not found');
      return;
    }
    final route = routes.firstWhere(
          (route) => route['id'] == checkpoint['route'],
      orElse: () => null,
    );
    if (route == null) {
      print('Route not found');
      return;
    }
    final fuelType = fuelTypes.firstWhere(
          (ft) => ft['id'] == route['fuel_type'],
      orElse: () => null,
    );
    if (fuelType == null) {
      print('Fuel type not found');
      return;
    }
    final stationId = checkpoint['station_id'];
    final fuelTypeName = fuelType['name'];
    final quantity = checkpoint['liters_delivered'];

    try {
      await TruckService().markCheckpointDelivered(
        checkpointId, stationId, fuelTypeName, quantity,
      );
      setState(() {
        checkpoints = checkpoints.map((cp) =>
        cp['id'] == checkpointId ? {...cp, 'delivered': true} : cp).toList();
      });
    } catch (err) {
      setState(() {
        error = err.toString();
      });
    }
  }

  @override
  void dispose() {
    if (channel != null) {
      channel!.sink.close();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Map'),
        backgroundColor: Colors.grey[900],
      ),
      body: error != null
          ? Center(
        child: Text(
          'Error: $error',
          style: TextStyle(color: Colors.red, fontSize: 18),
        ),
      )
          : truckLocation == null
          ? Center(child: CircularProgressIndicator())
          : Column(
        children: [
          Expanded(
            flex: 3,
            child: GoogleMap(
              initialCameraPosition: CameraPosition(
                target: LatLng(truckLocation!['latitude']!,
                    truckLocation!['longitude']!),
                zoom: 10,
              ),
              onMapCreated: (GoogleMapController controller) {
                _controller.complete(controller);
              },
              markers: {
                Marker(
                  markerId: MarkerId('currentLocation'),
                  position: LatLng(truckLocation!['latitude']!,
                      truckLocation!['longitude']!),
                  infoWindow: InfoWindow(title: 'Truck Location'),
                ),
                ...checkpoints.map((checkpoint) => Marker(
                  markerId: MarkerId(checkpoint['id'].toString()),
                  position: LatLng(checkpoint['latitude'],
                      checkpoint['longitude']),
                  infoWindow: InfoWindow(
                      title: checkpoint['delivered']
                          ? 'Delivered'
                          : 'Station'),
                )),
              },
            ),
          ),
          Expanded(
            flex: 2,
            child: Container(
              padding: EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: Colors.grey[900],
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(20),
                  topRight: Radius.circular(20),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Checkpoints',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Divider(color: Colors.white),
                  Expanded(
                    child: ListView.builder(
                      itemCount: checkpoints.length,
                      itemBuilder: (context, index) {
                        final checkpoint = checkpoints[index];
                        final station = stations.firstWhere(
                              (station) =>
                          station['id'] ==
                              checkpoint['station_id'],
                          orElse: () => null,
                        );
                        return ListTile(
                          contentPadding: EdgeInsets.symmetric(
                              vertical: 8.0, horizontal: 16.0),
                          tileColor: Colors.grey[850],
                          shape: RoundedRectangleBorder(
                            borderRadius:
                            BorderRadius.circular(10.0),
                          ),
                          title: Text(
                            station != null
                                ? station['name']
                                : 'Unknown Station',
                            style: TextStyle(color: Colors.white),
                          ),
                          subtitle: Text(
                            'Liters to Deliver: ${checkpoint['liters_delivered']}',
                            style: TextStyle(color: Colors.white70),
                          ),
                          trailing: ElevatedButton(
                            onPressed: checkpoint['delivered']
                                ? null
                                : () => _handleDelivery(
                                checkpoint['id']),
                            style: ElevatedButton.styleFrom(
                              foregroundColor: Colors.white,
                              backgroundColor: checkpoint['delivered']
                                  ? Colors.grey
                                  : Colors.blue,
                              shape: RoundedRectangleBorder(
                                borderRadius:
                                BorderRadius.circular(8.0),
                              ),
                            ),
                            child: Text(
                              checkpoint['delivered']
                                  ? 'Delivered'
                                  : 'Mark as Delivered',
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
