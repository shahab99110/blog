const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
let database;
async function connect() {
  console.log('database connected')
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  database = client.db("blog");
}

function getDb() {
  if (!database) {
    throw { message: "Database is not connected" };
  }
  return database;
}

module.exports = {
  connectToDatabase: connect,
  getDb: getDb,
};
