import { Server, Socket } from "socket.io";

export class Game {

    gameStatus: "not-started" | "in-progress" | "finished";
    gameId: string;
    players: { id: string; score: number; name: string }[];
    io: Server;
    gameHost: string;
    paragraph: string;

    constructor(id: string, io: Server, host: string) {
        this.gameId = id;
        this.players = [];
        this.io = io;
        this.gameHost = host;
        this.gameStatus = "not-started";
        this.paragraph = "";
    }

    setupListeners(socket: Socket) {
        socket.on('start-game', async () => {
            if(this.gameStatus === 'in-progress'){
                return socket.emit(
                    "error",
                    "this game has already started."
                )
            }
            if(this.gameHost != socket.id){
                return socket.emit(
                    "error",
                    "Only the host can start the game."
                )
            }
            for(let player of this.players){
                player.score = 0;
            }

            this.io.to(this.gameId).emit(
                'player', this.players)
        })
    }

    joinPlayers(id: string, name: string, socket: Socket) {
        if (this.gameStatus === 'in-progress') {
            return socket.emit(
                "error",
                "Game has already started, please wait for sometime before joining."
            );
        }
        this.players.push({ id, name, score: 0 })

        this.io.to(this.gameId).emit(
            'player-joined', { id, name, score: 0 }
        )

        socket.emit('player', this.players);
        socket.emit('new-host', this.gameHost);

        this.setupListeners(socket);
    }
}