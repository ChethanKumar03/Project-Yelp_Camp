const mongoose=require("mongoose")
const Campground=require("../models/campground")
const cities=require("./cities")
const {descriptors,places}=require("./seedHelpers")

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample= array => array[Math.floor(Math.random()*array.length)];
const seedDB= async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<300;i++)
    {
        const ind=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*100)+23;
        const camp=new Campground({
            author:"66bc8c014c2f4c193b77f84e",
            location:`${cities[ind].city}, ${cities[ind].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem minus blanditiis impedit? Rem quasi blanditiis inventore dignissimos modi quia corrupti temporibus. Nisi, maxime explicabo.',
            images:[
                {
                  url: 'https://res.cloudinary.com/dy5k6feih/image/upload/v1723888083/YelpCamp/h3k5w7ftqhcjxlda2iy2.jpg',
                  filename: 'YelpCamp/h3k5w7ftqhcjxlda2iy2',
                }
              ],
            price:price,
            geometry:{ 
                type: 'Point', 
                coordinates: [ cities[ind].longitude,cities[ind].latitude ] 
            }
        })
        await camp.save();
    }

}

seedDB().then(()=>{
    mongoose.connection.close();
});