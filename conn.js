const { MongoClient } = require('mongodb');

const mongoURI = process.env.MONGODB_URI;
const client = new MongoClient(mongoURI);

function connectToMongo(callback) {
    client.connect().then((client) => {
        return callback();
    }).catch((err) => {
        callback(err);
    })
}

function getDb(dbName = process.env.DB_NAME) {
    return client.db(dbName);
}

module.exports = {
    connectToMongo: connectToMongo,
    getDb: getDb
}