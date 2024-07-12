// MapPage.tsx

import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import truckService from '../services/truckService';
import stationService from '../services/stationService';
import routeService from '../services/routeService';
import fuelTypeService from '../services/fuelTypeService';
import { useAuth } from '../context/AuthContext';

const MapPage: React.FC = () => {
    const { user } = useAuth();
    const [truckLocation, setTruckLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [checkpoints, setCheckpoints] = useState<any[]>([]);
    const [stations, setStations] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [routeId, setRouteId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fuelTypes, setFuelTypes] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const truckData = await truckService.getTruckLocation();
                if (isNaN(truckData.latitude) || isNaN(truckData.longitude)) {
                    throw new Error('Invalid truck location data');
                }
                setTruckLocation(truckData);

                if (user) {
                    const userRoutes = await routeService.getRouteByDriver(user.email);
                    if (userRoutes.length > 0) {
                        setRouteId(userRoutes[0].id);
                    }
                }

                if (routeId) {
                    let checkpointData = await truckService.getCheckpointsByRoute(routeId);
                    checkpointData = checkpointData.map((checkpoint: any) => {
                        const route = routes.find((r: any) => r.id === checkpoint.route);
                        const fuelType = fuelTypes.find((ft: any) => ft.id === route?.fuel_type);
                        return {
                            ...checkpoint,
                            fuelTypeName: fuelType ? fuelType.name : 'N/A', // Enrich checkpoint data with fuel type name
                            quantity: checkpoint.liters_delivered // Ensure quantity is included
                        };
                    });
                    const validCheckpoints = checkpointData.filter((checkpoint: any) => !isNaN(checkpoint.latitude) && !isNaN(checkpoint.longitude));
                    setCheckpoints(validCheckpoints);
                }

                const stationsData = await stationService.getStations();
                setStations(stationsData);

                const routesData = await routeService.getRoutes();
                setRoutes(routesData);

                const fuelTypeData = await fuelTypeService.getFuelTypes();
                console.log("Fuel Types Data:", fuelTypeData);
                setFuelTypes(fuelTypeData);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchData();
    }, [routeId, user, routes, fuelTypes]);

    const handleDelivery = async (checkpointId: number) => {
        const checkpoint = checkpoints.find((cp: any) => cp.id === checkpointId);
        if (!checkpoint) {
            console.error('Checkpoint not found');
            return;
        }
        const route = routes.find((route: any) => route.id === checkpoint.route);
        if (!route) {
            console.error('Route not found');
            return;
        }
        const fuelType = fuelTypes.find((ft: any) => ft.id === route.fuel_type);
        if (!fuelType) {
            console.error('Fuel type not found');
            return;
        }
        const stationId = checkpoint.station_id;
        const fuelTypeName = fuelType.name;
        const quantity = checkpoint.liters_delivered;

        try {
            console.log(`Sending data to API: checkpointId=${checkpointId}, station_id=${stationId}, fuel_type_name=${fuelTypeName}, quantity=${quantity}`);
            await truckService.markCheckpointDelivered(checkpointId, stationId, fuelTypeName, quantity);
            setCheckpoints(checkpoints.map(cp => cp.id === checkpointId ? { ...cp, delivered: true } : cp));
        } catch (err) {
            console.error("Error in handleDelivery:", err);  // Log error to console
            setError(err.message);
        }
    };



    if (error) {
        return <div className="text-red-400">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <LoadScript googleMapsApiKey="AIzaSyDA40dLBDBCPjI_237XTmwBtDHcBSqANKI">
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '400px' }}
                    center={truckLocation ? { lat: truckLocation.latitude, lng: truckLocation.longitude } : { lat: 0, lng: 0 }}
                    zoom={10}
                >
                    {truckLocation && (
                        <Marker position={{ lat: truckLocation.latitude, lng: truckLocation.longitude }} label="Truck" />
                    )}
                    {checkpoints.map(checkpoint => (
                        <Marker
                            key={checkpoint.id}
                            position={{ lat: checkpoint.latitude, lng: checkpoint.longitude }}
                            label={checkpoint.delivered ? "Delivered" : "Station"}
                        />
                    ))}
                </GoogleMap>
            </LoadScript>
            <div className="mt-8 space-y-4">
                {checkpoints.map(checkpoint => (
                    <div key={checkpoint.id} className="p-4 bg-gray-800 rounded-md shadow-sm">
                        <h4 className="font-bold">{stations.find((station: any) => station.id === checkpoint.station_id)?.name}</h4>
                        {routes.find((route: any) => route.id === checkpoint.route)?.fuel_type ? (
                            <p>Fuel Type: {checkpoint.fuelTypeName}</p>
                        ) : (
                            <p>Fuel Type: N/A</p>
                        )}
                        <p>Liters to Deliver: {checkpoint.liters_delivered}</p>
                        <button
                            onClick={() => handleDelivery(checkpoint.id)}
                            disabled={checkpoint.delivered}
                            className={`px-4 py-2 mt-2 text-white rounded-md shadow-sm ${checkpoint.delivered ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                        >
                            {checkpoint.delivered ? 'Delivered' : 'Mark as Delivered'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MapPage;
