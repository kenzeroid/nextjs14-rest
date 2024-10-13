import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async ()=>{
    const connectionState = mongoose.connection.readyState;

    if(connectionState === 1){
        return console.log("Already connected");
    }

    if(connectionState === 2){
        return console.log("Connecting");
    }

    try {
        mongoose.connect(MONGODB_URI!, {
            dbName: "nextRestApi",
            bufferCommands: true
        });
        console.log("Connected");
    } catch (error){
        console.log("Error: ", error);
        if(error instanceof Error){
            throw new Error("Error: ", error);
        }
    }
}

export default connect;