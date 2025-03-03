const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    district: {
        type: String,
        required: [true, 'Please add a district']
    },
    province: {
        type: String,
        required: [true, 'Please add a province']
    },
    postalcode: {
        type: String,
        required: [true, 'Please add a postal code'],
        maxlength: [5, 'Postal Code can not be more than 5 digits']
    },
    tel: {
        type: String,
        required: [true, 'Please add a phone number'],
        unique: true,
        match: [
            /^\d{10}$/,
            'Please add a valid phone number (10 digits)'
        ]
    },
    region: {
        type: String,
        required: [true, 'Please add a region']
    },
    blacklistedUsers: { 
        type: [mongoose.Schema.Types.ObjectId],  // Array of ObjectIds
        ref: 'User', // Optional: If you want to reference the 'User' model
        default: []  // Default to empty array
    }
},{
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
});

//Reverse poppulate with virtuals
HotelSchema.virtual('appointments', {
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'hotel',
    justOne:false
})

module.exports = mongoose.model('Hotel', HotelSchema);
