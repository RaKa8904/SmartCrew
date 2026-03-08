// Common airport coordinates for the simulation map
const airportCoordinates = {
    // ── Top US Airports ──
    'JFK': { lat: 40.6413, lng: -73.7781, name: 'John F. Kennedy Intl' },
    'LAX': { lat: 33.9416, lng: -118.4085, name: 'Los Angeles Intl' },
    'ORD': { lat: 41.9742, lng: -87.9073, name: "Chicago O'Hare Intl" },
    'DFW': { lat: 32.8998, lng: -97.0403, name: 'Dallas/Fort Worth Intl' },
    'ATL': { lat: 33.6407, lng: -84.4277, name: 'Hartsfield-Jackson Atlanta Intl' },
    'MIA': { lat: 25.7959, lng: -80.2870, name: 'Miami Intl' },
    'SFO': { lat: 37.6213, lng: -122.3790, name: 'San Francisco Intl' },
    'SEA': { lat: 47.4502, lng: -122.3088, name: 'Seattle-Tacoma Intl' },
    'BOS': { lat: 42.3656, lng: -71.0096, name: 'Boston Logan Intl' },
    'DEN': { lat: 39.8561, lng: -104.6737, name: 'Denver Intl' },
    'IAH': { lat: 29.9844, lng: -95.3414, name: 'George Bush Intercontinental' },
    'EWR': { lat: 40.6895, lng: -74.1745, name: 'Newark Liberty Intl' },

    // ── Europe ──
    'LHR': { lat: 51.4700, lng: -0.4543, name: 'London Heathrow' },
    'CDG': { lat: 49.0097, lng: 2.5479, name: 'Paris Charles de Gaulle' },
    'FRA': { lat: 50.0379, lng: 8.5622, name: 'Frankfurt Airport' },
    'AMS': { lat: 52.3105, lng: 4.7683, name: 'Amsterdam Schiphol' },
    'MAD': { lat: 40.4983, lng: -3.5676, name: 'Adolfo Suárez Madrid–Barajas' },
    'FCO': { lat: 41.8003, lng: 12.2389, name: 'Rome Fiumicino' },
    'IST': { lat: 41.2753, lng: 28.7519, name: 'Istanbul Airport' },
    'ZRH': { lat: 47.4647, lng: 8.5492, name: 'Zurich Airport' },
    'MUC': { lat: 48.3537, lng: 11.7750, name: 'Munich Airport' },

    // ── Middle East & Africa ──
    'DXB': { lat: 25.2532, lng: 55.3657, name: 'Dubai Intl' },
    'DOH': { lat: 25.2731, lng: 51.6081, name: 'Hamad Intl' },
    'AUH': { lat: 24.4330, lng: 54.6511, name: 'Abu Dhabi Intl' },
    'JNB': { lat: -26.1392, lng: 28.2460, name: 'O. R. Tambo Intl' },
    'CAI': { lat: 30.1219, lng: 31.4056, name: 'Cairo Intl' },
    'ADD': { lat: 8.9779, lng: 38.7993, name: 'Addis Ababa Bole Intl' },
    'NBO': { lat: -1.3192, lng: 36.9278, name: 'Jomo Kenyatta Intl' },

    // ── Asia-Pacific ──
    'SIN': { lat: 1.3644, lng: 103.9915, name: 'Singapore Changi' },
    'HND': { lat: 35.5494, lng: 139.7798, name: 'Tokyo Haneda' },
    'NRT': { lat: 35.7720, lng: 140.3929, name: 'Narita Intl' },
    'ICN': { lat: 37.4602, lng: 126.4407, name: 'Incheon Intl' },
    'HKG': { lat: 22.3080, lng: 113.9185, name: 'Hong Kong Intl' },
    'BKK': { lat: 13.6900, lng: 100.7501, name: 'Suvarnabhumi' },
    'KUL': { lat: 2.7456, lng: 101.7072, name: 'Kuala Lumpur Intl' },
    'PEK': { lat: 40.0799, lng: 116.6031, name: 'Beijing Capital Intl' },
    'PVG': { lat: 31.1443, lng: 121.8083, name: 'Shanghai Pudong Intl' },
    'SYD': { lat: -33.9399, lng: 151.1753, name: 'Sydney Kingsford Smith' },
    'MEL': { lat: -37.6733, lng: 144.8431, name: 'Melbourne Tullamarine' },
    'AKL': { lat: -37.0082, lng: 174.7850, name: 'Auckland Airport' },

    // ── Americas (non-US) ──
    'YYZ': { lat: 43.6777, lng: -79.6248, name: 'Toronto Pearson Intl' },
    'YVR': { lat: 49.1967, lng: -123.1815, name: 'Vancouver Intl' },
    'GRU': { lat: -23.4356, lng: -46.4731, name: 'São Paulo/Guarulhos Intl' },
    'MEX': { lat: 19.4363, lng: -99.0721, name: 'Mexico City Intl' },
    'EZE': { lat: -34.8222, lng: -58.5358, name: 'Buenos Aires Ezeiza' },
    'SCL': { lat: -33.3930, lng: -70.7858, name: 'Santiago Intl' },
    'BOG': { lat: 4.7016, lng: -74.1469, name: 'El Dorado Intl' },
    'LIM': { lat: -12.0219, lng: -77.1143, name: 'Jorge Chávez Intl' },

    // ── Major Hubs India ──
    'DEL': { lat: 28.5562, lng: 77.1000, name: 'Indira Gandhi Intl' },
    'BOM': { lat: 19.0896, lng: 72.8656, name: 'Chhatrapati Shivaji Maharaj Intl' },
    'BLR': { lat: 13.1986, lng: 77.7066, name: 'Kempegowda Intl' },
    'MAA': { lat: 12.9941, lng: 80.1709, name: 'Chennai Intl' },
    'HYD': { lat: 17.2403, lng: 78.4294, name: 'Rajiv Gandhi Intl' },
    'CCU': { lat: 22.6520, lng: 88.4463, name: 'Netaji Subhas Chandra Bose Intl' },
    'GOI': { lat: 15.3809, lng: 73.8314, name: 'Goa Manohar Intl' },
    'COK': { lat: 10.1520, lng: 76.4019, name: 'Cochin Intl' },
};

module.exports = airportCoordinates;
