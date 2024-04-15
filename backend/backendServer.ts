import express from 'express';
import path from 'path';


import { ExpressPeerServer } from "peer";

const app = express();

const server = app.listen(3001);

const peerServer = ExpressPeerServer(server);

app.use("/peerjs", peerServer);

server.listen();


