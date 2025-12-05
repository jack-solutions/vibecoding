import mongoose from "mongoose";

const connectDB = async () => {
    try {

        // if (mongoose.connection.readyState >= 1) {
        //     // Already connected or connecting
        //     return;
        // }
        mongoose.connect(process.env.MONGODB_URI!, {
            dbName: "vibecoding-youtube-clone",
        })
        const connection = mongoose.connection;

        connection.on('connected', () => {
            console.log("connected to database successfully")
        })

        connection.on('error', (error) => {
            console.log("error connecting database")
            console.log(error);
            process.exit()
        })

    } catch (error) {
        console.log("Error connecting to DB")
        console.log(error)
    }
}

export default connectDB;











// import mongoose from "mongoose";

// declare global {
//     var mongoose: {
//         conn: typeof mongoose | null;
//         promise: Promise<typeof mongoose> | null;
//     };
// }

// const MONGODB_URI = process.env.MONGODB_URI!;

// if (!MONGODB_URI) {
//     throw new Error(
//         "Please define the MONGODB_URI environment variable inside .env.local"
//     );
// }

// /**
//  * Global is used here to maintain a cached connection across hot reloads
//  * in development. This prevents connections growing exponentially
//  * during API Route usage.
//  */
// let cached = global.mongoose;

// if (!cached) {
//     cached = global.mongoose = { conn: null, promise: null };
// }

// async function connectDB() {
//     if (cached.conn) {
//         return cached.conn;
//     }

//     if (!cached.promise) {
//         const opts = {
//             bufferCommands: false,
//         };

//         cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
//             console.log("✅ MongoDB connected successfully");
//             return mongoose;
//         });
//     }

//     try {
//         cached.conn = await cached.promise;
//     } catch (e) {
//         cached.promise = null;
//         throw e;
//     }

//     return cached.conn;
// }

// export default connectDB;
