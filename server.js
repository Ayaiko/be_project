const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const cors = require('cors');

//Load env vars
dotenv.config({path:'./config/config.env'});

connectDB();

const hotels = require('./routes/hotels');
const auth = require('./routes/auth');
const appointments = require('./routes/appointment');
const { connect } = require('mongoose');

const app = express();

//Body Parser
app.use(express.json());

//Enable Cors
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

//Cookie Parser
app.use(cookieParser());

app.use('/api/appointments', appointments);
app.use('/api/hotels', hotels);
app.use('/api/auth', auth);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection', (err, promise) =>{
    console.log(`Error: ${err.message}`);

    server.close(() => process.exit(1));
});