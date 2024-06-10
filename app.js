if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 8080;
const MONGO_URL = "mongodb://localhost:27017/VoyageVilla";

const listingRouter=require('./routes/listing.js');
const reviewRouter=require('./routes/reviews.js');
const userRouter=require('./routes/user.js');

const ExpressError=require("./utils/ExpressError.js");
const session=require('express-session');
const flash=require('connect-flash');

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const passport =require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user.js');


main().then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
})
async function main() {
    await mongoose.connect(MONGO_URL);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions={
    secret:"ThalaForAReason",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
        httpOnly:true,
    }
};

// app.get("/", (req, res) => {
//     res.send("Hi I am marcos")
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currUser=req.user;   //in node ejs we cannot diretly access variable
    next();
})

// app.get('/demouser',async (req,res)=>{
//     let fakeuser=new User({
//         email:"leo@gmail.com",
//         username:"demodemo"
//     })
//     let registerUser=await User.register(fakeuser,"helloworld");
//     res.send(registerUser);
// })

app.use('/listings',listingRouter);
app.use('/listings/:id/reviews',reviewRouter);
app.use('/',userRouter);



app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not found"))
})


app.use((err, req, res, next) => {
    let {status=500,message="Something went wrong"}=err;
    // res.status(status).send(message);
    res.status(status).render("error.ejs",{message})
});
app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`);
})