// Common airport coordinates for the simulation map
const airportCoordinates = {
    // Top US Airports
    'JFK': { lat: 40.6413, lng: -73.7781, name: 'John F. Kennedy Intl' },
    'LAX': { lat: 33.9416, lng: -118.4085, name: 'Los Angeles Intl' },
    'ORD': { lat: 41.9742, lng: -87.9073, name: 'Chicago O\'Hare Intl' },
    'DFW': { lat: 32.8998, lng: -97.0403, name: 'Dallas/Fort Worth Intl' },
    'ATL': { lat: 33.6407, lng: -84.4277, name: 'Hartsfield-Jackson Atlanta Intl' },
    'MIA': { lat: 25.7959, lng: -80.2870, name: 'Miami Intl' },
    'SFO': { lat: 37.6213, lng: -122.3790, name: 'San Francisco Intl' },
    'SEA': { lat: 47.4502, lng: -122.3088, name: 'Seattle-Tacoma Intl' },
    'BOS': { lat: 42.3656, lng: -71.0096, name: 'Boston Logan Intl' },
    'DEN': { lat: 39.8561, lng: -104.6737, name: 'Denver Intl' },

    // Top International Airports
    'LHR': { lat: 51.4700, lng: -0.4543, name: 'London Heathrow' },
    'CDG': { lat: 49.0097, lng: 2.5479, name: 'Paris Charles de Gaulle' },
    'FRA': { lat: 50.0379, lng: 8.5622, name: 'Frankfurt Airport' },
    'DXB': { lat: 25.2532, lng: 55.3657, name: 'Dubai Intl' },
    'SIN': { lat: 1.3644, lng: 103.9915, name: 'Singapore Changi' },
    'HND': { lat: 35.5494, lng: 139.7798, name: 'Tokyo Haneda' },
    'SYD': { lat: -33.9399, lng: 151.1753, name: 'Sydney Kingsford Smith' },
    'YYZ': { lat: 43.6777, lng: -79.6248, name: 'Toronto Pearson Intl' },
    'GRU': { lat: -23.4356, lng: -46.4731, name: 'São Paulo/Guarulhos Intl' },
    'JNB': { lat: -26.1392, lng: 28.2460, name: 'O. R. Tambo Intl' },

    // Major Hubs India
    'DEL': { lat: 28.5562, lng: 77.1000, name: 'Indira Gandhi Intl' },
    'BOM': { lat: 19.0896, lng: 72.8656, name: 'Chhatrapati Shivaji Maharaj Intl' },
    'BLR': { lat: 13.1986, lng: 77.7066, name: 'Kempegowda Intl' },
};

module.exports = airportCoordinates;
