import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:refinery_driver_app/providers/auth_provider.dart';

import 'screens/login_screen.dart';
import 'screens/map_screen.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthProvider()..checkAuthStatus(),
      child: MaterialApp(
        title: 'Refinery Driver App',
        theme: ThemeData(
          brightness: Brightness.dark,  // Enable dark mode
          primarySwatch: Colors.blue,
          scaffoldBackgroundColor: Colors.black,
          textTheme: TextTheme(
            bodyLarge: TextStyle(color: Colors.white),
            bodyMedium: TextStyle(color: Colors.white70),
          ),
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: Colors.grey[800],
            hintStyle: TextStyle(color: Colors.white70),
            labelStyle: TextStyle(color: Colors.white),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
              borderSide: BorderSide(color: Colors.white70),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
              borderSide: BorderSide(color: Colors.white70),
            ),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              foregroundColor: Colors.white, backgroundColor: Colors.blue,  // Text color
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.0),
              ),
            ),
          ),
        ),
        initialRoute: '/',
        routes: {
          '/': (context) => LoginScreen(),
          '/map': (context) => MapScreen(),
        },
      ),
    );
  }
}
