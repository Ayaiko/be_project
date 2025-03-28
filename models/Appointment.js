const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    apptDate: {
        type: Date,
        required: true
    },
    user: {
        type:mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    },
    hotel: {
        type:mongoose.Schema.ObjectId,
        ref: 'Hotel',
        required:true
    },
    created: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('Appointment', AppointmentSchema);