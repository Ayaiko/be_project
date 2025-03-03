const Appointment = require('../models/Appointment.js');
const Hotel = require('../models/Hotel.js');
const asyncHandler = require('express-async-handler');
//@desc Get all Hotels
//@route GET /api/hotels
//@access Public
exports.getHotels= asyncHandler(async (req, res, next)=>{
    try{    
        let query;

        //Copy req.query
        const reqQuery = {...req.query};

        //Field to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        //Loop over remove fields and remove them from reqQuery
        removeFields.forEach(param=>delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);

        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);

        //console.log(JSON.parse(queryStr));

        //finding resource
        query = Hotel.find(JSON.parse(queryStr)).populate('appointments');

        //Select Fields
        if(req.query.select){
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }
        //Sort
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else{
            query = query.sort('-createdAt');
        }

        //Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Hotel.countDocuments();

        query = query.skip(startIndex).limit(limit);

        //Executing query
        const hotels = await query;

        //Pagination result
        const pagination = {};

        if(endIndex < total){
            pagination.next = {
                page:page + 1,
                limit
            }
        }

        if(startIndex > 0){
            pagination.prev = {
                page:page - 1,
                limit
            }
        }

        res.status(200).json({succes:true, count:hotels.length, pagination, data:hotels});
    } catch(err){
        res.status(400).json({success:false});
    }
});

//@desc Get single Hotels
//@route GET /api/hotels/:id
//@access Public
exports.getHotel= async (req, res, next)=>{
    try{
        const hotel = await Hotel.findById(req.params.id);

        if(!hotel){
            return res.status(400).json({succes:false, message:"cannot get the Hotel"});
        }

        res.status(200).json({success:true, data:hotel});
    } catch(err){
        res.status(400).json({succes:false});
    }
};

//@desc Create single Hotels
//@route POST /api/hotels
//@access Public
exports.createHotel= async (req, res, next)=>{
    const hotel = await Hotel.create(req.body);
    res.status(201).json({success:true, data:hotel});
};

//@desc Update single Hotels
//@route PUT /api/hotels
//@access Public
exports.updateHotel= async (req, res, next)=>{
    try{
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!hotel){
            return res.status(400).json({success:false});
        }
        
        res.status(200).json({success:true, data:hotel});
    } catch(err){
        res.status(400).json({success:false});
    }
    
};

//@desc Delete single Hotels
//@route POST /api/hotels
//@access Public
exports.deleteHotel= async (req, res, next)=>{
    try{
        const hotel = await Hotel.findByIdAndDelete(req.params.id);

        if(!hotel){
            return res.status(404).json({success:false, 
                message:`Hotel not found with id of ${req.params.id}`});
        }

        await Appointment.deleteMany({hotel: req.params.id});
        await Hotel.deleteOne({_id: req.params.id});
        
        res.status(200).json({success:true, data: {}});
    } catch(err){
        res.status(400).json({success:false});
    }
};

//@desc blacklist user from making appointment
//@route POST /api/hotel/hotelId/blacklist
//@access Private
exports.blacklistUser= async (req, res, next)=>{
    try{
        const hotelId = req.params.hotelId;
        const { userId } = req.body;

        if(!userId)
            return res.status(400).json({success:false, message: "User ID is required"});
        
        const hotel = await Hotel.findByIdAndUpdate(
            hotelId, 
            { $addToSet: { blacklistedUsers: userId } }, // Update operation
            { runValidators: true, new: true } // Options
        );
        

        if(!hotel)
            return res.status(404).json({success:false, message:`There's no hotel with ID ${hotelId}`});

        res.status(200).json({success:true, hotel});
    } catch(err){
        console.log(err);
        res.status(400).json({success:false, err});
    }
}