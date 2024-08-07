import { Server } from "socket.io";
import { Game } from "./game";


const rooms = new Map<string, Game>();

export function setupListeners(io: Server) {
    io.on("connection", (socket) => {
        console.log(`New connection - ${socket.id}`);

        // listen an event
        socket.on("join-game", (roomId: string, name: string) => {
            if (!roomId) {
                // send an event
                socket.emit("error", "Invalid room ID")
            }

            if (!name) {
                // send an event
                socket.emit("error", "please provide the nickname")
            }

            // join a room
            socket.join(roomId);

            if (rooms.has(roomId)) {
                const game = rooms.get(roomId);
                if(!game){
                    return socket.emit("error", "Game not found");
                }
                game.joinPlayers(socket.id, name, socket);
            } else {
                const game = new Game(roomId, io, socket.id);
                rooms.set(roomId, game);
                game.joinPlayers(socket.id, name, socket);
            }
        })
    })
}