import { io } from "socket.io-client";

console.log(import.meta.env.VITE_serverURL);
export const socket = io(import.meta.env.VITE_serverURL);