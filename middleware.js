const ExpressError = require("./utils/ExpressError");
const {campgroundSchema,reviewSchema }=require("./schemas.js")
const Campground=require("./models/campground")
const Review=require("./models/review")
module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You must be signed in first!!")
        return res.redirect("/login")
    }
    next();
}

module.exports.validateCampground=(req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body);
    if(error)
    {
        const msg= error.details.map(el=>el.message).join(', ');
        throw new ExpressError(msg,400);
    }
    else{
        next()
    }
}

module.exports.validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error)
    {
        const msg= error.details.map(el=>el.message).join(', ');
        throw new ExpressError(msg,400);
    }
    else{
        next()
    }
}

module.exports.isAuthor=async(req,res,next)=>{
    const { id }= req.params;
    const camp=await Campground.findById(id);
    if(!camp.author.equals(req.user._id))
    {
        req.flash("error","You don't have the permission to that")
        return res.redirect(`/campgrounds/${id}`);
    }
    next()
}
module.exports.isReviewAuthor=async(req,res,next)=>{
    const { id,reviewId }= req.params;
    const review=await Review.findById(reviewId);
    if(!review.author.equals(req.user._id))
    {
        req.flash("error","You don't have the permission to that")
        return res.redirect(`/campgrounds/${id}`);
    }
    next()
}