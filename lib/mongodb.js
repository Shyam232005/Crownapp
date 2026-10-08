import mongoose from 'mongoose';

const getMongoUri = () => {
    let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/CrownEcosytems';
    if (!uri.includes('retryWrites=')) {
        uri += (uri.includes('?') ? '&' : '?') + 'retryWrites=false';
    }
    return uri;
};

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            retryWrites: false
        };

        cached.promise = mongoose.connect(getMongoUri(), opts).then((mongooseInstance) => {
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}