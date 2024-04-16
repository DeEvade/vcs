import { Server, Socket } from "socket.io";
import { Configuration } from "../database/entities/Configuration";
import { DataSource } from "typeorm";


const socketHandler = (io: Server,AppDataSource: DataSource ) => {

    io.on("getConfig", async (socket: Socket) => {
       try{
         const configRepository = AppDataSource.getRepository(Configuration)
        const config = await configRepository.find()
        socket.emit('configdata', config[1])
    }
    catch (error) {
        console.log("Error during default configuration creation", error); 
        socket.emit("error", "Failed to fetch configuration data");

    }
        
    });
}

export default socketHandler;