const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors } = require('./seedHelpers');
const axios = require('axios');

mongoose.connect('mongodb://localhost:27017/yelp-camp'
)

const db = mongoose.connection;
db.on('error',console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log('Database connected');
});

async function seedImg() {
    try {
      const resp = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          client_id: 'yeN66e3AVJb7Mh-u5bQX1nfYo8lhM3p0ldA_Lu7L6Uo',
          collections: 1114848,
        },
      })
      return resp.data.urls.small
    } catch (err) {
      console.error(err)
    }
  }
const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async()=>{
    await Campground.deleteMany({});
      // call unsplash and return small image

   for(let i = 0; i<20;i++){
       const random1000 = Math.floor(Math.random()*1000);
       const price = Math.floor(Math.random()*1000);
       

       const camp = new Campground({
           title: `${sample(descriptors)} ${sample(places)}`,
           image: await seedImg(),
           price,
           description: "Beautiful place and good campground. Good views and quite.",
           location: `${cities[random1000].city}, ${cities[random1000].state}`
       })
    
       await camp.save();
      
   }

}

seedDB().then(()=>{
    mongoose.connection.close();
});