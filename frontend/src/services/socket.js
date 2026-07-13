import { io } from 'socket.io-client';

// Use same host as the API, just the root URL for socket.io
const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    withCredentials: true,
});

export default socket;
