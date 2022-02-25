const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors } = require('./seedHelpers');


mongoose.connect('mongodb://localhost:27017/yelp-camp'
)

const db = mongoose.connection;
db.on('error',console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log('Database connected');
});


const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async()=>{
    await Campground.deleteMany({});
      // call unsplash and return small image
   for(let i = 0; i<50;i++){
       const random1000 = Math.floor(Math.random()*1000);
       const price = Math.floor(Math.random() * 20) + 10;
       
       const camp = new Campground({
           author:'620bc01084d7d4d816165565',
           location: `${cities[random1000].city}, ${cities[random1000].state}`,
           title: `${sample(descriptors)} ${sample(places)}`,
           description: "Beautiful place and good campground. Good views and quite.",
           price,
           geometry: {
                type: "Point",
                coordinates: [
            cities[random1000].longitude,
            cities[random1000].latitude,
               ]
            },

           images: [
             {
               url:'https://res.cloudinary.com/dixvdffo4/image/upload/v1645123434/YelpCamp/xigu5c3nzqpclwfmonh0.jpg',
               filename: 'YelpCamp/xigu5c3nzqpclwfmonh0'
             },
            { url: 'https://res.cloudinary.com/dixvdffo4/image/upload/v1645115563/YelpCamp/ps1a2muzjybmsmgmludo.jpg',
             filename: 'YelpCamp/ps1a2muzjybmsmgmludo'
            }
           ]
        })
       await camp.save();
   }
}

seedDB().then(()=>{
    mongoose.connection.close();
});