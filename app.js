if(process.env.NODE_ENV!=="production")
{
    require('dotenv').config();
}
const express=require("express");
const path=require("path")
const mongoose=require("mongoose")
const methodOverride=require("method-override")
const ejsMate=require("ejs-mate");
const session=require("express-session")
const flash=require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const passport=require("passport");
const localStrategy=require("passport-local")
const User=require("./models/user")
const mongoSanitize=require("express-mongo-sanitize");
const MongoDBStore=require("connect-mongo");

const userRouters=require("./routes/users")
const campgroundRouters=require("./routes/campgrounds")
const reviewRouters=require("./routes/reviews")

const urlDB=process.env.DB_URL;
const a='mongodb://localhost:27017/yelp-camp'
mongoose.connect(a);

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app=express();

app.engine('ejs',ejsMate);
app.set('view engine', "ejs");
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,"public")));
app.use(mongoSanitize({
    replaceWith:'_'
}));

app.use(session({
    secret:"thisshouldbeabettersecret",
    saveUninitialized: false,
    resave: false, 
    store:MongoDBStore.create({
        mongoUrl:a,
        ttl:24*60*60
    })
}))

const sessionConfig={
    name:"session",
    secret:"thisshouldbeabettersecret",
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
})

app.use("/",userRouters);
app.use("/campgrounds",campgroundRouters);
app.use("/campgrounds/:id/reviews",reviewRouters);
app.get("/",(req,res)=>{
    res.render('home')
})
app.get("/fakeUser",async (req,res)=>{
    const user=new User({email:"abcd@gmail.com",username:"abcd"});
    const userregister=await User.register(user,"abcd");
    res.send(userregister);
})

app.all("*",(req,res,next)=>{
    next(new ExpressError("page not found",404));
})
app.use((err,req,res,next)=>{
    const {status=500}=err;
    if(!err.message)
        err.message="Something went wrong"
    res.status(status).render('error',{err});
})

app.listen(3000,()=>{
    console.log("connection at port 3000");
})