if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users')
 const campgroundsRoutes = require('./routes/campgrounds')
 const reviewsRoutes = require('./routes/reviews')

 

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.on('error',console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log('Database connected');
});

const app = express();
app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')) //for route

app.use(express.urlencoded({extended:true})) //for parser body
app.use(methodOverride('_method'));//for put, delete
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize({
replaceWith:'_'
}));//stay same page if wrong url

const secret = process.env.Secret || 'thisshouldbeabettersecret!';

const sessionConfig ={
    name:'session',//dont use default name,so others can not use default name steal user's info
    secret:'thisshouldbeabettersecret!',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge:1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/dixvdffo4/", 
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
     "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/dixvdffo4/", 
];
const connectSrcUrls = [
      "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
"https://res.cloudinary.com/dixvdffo4/", 
];
const fontSrcUrls = ["https://res.cloudinary.com/dixvdffo4/",];
//Helmet helps you secure your Express apps by setting various HTTP headers.
app.use(
     helmet({
        contentSecurityPolicy: {
            directives : {
                defaultSrc : [],
                connectSrc : [ "'self'", ...connectSrcUrls ],
                scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
                styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
                workerSrc  : [ "'self'", "blob:" ],
                objectSrc  : [],
                imgSrc     : [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/dixvdffo4/", 
                    "https://images.unsplash.com/"
                ],
                fontSrc    : [ "'self'", ...fontSrcUrls ],
                mediaSrc   : [ "https://res.cloudinary.com/dlzez5yga/" ],
                childSrc   : [ "blob:" ]
            }
        },
        crossOriginEmbedderPolicy: false
    })
);


//session must befor passport.session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//give every template access to the messages we flash
app.use((req,res,next)=>{
  
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes)
app.use('/campgrounds',campgroundsRoutes)
app.use('/campgrounds/:id/reviews',reviewsRoutes)



app.get('/',(req,res)=>{
    res.render('home')
})


app.all('*', (req,res,next)=>{
   next(new ExpressError('Page not found', 404))
})

app.use((err,req,res,next)=>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh no, Something went wrong!'
    res.status(statusCode).render('error',{err});

}
);

app.listen(3000,()=>{
    console.log("Serving on port 3000")
})