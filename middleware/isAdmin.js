const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user = await userModel.findOne({ email: decoded.email });
        if(!user.isAdmin){
            throw new Error();
        }
        next()
    } catch (error) {
        return res.status(401).json({
            message: 'Admin only!'
        })
    }
    
}