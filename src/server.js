const http = require('http');
const { connectToDatabase } = require('../service/mongo');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app)

function startServer(){
    connectToDatabase();

    server.listen(PORT, ()=>{
        console.log('server is running on ' + PORT);
    })
}

startServer();