require('dotenv/config');

const dbconn = require('./conn.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.SERVER_PORT;   

let currentUser;
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
})

app.post('/register', async (req, res) =>{
    
    try {
        const userdata = req.body;
        console.log(userdata);    
        const db = dbconn.getDb();
        var collection;

        // user is customer
        if(userdata.role === 'customer'){
            collection = db.collection('customers');
            const existingUser = await collection.findOne({email: userdata.email});
            
            // if user already exists
            if (existingUser) { 
                const queryParams = new URLSearchParams(userdata);
                queryParams.append('message', 'Email already exists!');
                const queryString = queryParams.toString();
                return res.redirect(`./html/register.html?${queryString}`);
            }

            // create new user
            else{
                
                delete userdata.role;
                delete userdata.submit;
                await collection.insertOne(userdata);
                res.redirect('./html/index.html');
            }   
                    
        }

        // user is owner
        else if(userdata.role ==='owner'){
            collection = db.collection('user-owners');
            const existingUser = await collection.findOne({email: userdata.email});
            
            // if user already exists
            if (existingUser) { 
                const queryParams = new URLSearchParams(userdata);
                queryParams.append('message', 'Email already exists!');
                const queryString = queryParams.toString();
                return res.redirect(`./html/guest-views/register.html?${queryString}`);
            }

            // create new user
            else{

                delete userdata.usertype;
                delete userdata.confirmpassword;
                delete userdata.submit;
                activeUser = userdata;
                await collection.insertOne(activeUser);
                res.render('owner-profile', { activeUser });
            }
        }
        
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
   
})

app.post('/login',async (req, res) => {
    try {
        const userdata = req.body;
        console.log(userdata);

        const db = dbconn.getDb();

        const customer_user = await db.collection('customers').findOne({email: userdata.email});
        const owner_user = await db.collection('owners').findOne({email: userdata.email});
        
        // check if user is a customer
        if(customer_user){
            res.redirect('../../html/homepage.html');
            activeUser = currentUser;
        }

        // check if user is an owner
        else if(owner_user){
            res.render('owner-profile', { owner_user });
            //res.redirect('../../html/user-views/owner-profile.html');
            activeUser=owner_user;
        }

        // user and/or pass doesn't exist
        else{
          
           
            return res.redirect('../../html/login.html');
            
        }
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    
})

app.post('/review', async (req, res) => {
    try{
        const review_data = req.body;
        console.log(review_data);
        const db = dbconn.getDb();
        const collection = await db.collection('posts');
        const temp_review = await collection.insertOne(review_data);
       // console.log(currentEst);
     //   const temp_user = await collection.insertOne({...review_data, estname: currentEst, reviewee: activeUser});
    //    console.log(temp_user.reviewee.firstname);
        //await collection.updateOne({_id: temp_review._id}, {$set: { estname: currentEst }});
        res.redirect('../../html/homepage.html');

    }
    catch(err){
        console.error(err);
        return res.sendStatus(500);
    }
});

dbconn.connectToMongo((err) => {
    if(err) {
        console.error(err);
        process.exit(1);
    }

    app.listen(port, () => {
        console.log('listening on port');
    });
});
