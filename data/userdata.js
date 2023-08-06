import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { Customer } from "../models/customerSchema.js";
import { Establishment } from "../models/establishmentSchema.js";
import { Owner } from "../models/ownerSchema.js";
import { Post } from "../models/postSchema.js";
import { Comment } from "../models/commentSchema.js";


mongoose.connect('mongodb://127.0.0.1:27017/apdev_test_hi', { useNewUrlParser: true, useUnifiedTopology: true });

createCustomers();
createEstablishments();

console.log("Process can be terminated safely now");


export default async function createCustomers(){
    const customers = [];

    customers.push(new Customer({
        name: "Gabrielle Tongol",
        username: "bebegurl",
        email: "gab@gmail.com",
        password: await bcrypt.hash("123", 10),
        location: "Taft",
        path: "uploads/charlie.jpg",
        userbio: "I love taylor swift"
    }));

    customers.push(new Customer({
        name: "Taylor Swift",
        username: "swiftie",
        email: "tay@gmail.com",
        password: await bcrypt.hash("123", 10),
        location: "Taft",
        path: "uploads/charlie.jpg",
        userbio: "screaming and fighting and kissing in the rain "
    }));

    customers.push(new Customer({
        name: "Sam Kim",
        username: "sam",
        email: "sam@gmail.com",
        password: await bcrypt.hash("123", 10),
        location: "Taft",
        path: "uploads/charlie.jpg",
        userbio: "can you love me like that"
    }));

    customers.push(new Customer({
        name: "Harry Styles",
        username: "harreeey",
        email: "harry@gmail.com",
        password: await bcrypt.hash("123", 10),
        location: "Taft",
        path: "uploads/charlie.jpg",
        userbio: "baby you are the love of my life"
    }));

    customers.push(new Customer({
        name: "Luke Chiang",
        username: "bebeboi",
        email: "luke@gmail.com",
        password: await bcrypt.hash("123", 10),
        location: "Taft",
        path: "uploads/charlie.jpg",
        userbio: "keeping you close shouldn't be hard"
    }));

    for (let i = 0; i < customers.length; i++) {
        customers[i].save();
    }
}


export async function createEstablishments(){

    const estDetails = [

        {name: "Ate Rica's Bacsilog",
        description: "The standard Silog meal is composed of 1 major ingredient (ex. Bacon, Tapa, Tocino, etc.) 1 piece egg, Ate Rica’s Special Cheese Sauce and liquid savor topped on 1 cup of rice. More than 15 years of operations later, Ate Rica's Bacsilog remains strong and determined to provide to more people the famous Bacsilog with its memorable recipe and taste; a taste that, in the words of a blogger, \"the Lasallian community holds close to their hearts.\"",
        path: "../sprites/header-aterica.png",
        icon: "../sprites/png-bacsilog.png",
        link: "/estAteRicas"},

        {name: "Good Munch",
        description: "Good Munch serves SO MUNCH BETTER Asian Fusion Recipes curated with lots of love from Chef Munch! After a walk around De La Salle University, many visitors stop by this restaurant. If you never turned out to taste Filipino cuisine, take your chance at Good Munch. Clients can have tasty chicken at this place.",
        path: "../sprites/header-goodmunch.png",
        icon: "../sprites/png-goodmunch.png",
        link: "/estGoodMunch"},
    
        {name: "Happy N' Healthy",
        description: "Sustainable diets allow for occasional indulgences in comfort foods, so don't hesitate to treat yourself now and then to our Happpy combo of Pasta, Pizza, and Potato Wedges!",
        path: "../sprites/header-hnh.png",
        icon: "../sprites/png-hnh.png",
        link: "/estHappyNHealthy"},
    
        {name: "Kuya Mels",
        description: "Kuya Mel's is a popular food stall located in the bustling market area of Agno. It is a vibrant and lively establishment known for its mouthwatering street food and delectable local delicacies. The stall is named after its owner, Kuya Mel, who is renowned for his culinary skills and dedication to providing top-notch food to his customers. It is mostly popular for its student-friendly price and still very worth every penny. Their menu contains mostly classic Filipino foods. As what Lasallians say, a \"must-try\"!",
        path: "../sprites/header-kuyamel.jpg",
        icon: "../sprites/png-kuyamel.png",
        link: "/estKuyaMels"},
    
        {name: "Potato Giant",
        description: "If you’re always in the mood for fries or other deep-fried potato treats, why not head on to Potato Giant! Discover this food court favorite and get your fix of seriously satisfying potatoes– from classic fries to thick cut creations, all topped off with loads and fun and flavors.",
        owner_id: "64bceedb14a9df3a7505c2c9",
        path: "../sprites/header-potato.png",
        icon: "../sprites/png-potato.png",
        link: "/estPotatoGiant"},
        
    ]        
    const establishments = [];
    for(let i = 0; i < estDetails.length; i++) {
        
        establishments.push(new Establishment({
            name: estDetails[i].name,
            description: estDetails[i].description,
            path: estDetails[i].path,
            icon: estDetails[i].icon,
            link: estDetails[i].link
        }));
    }

    for (let i = 0; i < establishments.length; i++) {
        establishments[i].save();
    }
}
