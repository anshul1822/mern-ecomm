import mongoose from 'mongoose';

let isConnected = false; //Variable to track the connection status

export const connectToDB = async () => {

    mongoose.set('strictQuery', true);

    if(!process.env.MONGO_URI) return console.log('MONGO_URI is not defined');

    if(isConnected) return console.log('=> using existing database connection');

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDb connected.....");
        isConnected = true;
    } catch (error) {
        console.log(error);
    }
}