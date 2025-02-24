const User = require('../models/User');

//@desc     Register user
//@route    POST /api/auth/register
//@access   Public
exports.register = async (req, res, next)=>{
    try{
        const {name, tel, email, password, role} = req.body;

        const user = await User.create({
            name,
            tel,
            email,
            role,
            password
        });

        //Create token
        //const token = user.getSignedJwtToken();
        //res.status(200).json({success:true, token});
        user.sendTokenResponse(user, 200, res);

    }catch(err){
        res.status(400).json({success:false});
        console.log(err.stack);
    }
}

//@desc Login user
//@route POST /api/auth/login
//@access Public
exports.login = async (req, res, next)=>{
    const {email, password} = req.body;

    //Validate email & password
    if(!email || !password){
        return res.status(400).json({succes:false, 
            msg:'Please provide an email and password'
        });
    }

    //Check for user
    const user = await User.findOne({email}).select('+password');

    if(!user){
        return res.status(400).json({success:false, msg:'Invalid credentials'});
    }
    
    //Check if password matches
    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        return res.status(400).json({success:false, msg:'Invalid credentials'});
    }

    //Create token
    //const token = user.getSignedJwtToken();
    //res.status(200).json({success:true, token});
    user.sendTokenResponse(user, 200, res);
}

//@desc Get Current Logged in user
//@route POST /api/auth/logout
//@access Private
exports.logout = async(req, res, next)=>{
    try{
            await User.findByIdAndUpdate(req.user.id, { invalidate_before: new Date()}, {
                new:true,
                runValidators: true
            });
    
            res.status(200).json({
                success:true,
            });
    
        }catch(err){
            console.log(err);
            return res.status(500).json({success:false,
                message:"Cannot log out user"
            });
        }
}

//@desc Get Current Logged in user
//@route POST /api/auth/me
//@access Private
exports.getMe= async(req, res, next)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        succes:true,
        data:user
    });
}