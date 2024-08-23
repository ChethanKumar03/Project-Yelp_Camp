const Campground=require("../models/campground")
const {cloudinary}=require("../cloudinary")
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
const { query } = require("express");
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken});
module.exports.index=async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render("campgrounds/index",{campgrounds});
 }

 module.exports.renderNewForm=(req,res)=>{
    res.render("campgrounds/new");
}

module.exports.createCampground=async(req,res)=>{
    const geoData=await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send();

    const camp=new Campground(req.body.campground);
    camp.geometry=geoData.body.features[0].geometry;
    camp.images=req.files.map(f=> ({url:f.path,filename:f.filename})) 
    camp.author=req.user._id;
    console.log(camp);
     await camp.save();
     req.flash('success',"Successfully made a new campground")
     res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.showCampground=async(req,res)=>{
    const camp=await Campground.findById(req.params.id).populate({
        path:"reviews",
        populate:{
            path:"author"
        }
    }).populate("author");
    if(!camp)
    {
        req.flash("error","cannot find the campground")
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show",{camp})
}

module.exports.renderEditForm=async(req,res)=>{
    const { id }= req.params;
    const campground=await Campground.findById(id);
    if(!campground)
    {
        req.flash("error","cannot find the campground")
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit",{ campground });  
}

module.exports.updateCampground=async(req,res)=>{
    const { id }= req.params;
    // console.log(req.body);
    const campground=await Campground.findByIdAndUpdate( id ,{ ...req.body.campground});
    const imgs= req.files.map(f=> ({url:f.path,filename:f.filename}))
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages)
    {
        for(let filename of req.body.deleteImages)
            await cloudinary.uploader.destroy(filename)
        await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
    }
    req.flash('success',"Successfully updated campground")
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground=async(req,res)=>{
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success',"Successfully deleted campground")
    res.redirect(`/campgrounds`);
}