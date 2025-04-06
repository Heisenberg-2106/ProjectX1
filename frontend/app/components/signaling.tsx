import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Updated to match backend port
export default socket;