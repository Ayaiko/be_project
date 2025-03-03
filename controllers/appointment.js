const { default: mongoose } = require('mongoose');
const Appointment = require('../models/Appointment');
const Hotel = require('../models/Hotel');

//@desc Get all appointment
//@route Get /api/appointments
//@access Public
exports.getAppointments = async (req, res, next) =>{
    let query;
    //General User can only see their appointment
    if(req.user.role !== 'admin'){
        //console.log(req.user._id);
        query = Appointment.find({user:req.user.id}).populate({
            path: 'hotel',
            select: 'name province tel'
        });
    }else {//Admin can see all
        if(req.params.hotelId){
            console.log(req.params.hotelId);

            query = Appointment.find({hotel:req.params.hotelId}).populate({
                path: 'hotel',
                select: 'name province tel'
            });
        }else {
            query = Appointment.find().populate({
                path: 'hotel',
                select: 'name province tel'
            });
        }
    }

    try{
        const appointments = await query;

        res.status(200).json({
            success:true,
            count:appointments.length,
            data: appointments
        });
    } catch(err){
        console.log(err);
        return res.status(500).json({success:false,
            message:"Cannot find Appointment"
        });
    }
};

//@desc Get single appointment
//@route Get /api/appointments/:id
//@access Public
exports.getAppointment = async (req, res, next) => {
    try{
        if(req.params.id !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,
                message: 'User is not authorized to access this appointment'
            });
        }

        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'hotel',
            select: 'name province tel'
        })

        if(!appointment){
            return res.status(404).json({success:false, 
                message: `No appointment with an id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success:true,
            data: appointment
        });

    } catch(err){
        console.log(err);
        return res.status(500).json({success:false, message:'Cannot find Appointment'});
    }
};


//@desc Add appointment
//@route POST /api/hotelId/appointments
//@access Public
exports.addAppointment = async (req, res, next)=>{
    try{
        req.body.hotel=req.params.hotelId;
        req.body.user = req.user.id;
        
        const existedAppointments = await Appointment.find({user:req.user.id});

        if(existedAppointments.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false, 
                message: `The user with ID ${req.user.id} has already made 3 appointments`
            });
        }


        const hotel =  await Hotel.findById(req.params.hotelId);

        if(!hotel){
            return res.status(404).json({success:false, 
                message: `No hotel with an id of ${req.params.hoId}`
            });
        }

        if (hotel.blacklistedUsers && hotel.blacklistedUsers.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} is blacklisted from this hotel`
            });
        }

        const appointment = await Appointment.create(req.body);

        res.status(200).json({
            success:true,
            data:appointment
        });
    } catch(err){
        console.log(err);
        return res.status(500).json({success:false,
           message: "Cannot create Appointment"
        });
    }
};

//@desc Update appointment
//@route PUT /api/appointments/:id
//@access Private
exports.updateAppointment = async (req, res, next)=>{
    try{
        let appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false, 
                message: `No appointment with an id of ${req.params.id}`
            });
        }

        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false, 
                message: `User ${req.user.id} is not authorized to update this appointment`
            });
        }


        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new:true,
            runValidators: true
        });

        res.status(200).json({
            success:true,
            data:appointment
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({success:false,
            message:"Cannot update Appointment"
        });
    }
};

//@desc Delete appointment
//@route DELETE /api/appointments/:id
//@access Private
exports.deleteAppointment = async (req, res, next)=>{
    try{
        let appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false, 
                message: `No appointment with an id of ${req.params.id}`
            });
        }

        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false, 
                message: `User ${req.user.id} is not authorized to delete this appointment`
            });
        }

        await appointment.deleteOne();

        res.status(200).json({
            success:true,
            data: {}
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({success:false,
            message:"Cannot delete Appointment"
        });
    }
};
