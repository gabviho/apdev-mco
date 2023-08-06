import mongoose from "mongoose";

import { Customer } from "../models/customerSchema.js";
import { Establishment } from "../models/establishmentSchema.js";
import { Owner } from "../models/ownerSchema.js";
import { Post } from "../models/postSchema.js";
import { Comment } from "../models/commentSchema.js";


mongoose.connect('mongodb://127.0.0.1:27017/apdev_test_hi', { useNewUrlParser: true, useUnifiedTopology: true });

createComments();

console.log("Process can be terminated safely now");

async function getOwnerId(name) {
    const owner =  await Owner.findOne({name: name});
    return owner._id;
}

export default  async function createComments(){
    const comments = [];
    const posts = await Post.find({});
    let ownerid;
    for(let i = 0; i < posts.length; i++) {
        if(posts[i].estname === "Ate Rica's Bacsilog"){
            ownerid = await getOwnerId("Rica Blanco");
        }
        if(posts[i].estname === "Happy N' Healthy"){
            ownerid = await getOwnerId("Calvin Harris");
        }
        comments.push(new Comment({
            owner: ownerid,
            comment: "Thank you!",
            post_number: posts[i].id.toString(),
        }));

        
    }
    
    

    for (let i = 0; i < comments.length; i++) {
        comments[i].save();
    }
}

