require('dotenv/config');

const dbconn = require('./conn.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.SERVER_PORT;   

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

dbconn.connectToMongo((err) => {
    if(err) {
        console.error(err);
        process.exit(1);
    }

    app.listen(port, () => {
        console.log('listening on port');
    });

});
