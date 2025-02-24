const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

const UserSchema=new mongoose.Schema({
    name:{
        type: String,
        required:[true, 'Please add a name']
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
    email:{
        type: String,
        required:[true, 'Please add an email'],
        unique: true,
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            , 'Please add a valid email'
        ] 
    },
    role:{
        type:String,
        enum:['user', 'admin'],
        default: 'user'
    },
    password:{
        type:String,
        require:[true, 'Please add a password'],
        minlength: 6,
        select:false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    created:{
        type: Date,
        default:Date.now
    },
    invalidate_before:{
        type:Date,
        default:null
    }
});

//Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken=function(){
    return jwt.sign({id:this.id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

//Match user entered password to hashed password in Database

UserSchema.methods.matchPassword= async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

UserSchema.methods.sendTokenResponse= (user, statusCode, res)=>{
    //Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly: true
    };

    if(process.env.NODE_ENV==='production'){
        options.secure=true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    })
}

module.exports = mongoose.model('User', UserSchema);