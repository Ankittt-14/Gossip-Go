import jwt from "jsonwebtoken";
import { asynchandler } from "../utilities/asynchandler.utilities.js";
import { errorhandler } from "../utilities/errorhandler.utilities.js";
import User from "../models/user.model.js";

export const isAuthenticated = asynchandler(async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return next(new errorhandler("Please login to access this resource", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded._id);
        
        if (!req.user) {
            return next(new errorhandler("User not found", 404));
        }
        
        next();
    } catch (error) {
        return next(new errorhandler("Invalid token", 401));
    }
});