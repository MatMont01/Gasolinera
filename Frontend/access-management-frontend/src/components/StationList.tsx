import React, { useEffect, useState } from 'react';
import stationService from '../services/stationService';

const StationList: React.FC = () => {
    const [stations, setStations] = useState([]);

    useEffect(() => {
        const fetchStations = async () => {
            const data = await stationService.getStations();
            setStations(data);
        };
        fetchStations();
    }, []);

    return (
        <div>
            <h2>Station List</h2>
            <ul>
                {stations.map((station: any) => (
                    <li key={station.id}>{station.name} - {station.latitude}, {station.longitude}</li>
                ))}
            </ul>
        </div>
    );
};

export default StationList;
