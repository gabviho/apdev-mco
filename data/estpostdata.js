import mongoose from "mongoose";

import { Customer } from "../models/customerSchema.js";
import { Establishment } from "../models/establishmentSchema.js";
import { Owner } from "../models/ownerSchema.js";
import { Post } from "../models/postSchema.js";
import { Comment } from "../models/commentSchema.js";
import bcrypt from 'bcrypt';


mongoose.connect('mongodb://127.0.0.1:27017/apdev_test_hi', { useNewUrlParser: true, useUnifiedTopology: true });

createOwners();
createPosts();

console.log("Process can be terminated safely now");

async function getCustomer(cusname) {
    const customer =  await Customer.findOne({name: cusname});
    return customer;
}

export default async function createOwners(){

    const ownerDetails = [

        {name: "Rica Blanco",
        username: "bebegurl",
        email: "rica@gmail.com",
        password: await bcrypt.hash("123", 10),
        location: "Taft"},

        {name: "Munch De Gracia",
        username: "bebegurl",
        email: "munch@gmail.com",
        password: await bcrypt.hash("123", 10),
        location: "Taft"},
    
        {name: "Calvin Harris",
        username: "becauseimhappy",
        email: "calvin@gmail.com",
        password: await bcrypt.hash("123", 10),
        location: "Taft"},
    
        {name: "Mel Tiangco",
        username: "kuyamels",
        email: "mel@gmail.com",
        password: await bcrypt.hash("123", 10),
        location: "Taft"},
    
        {name: "Mashed Potato",
        username: "giant",
        email: "potato@gmail.com",
        password: await bcrypt.hash("123", 10),
        location: "Taft"},
        
    ]    
    const estabList = await Establishment.find({});
    
    const owner = [];
    let index;
    for(let i = 0; i < estabList.length; i++) {
        switch(estabList[i].name) {
            case "Happy N' Healthy":
                index = 2;
                break;
            case "Kuya Mels":
                index = 3;
                break;
            case "Potato Giant":
                index = 4;
                break;
            case "Good Munch":
                index = 1;
                break;
            case "Ate Rica's Bacsilog":
                index = 0;
                break;
        }
        
        owner.push(new Owner({
            name: ownerDetails[index].name,
            username: ownerDetails[index].username,
            email: ownerDetails[index].email,
            establishment: estabList[i],
            password: ownerDetails[index].password,
            location: ownerDetails[index].location
        }));
    }

    for (let i = 0; i < owner.length; i++) {
        owner[i].save();
    }
}

export async function createPosts(){
    const posts = [];

    posts.push(new Post({
        estname: "Ate Rica's Bacsilog",
        review: "aaaaa",
        rating: "4",
        cust: await getCustomer("Gabrielle Tongol"),
        helpful_num: 11,
        nothelpful_num: 0,
    }));

    posts.push(new Post({
        estname: "Ate Rica's Bacsilog",
        review: "hello",
        rating: "4",
        cust: await getCustomer("Luke Chiang"),
        helpful_num: 2,
        nothelpful_num: 0,
    }));

    posts.push(new Post({
        estname: "Ate Rica's Bacsilog",
        review: "heheheeh",
        rating: "3",
        cust: await getCustomer("Harry Styles"),
        helpful_num: 2,
        nothelpful_num: 0,
    }));

    posts.push(new Post({
        estname: "Happy N' Healthy",
        review: "wadqa/jldfhqba/wDLJQjnbdW?DWJFKNAQKJNKBKHCF KHA AKCJKA",
        rating: "1",
        attached: [],
        cust: await getCustomer("Taylor Swift"),
        helpful_num: 0,
        nothelpful_num: 0,
    }));

    posts.push(new Post({
        estname: "Happy N' Healthy",
        review: "sARAP",
        rating: "5",
        attached: [],
        cust: await getCustomer("Gabrielle Tongol"),
        helpful_num: 0,
        nothelpful_num: 0,
    }));

    posts.push(new Post({
        estname: "Kuya Mels",
        review: "widhnaoa ehhehhee",
        rating: "5",
        attached: [],
        cust: await getCustomer("Gabrielle Tongol"),
        helpful_num: 0,
        nothelpful_num: 0,
    }));

    posts.push(new Post({
        estname: "Kuya Mels",
        review: "Vivamus id elit vel tellus tempor luctus. In hac habitasse platea dictumst. Aliquam tristique ligula odio, eu ullamcorper dolor tincidunt sed. Fusce facilisis massa eget ante suscipit iaculis. Fusce a egestas erat. Donec ac enim quis lorem feugiat interdum sed eu turpis. Donec imperdiet egestas elementum. Integer elit ipsum, porta ac imperdiet non, fermentum pellentesque neque. Aenean sed augue nunc. Ut dignissim euismod ipsum, vel tempus augue viverra sit amet. Fusce pretium, mauris sed lacinia tincidunt, eros lorem mollis libero, sit amet tempus mauris neque ac quam. Maecenas sed mauris mi. Mauris tincidunt augue enim, in posuere felis pharetra sit amet.",
        rating: "5",
        attached: ["uploads/Screenshot 2023-06-21 at 7.02.00 PM.png"],
        cust: await getCustomer("Taylor Swift"),
        helpful_num: 0,
        nothelpful_num: 0,
    }));

    posts.push(new Post({
        estname: "Happy N' Healthy",
        review: "Vivamus id elit vel tellus tempor luctus. In hac habitasse platea dictumst. Aliquam tristique ligula odio, eu ullamcorper dolor tincidunt sed. Fusce facilisis massa eget ante suscipit iaculis. Fusce a egestas erat. Donec ac enim quis lorem feugiat interdum sed eu turpis. Donec imperdiet egestas elementum. Integer elit ipsum, porta ac imperdiet non, f",
        rating: "3",
        attached: ["uploads/Screenshot 2023-06-05 at 11.58.39 AM.png"],
        cust: await getCustomer("Sam Kim"),
        helpful_num: 0,
        nothelpful_num: 0,
    }));
    

    for (let i = 0; i < posts.length; i++) {
        posts[i].save();
    }
}


