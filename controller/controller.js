import { Customer } from "../models/customerSchema.js";
import { Establishment } from "../models/establishmentSchema.js";
import { Owner } from "../models/ownerSchema.js";
import { Post } from "../models/postSchema.js";
import { Comment } from "../models/commentSchema.js";
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

let registerValues = null;
let activeUser = null;
let activeUserRole = null;
let isOwner = true;
let estData;
let userData = null;

import multer from 'multer';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // The folder where uploaded images will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });


const controller = {
    getIndex: async function(req, res) {

       res.render('index', {
            layout: 'indexlayout',

       });
       res.status(200);
       return;
    },

    getHome: async function(req, res) {
        res.render('homepage', {
            layout: 'homepagelayout',
            isLoggedIn: activeUser !== null
        });
        res.status(200);
        return;
            
    },

    getLogin: async function(req, res) {

        res.render('login', {
             layout: 'loginlayout',
        });
        res.status(200);
        return;
    },

    getRegister: async function(req, res) {

        res.render('register', {
             layout: 'registerlayout',
             values: registerValues,
 
        });
        res.status(200);
        return;
    },

    registerUser: async function(req, res) {
        try {
            const userdata = req.body;
            delete userdata.submit;
            registerValues = userdata;
            console.log(userdata);
            
            const existingCustomer = await Customer.findOne({email: userdata.email});
            const existingOwner = await Owner.findOne({email: userdata.email});
            

            if (existingCustomer || existingOwner) {
                const queryParams = new URLSearchParams();
                queryParams.append('message', 'Email already exists!');
                const queryString = queryParams.toString();
                return res.redirect(`/register?${queryParams.toString()}`);
            }
            else {
                if(userdata.role === 'customer'){
                    // create new user
                    const newCustomer = new Customer({
                        name: userdata.name,
                        username: userdata.username,
                        email: userdata.email,
                        location: userdata.location,
                        date: userdata.date,
                        password: userdata.password,
                        });
                    console.log(newCustomer);
                    //save to db
                    newCustomer.save().then(function (err) {
                        if (err) {
                            console.log(err);
                            const queryParams = new URLSearchParams();
                            queryParams.append('message', 'Error creating user!');
                            return res.redirect(`/`);
                        }
                        
                        activeUser = newCustomer;
                        activeUserRole = 'customer';
                        registerValues = null;
                        res.redirect('/home');
                    });
                }   
                else if(userdata.role ==='owner'){
                    // create new est profile
                    const newOwner = new Owner({
                        name: userdata.name,
                        username: userdata.username,
                        email: userdata.email,
                        password: userdata.password,
                        location: userdata.location,
                    });

                    //save to db
                    newOwner.save().then(function (err) {
                        if (err) {
                            const queryParams = new URLSearchParams();
                            queryParams.append('message', 'Error creating establishment!');
                            return res.redirect(`/`);
                        }
                        activeUser = newOwner;
                        activeUserRole = 'owner';
                        registerValues = null;
                        res.redirect('/home');
                    });
                }
            }
            return;
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    
    },

    loginUser: async function(req, res) {
        try {
            const userdata = req.body;
            delete userdata.submit;
            console.log(userdata);
            
            const existingCustomer = await Customer.findOne({email: userdata.email});
            const existingOwner = await Owner.findOne({email: userdata.email});
            
            
            
             
            if(existingCustomer && await bcrypt.compare(userdata.password, existingCustomer.password)) {
                activeUserRole = 'customer';
                activeUser = existingCustomer;
                return res.redirect(`/home`);
            }
            else if(existingOwner && await bcrypt.compare(userdata.password, existingOwner.password)) {
                activeUserRole = 'owner';
                activeUser = existingOwner;
                isOwner = true;
                return res.redirect(`/viewProfile`);
            }
            else {
                const queryParams = new URLSearchParams();
                queryParams.append('message', 'Invalid email or password');
                const queryString = queryParams.toString();
                return res.redirect(`/login?${queryParams.toString()}`);
            }
            
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    }, 

    logoutUser: async function(req, res) {
        activeUser = null;
        res.redirect(`/`);
    },

    viewProfile: async function(req, res) {
        if(activeUserRole == 'customer') {
            activeUser = await Customer.findOne({_id: activeUser._id});
            let temp_userData = {
                name: activeUser.name, 
                username: activeUser.username,
                email: activeUser.email,
                password: activeUser.password,
                date: activeUser.date.toString().substring(0, 9),
                location: activeUser.location,
                path: activeUser.path,
                userbio: activeUser.userbio,
            }

            const posts = await Post.find({ cust: activeUser._id } );
            let temp_cust;
            let temp_post = [];
            for (let i = 0; i < posts.length; i++) {
                temp_cust = await Customer.findOne({ _id: posts[i].cust});
                temp_post.push({
                    _id: posts[i]._id.toString(),
                    review: posts[i].review,
                    estname: posts[i].estname,
                    cust: posts[i].cust,
                    cust_name: temp_cust.name,
                    rating: posts[i].rating,
                    attached: posts[i].attached,
                    helpful_num: posts[i].helpful_num,
                    nothelpful_num: posts[i].nothelpful_num,
                });
            }


            res.render('viewprofile', {
                layout: 'viewprofilelayout',
                userData: temp_userData,
                postData: temp_post,
            })
        }
        else if(activeUserRole == 'owner') {
            let temp_userData = {
                name: activeUser.name, 
                username: activeUser.username,
                email: activeUser.email,
                password: activeUser.password,
                location: activeUser.location,
                establishment: activeUser.establishment
            }
            
            

            const estData = await Establishment.findOne({_id: activeUser.establishment});
            let temp_estData = {
                name: estData.name,
                description: estData.description,
                owner: estData.owner,
                path: estData.path,
                icon: estData.icon,
            };

            const posts = await Post.find({ estname: estData.name });
            let temp_cust;
            let temp_post = [];let temp_owner;
            let temp_comments;
            let comments = [];
            for (let i = 0; i < posts.length; i++) {
                comments = [];
                temp_comments = await Comment.find({post_number: posts[i]._id});
                console.log(posts[i]);
                for (let j = 0; j < temp_comments.length; j++) {
                    temp_owner = await Owner.findOne({ _id: temp_comments[j].owner});
                    
                    let temp_est = await Establishment.findOne({_id: temp_owner.establishment});
    
                    comments.push({
                        comment: temp_comments[j].comment,
                        owner_name: temp_owner.name,
                        estname: temp_est.name,
                        pic: temp_est.icon
                    })
                }
                temp_cust = await Customer.findOne({ _id: posts[i].cust});
                temp_post.push({
                    _id: posts[i]._id.toString(),
                    review: posts[i].review,
                    estname: posts[i].estname,
                    cust: posts[i].cust,
                    cust_name: temp_cust.name,                
                    cust_profpic: temp_cust.path,
                    rating: posts[i].rating,
                    attached: posts[i].attached,
                    helpful_num: posts[i].helpful_num,
                    nothelpful_num: posts[i].nothelpful_num,
                    comments: comments,
                });
            }
            const averageRating = calculateAverageRating(temp_post);

            res.render('ownerview', {
                layout: 'ownerlayout',
                userData: temp_userData,
                isLoggedIn: activeUser !== null,
                isOwner: isOwner,
                postlength: temp_post.length,
                postData: temp_post,
                rating: averageRating,
                estData: temp_estData,
            })
        }

        
    },

    editUser: async function(req, res) {
        if(activeUserRole == 'customer') {
            let temp_userData = {
                name: activeUser.name, 
                username: activeUser.username,
                email: activeUser.email,
                password: activeUser.password,
                date: activeUser.date.toString().substring(0, 9),
                location: activeUser.location,
                path: activeUser.path,
                userbio: activeUser.userbio,
            }


            res.render('editprofile', {
                layout: 'editprofilelayout',
                userData: temp_userData,
    
            })
        }
        
    },

    editUserDetails:  async function(req, res) {
        const updatedDetails = req.body;
        
        let img_path = req.file;
        if(img_path === undefined){
            img_path = activeUser;
        }           
        
        if(activeUserRole == 'customer') {
            const updateUser = await Customer.updateOne({_id: activeUser._id}, {$set: {
                path: img_path.path,
                name: updatedDetails.name,
                username: updatedDetails.username,
                email: updatedDetails.email,
                location: updatedDetails.location,
                userbio: updatedDetails.userbio,
                password: updatedDetails.password,
            
            
            }});

            res.redirect(`/viewprofile`);
            
        }
        
    },

    getEstablishments: async function(req, res) {
        const estData = await Establishment.find({});
        const establishments = [];
        for (let i = 0; i < estData.length; i++) {
            establishments.push({
                name: estData[i].name,
                description: estData[i].description,
                owner: estData[i].owner,
                path: estData[i].path,
                icon: estData[i].icon,
                link: estData[i].link,
            });
        }
        res.render('estabpage', {
            layout: 'homepagelayout',  
            establishments: establishments,
            isLoggedIn: activeUser !== null,
        })
    },

    getEstAteRicas: async function(req, res) {
        const estData = await Establishment.findOne({name: "Ate Rica's Bacsilog"});
        let temp_estData = {
            name: estData.name,
            description: estData.description,
            owner: estData.owner,
            path: estData.path,
            icon: estData.icon,
        };

        const posts = await Post.find({ estname: "Ate Rica's Bacsilog" });
        console.log("hellloooo");
        let temp_cust;
        let temp_owner;
        let temp_comments;
        let temp_post = [];
        let comments = [];
        for (let i = 0; i < posts.length; i++) {
            comments = [];
            temp_comments = await Comment.find({post_number: posts[i]._id});
            console.log(posts[i]);
            for (let j = 0; j < temp_comments.length; j++) {
                temp_owner = await Owner.findOne({ _id: temp_comments[j].owner});
                
                let temp_est = await Establishment.findOne({_id: temp_owner.establishment});

                comments.push({
                    comment: temp_comments[j].comment,
                    owner_name: temp_owner.name,
                    estname: temp_est.name,
                    pic: temp_est.icon
                })
            }
            temp_cust = await Customer.findOne({ _id: posts[i].cust});
            temp_post.push({
                _id: posts[i]._id.toString(),
                review: posts[i].review,
                estname: posts[i].estname,
                cust: posts[i].cust,
                cust_name: temp_cust.name,
                cust_profpic: temp_cust.path,
                rating: posts[i].rating,
                attached: posts[i].attached,
                helpful_num: posts[i].helpful_num,
                nothelpful_num: posts[i].nothelpful_num,
                comments: comments,
                
            });
            console.log(temp_post[i]);
            console.log(temp_post[i].comments);
        }
        const averageRating = calculateAverageRating(temp_post);
        res.render('establishment', { 
            layout: 'estlayout',
            estData: temp_estData,
            postlength: temp_post.length,
            postData: temp_post,
            rating: averageRating,
            isLoggedIn: activeUser !== null,
            isOwner: true,
        });
    },

    getEstGoodMunch: async function(req, res) {
        const estData = await Establishment.findOne({name: "Good Munch"});
        let temp_estData = {
            name: estData.name,
            description: estData.description,
            owner: estData.owner,
            path: estData.path,
            icon: estData.icon,
        };

        const posts = await Post.find({ estname: "Good Munch" });
        let temp_cust;
        let temp_post = [];
        let temp_owner;
        let temp_comments;
        let comments = [];
        for (let i = 0; i < posts.length; i++) {
            comments = [];
            temp_comments = await Comment.find({post_number: posts[i]._id});
            console.log(posts[i]);
            for (let j = 0; j < temp_comments.length; j++) {
                temp_owner = await Owner.findOne({ _id: temp_comments[j].owner});
                
                let temp_est = await Establishment.findOne({_id: temp_owner.establishment});

                comments.push({
                    comment: temp_comments[j].comment,
                    owner_name: temp_owner.name,
                    estname: temp_est.name,
                    pic: temp_est.icon
                })
            }
            temp_cust = await Customer.findOne({ _id: posts[i].cust});
            temp_post.push({
                _id: posts[i]._id.toString(),
                review: posts[i].review,
                estname: posts[i].estname,
                cust: posts[i].cust,
                cust_name: temp_cust.name,                
                cust_profpic: temp_cust.path,
                rating: posts[i].rating,
                attached: posts[i].attached,
                helpful_num: posts[i].helpful_num,
                nothelpful_num: posts[i].nothelpful_num,
                comments: comments,
            });
        }
        const averageRating = calculateAverageRating(temp_post);
        res.render('establishment', { 
            layout: 'estlayout',
            estData: temp_estData,
            postData: temp_post,
            postlength: temp_post.length,
            rating: averageRating ,
            isLoggedIn: activeUser !== null,
            isOwner: isOwner,
        });
    },

    getEstHappyNHealthy: async function(req, res) {
        const estData = await Establishment.findOne({name: "Happy N' Healthy"});
        let temp_estData = {
            name: estData.name,
            description: estData.description,
            owner: estData.owner,
            path: estData.path,
            icon: estData.icon,
        };

        const posts = await Post.find({ estname: "Happy N' Healthy" });
        let temp_cust;
        let temp_post = [];
        let temp_owner;
        let temp_comments;
        let comments = [];
        for (let i = 0; i < posts.length; i++) {
            comments = [];
            temp_comments = await Comment.find({post_number: posts[i]._id});
            console.log(posts[i]);
            for (let j = 0; j < temp_comments.length; j++) {
                temp_owner = await Owner.findOne({ _id: temp_comments[j].owner});
                
                let temp_est = await Establishment.findOne({_id: temp_owner.establishment});

                comments.push({
                    comment: temp_comments[j].comment,
                    owner_name: temp_owner.name,
                    estname: temp_est.name,
                    pic: temp_est.icon
                })
            }
            temp_cust = await Customer.findOne({ _id: posts[i].cust});
            temp_post.push({
                _id: posts[i]._id.toString(),
                review: posts[i].review,
                estname: posts[i].estname,
                cust: posts[i].cust,
                cust_name: temp_cust.name,                
                cust_profpic: temp_cust.path,
                rating: posts[i].rating,
                attached: posts[i].attached,
                helpful_num: posts[i].helpful_num,
                nothelpful_num: posts[i].nothelpful_num,
                comments: comments,
            });
        }
        const averageRating = calculateAverageRating(temp_post);
        res.render('establishment', { 
            layout: 'estlayout',
            estData: temp_estData,
            postlength: temp_post.length,
            postData: temp_post,
            rating: averageRating,
            isLoggedIn: activeUser !== null,
            isOwner: isOwner,
        });
    },

    getEstKuyaMels: async function(req, res) {
        const estData = await Establishment.findOne({name: "Kuya Mels"});
        let temp_estData = {
            name: estData.name,
            description: estData.description,
            owner: estData.owner,
            path: estData.path,
            icon: estData.icon,
        };

        const posts = await Post.find({ estname: "Kuya Mels" });
        let temp_cust;
        let temp_post = [];
        let temp_owner;
        let temp_comments;
        let comments = [];
        for (let i = 0; i < posts.length; i++) {
            comments = [];
            temp_comments = await Comment.find({post_number: posts[i]._id});
            console.log(posts[i]);
            for (let j = 0; j < temp_comments.length; j++) {
                temp_owner = await Owner.findOne({ _id: temp_comments[j].owner});
                
                let temp_est = await Establishment.findOne({_id: temp_owner.establishment});

                comments.push({
                    comment: temp_comments[j].comment,
                    owner_name: temp_owner.name,
                    estname: temp_est.name,
                    pic: temp_est.icon
                })
            }
            temp_cust = await Customer.findOne({ _id: posts[i].cust});
            temp_post.push({
                _id: posts[i]._id.toString(),
                review: posts[i].review,
                estname: posts[i].estname,
                cust: posts[i].cust,
                cust_name: temp_cust.name,                
                cust_profpic: temp_cust.path,
                rating: posts[i].rating,
                attached: posts[i].attached,
                helpful_num: posts[i].helpful_num,
                nothelpful_num: posts[i].nothelpful_num,
                comments: comments,
            });
        }
        const averageRating = calculateAverageRating(temp_post);
        res.render('establishment', { 
            layout: 'estlayout',
            estData: temp_estData,
            postlength: temp_post.length,
            postData: temp_post,
            rating: averageRating ,
            isLoggedIn: activeUser !== null,
            isOwner: isOwner,
        });
    },

    getEstPotatoGiant: async function(req, res) {
        const estData = await Establishment.findOne({name: "Potato Giant"});
        let temp_estData = {
            name: estData.name,
            description: estData.description,
            owner: estData.owner,
            path: estData.path,
            icon: estData.icon,
        };

        const posts = await Post.find({ estname: "Potato Giant" });
        let temp_cust;
        let temp_post = [];
        let temp_owner;
        let temp_comments;
        let comments = [];
        for (let i = 0; i < posts.length; i++) {
            comments = [];
            temp_comments = await Comment.find({post_number: posts[i]._id});
            console.log(posts[i]);
            for (let j = 0; j < temp_comments.length; j++) {
                temp_owner = await Owner.findOne({ _id: temp_comments[j].owner});
                
                let temp_est = await Establishment.findOne({_id: temp_owner.establishment});

                comments.push({
                    comment: temp_comments[j].comment,
                    owner_name: temp_owner.name,
                    estname: temp_est.name,
                    pic: temp_est.icon
                })
            }
            temp_cust = await Customer.findOne({ _id: posts[i].cust});
            temp_post.push({
                _id: posts[i]._id.toString(),
                review: posts[i].review,
                estname: posts[i].estname,
                cust: posts[i].cust,
                cust_name: temp_cust.name,                
                cust_profpic: temp_cust.path,
                rating: posts[i].rating,
                attached: posts[i].attached,
                helpful_num: posts[i].helpful_num,
                nothelpful_num: posts[i].nothelpful_num,
                comments: comments,
            });
        }
        const averageRating = calculateAverageRating(temp_post);
        res.render('establishment', { 
            layout: 'estlayout',
            estData: temp_estData,
            postlength: temp_post.length,
            postData: temp_post,
            rating: averageRating,
            isLoggedIn: activeUser !== null,
            isOwner: isOwner,
        });
    },

    updateHelpful: async function(req, res){
        const postId = req.query.postId;
        const post = await Post.findOne({_id: postId});
        const updatePost = await Post.updateOne({_id: postId}, {$set: {helpful_num: post.helpful_num + 1 }});
        if(updatePost){
            res.sendStatus(400);
        } else {
            res.sendStatus(200);
        }
    },

    updateNotHelpful: async function(req, res){
        const postId = req.query.postId;
        const post = await Post.findOne({_id: postId});
        const updatePost = await Post.updateOne({_id: postId}, {$set: {nothelpful_num: post.nothelpful_num + 1 }});
        if(updatePost){
            res.sendStatus(400);
        } else {
            res.sendStatus(200);
        }
    },

    addComment: async function(req, res) {
        const comment_data = req.body;
        console.log(comment_data);

        const newComment = new Comment({
            comment: comment_data.comment,
            post_number: new ObjectId(comment_data.post_number),
            owner: activeUser,
        })

        if(newComment.save()){
            res.sendStatus(200);
        }
        else{
            res.sendStatus(500);
        }

        

    },

    getCreateReview: async function(req, res) {
        try {
            
            res.render('createreview', {
                layout: 'createreviewlayout',
                isLoggedIn: activeUser !== null
            })

        }
        catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    },

    createPost: async function(req, res) {
        
        try{
            let img_path = req.files;
            const attached = [];
            console.log(img_path);
            if(img_path === undefined){
                attached = [];
            }   
            else{
                for(let i=0; i < img_path.length; i++){
                    attached.push(img_path[i].path);
                }
            }   
            const postData = req.body;
            const newPost = new Post({
                estname: postData.estname,
                review: postData.review,
                rating: postData.rating,
                attached: attached,
                cust: activeUser,
                
            })
            newPost.save();

            res.redirect('/home');
        }
        catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    },

    editPost: async function(req, res) {
        try{
            const editData = req.body;
            let img_path = req.files;
            const attached = [];
            console.log(img_path);
            
            if(editData.submit == 'confirm'){
                const post = await Post.findOne({_id: editData._id});
                console.log(post);
                const updatePost = await Post.updateOne({_id: post._id}, {$set: {
                    review: editData.review,
                    rating: editData.rating,
                
                }});

                if(img_path !== undefined){
                    for(let i=0; i < img_path.length; i++){
                        post.attached.push(img_path[i].path);
                    }
                }
            }
            else if(editData.submit == 'delete'){
                const post = await Post.deleteOne({_id: editData._id});
            }
            

        }catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }

        res.redirect(`/viewprofile`);
    },

    getEditPost: async function(req, res){
        const postId = req.query.postId;
        const post = await Post.findOne({_id: postId});
        let temp_cust;
        let temp_post;
        temp_cust = await Customer.findOne({ _id: post.cust});

        temp_post = {
            _id: post._id.toString(),
            review: post.review,
            estname: post.estname,
            cust: post.cust,
            cust_name: temp_cust.name,
            cust_profpic: temp_cust.path,
            rating: post.rating,
            attached: post.attached,
            helpful_num: post.helpful_num,
            nothelpful_num: post.nothelpful_num,
        };


        res.render('editreview', {
            layout: 'createreviewlayout',
            post: temp_post,
        });
    },

    getSearchResults: async function(req, res,) {
        const searchQuery = req.query.search.toString();
        console.log(searchQuery);
        const estData = await Establishment.find({});
        const establishments = [];
        for (let i = 0; i < estData.length; i++) {
            console.log(estData[i].name);
            if(estData[i].name.toLowerCase().includes(searchQuery)) {
                establishments.push({
                    name: estData[i].name,
                    description: estData[i].description,
                    owner: estData[i].owner,
                    path: estData[i].path,
                    icon: estData[i].icon,
                    link: estData[i].link,
                });
            }

        }
        res.render('searchresults', {
            layout: 'homepagelayout',
            results: establishments,
            isLoggedIn: activeUser !== null,
        })
    },


}

function calculateAverageRating(loopPosts) {
    if (!loopPosts || loopPosts.length === 0) {
        return 0;
    }

    let totalRatings = 0;
    loopPosts.forEach(post => {
        totalRatings += Math.floor(post.rating);
    });

    const averageRating = totalRatings / loopPosts.length;

    return averageRating.toFixed(1);
}

export default controller;