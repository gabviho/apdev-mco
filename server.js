require('dotenv/config');

//const exphbs = require('express-handlebars').create({});


const dbconn = require('./conn.js');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

const { ObjectId } = require('mongodb');

const port = process.env.SERVER_PORT;

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // The folder where uploaded images will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

let activeUser, currentEst;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use('uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', './views');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/html'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
})

app.post('/register', async (req, res) => {

    try {
        const userdata = req.body;
        console.log(userdata);
        const db = dbconn.getDb();
        var collection;

        // user is customer
        if (userdata.role === 'customer') {
            collection = db.collection('customers');
            const existingUser = await collection.findOne({ email: userdata.email });

            // if user already exists
            if (existingUser) {
                const queryParams = new URLSearchParams(userdata);
                queryParams.append('message', 'Email already exists!');
                const queryString = queryParams.toString();
                return res.redirect(`./html/register.html?${queryString}`);
            }

            // create new user
            else {

                delete userdata.role;
                delete userdata.submit;
                await collection.insertOne(userdata);
                res.redirect('./html/index.html');
            }

        }

        // user is owner
        else if (userdata.role === 'owner') {
            collection = db.collection('user-owners');
            const existingUser = await collection.findOne({ email: userdata.email });

            // if user already exists
            if (existingUser) {
                const queryParams = new URLSearchParams(userdata);
                queryParams.append('message', 'Email already exists!');
                const queryString = queryParams.toString();
                return res.redirect(`./html/guest-views/register.html?${queryString}`);
            }

            // create new user
            else {

                delete userdata.usertype;
                delete userdata.confirmpassword;
                delete userdata.submit;
                activeUser = userdata;
                await collection.insertOne(activeUser);
                res.redirect('./html/viewprofile.ejs');
            }
        }

    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }

})

app.post('/login', async (req, res) => {
    try {
        const userdata = req.body;
        console.log(userdata);

        const db = dbconn.getDb();

        const customer_user = await db.collection('customers').findOne({ email: userdata.email });
        const owner_user = await db.collection('user-owners').findOne({ email: userdata.email });

        // check if user is a customer
        if (customer_user) {
            activeUser = customer_user; // active user var
            res.redirect('../../html/homepage.html');
        }

        // check if user is an owner
        else if (owner_user) {
            activeUser = customer_user; // active user var
            res.redirect('../../html/');
        }

        // user and/or pass doesn't exist
        else {

            return res.redirect('../../html/login.html');

        }
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }

})

dbconn.connectToMongo((err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    app.listen(port, () => {
        console.log('listening on port');
    });
});


app.get('/viewprofile', async (req, res) => {
    try {
        const activeUserName = activeUser.name; // Get the name of the active user (customer)
        const db = dbconn.getDb();
        const collection = db.collection('posts');

        // Find all reviews in the 'posts' collection that match the customer's name
        const loopPosts = await collection.find({ custname: activeUserName }).toArray();

        // Render the 'viewprofile' template with the user and reviews data
        res.render('viewprofile', { user: activeUser, loopPosts });
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});


app.post('/edit', upload.single('profilePicture'), async (req, res) => {

    try {
        const userdata = req.body;
        console.log(userdata);
        const db = dbconn.getDb();
        var collection;


        console.log(req.file.path);

        collection = db.collection('customers');
        const user = await collection.updateOne(
            { _id: activeUser._id },
            { $set: { ...userdata, path: req.file.path } }

        );

        //activeUser = user;
        const customer_user = await db.collection('customers').findOne({ _id: activeUser._id });
        customer_user['path'] = req.file.path;
        activeUser = customer_user;
        console.log('Active User:', activeUser);
        res.redirect('/viewprofile');


    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }

})



function calculateAverageRating(loopPosts) {
    if (!loopPosts || loopPosts.length === 0) {
        return 0; // Return 0 if there are no ratings
    }

    // Calculate the sum of all integer ratings
    let totalRatings = 0;
    loopPosts.forEach(post => {
        totalRatings += Math.floor(post.rating);
    });

    // Calculate the average rating by dividing the sum by 5
    const averageRating = totalRatings / loopPosts.length;
    console.log(totalRatings);
    return averageRating;
}



app.post('/review', async (req, res) => {
    try {
        const review_data = req.body;
        review_data['comments'] = [];

        console.log(review_data);
        const db = dbconn.getDb();
        const collection = await db.collection('posts');
        const temp_review = await collection.insertOne(review_data);
        res.redirect('../../html/homepage.html');

    }
    catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

app.post('/comment', async (req, res) => {
    try {
        const comment_data = req.body;
        console.log(comment_data);
        const db = dbconn.getDb();
        const collection = await db.collection('comments');
        const commentObjectId = new ObjectId(comment_data.post_number);
        const commentToAdd = comment_data.comment;

        // Update the 'comments' array using $push and the updateOne method
        await db.collection('posts').updateOne(
            { _id: commentObjectId },
            { $push: { comments: commentToAdd } }
        );

        console.log("hi");
        const temp_review = await collection.insertOne(comment_data);
        res.redirect('../../html/homepage.html');

    }
    catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});


app.get('/estAteRicas', async (req, res) => {
    const loopPosts = await dbconn.getDb().collection('posts').find({ estname: 'Ate Rica\'s Bacsilog' }).toArray();
    console.log(loopPosts);
    estIndex = "Ate Rica's Bacsilog";
    const estData = await dbconn.getDb().collection('Establishments').findOne({ _id: new ObjectId('64bc319514a9df3a7505c2c0') });
    console.log(estData);
    const averageRating = calculateAverageRating(loopPosts);
    res.render('Establishments', { estData, loopPosts, averageRating });
});

app.get('/estGoodMunch', async (req, res) => {
    const loopPosts = await dbconn.getDb().collection('posts').find({ estname: 'Good Munch' }).toArray();
    console.log(loopPosts);
    estIndex = "Good Munch";
    const estData = await dbconn.getDb().collection('Establishments').findOne({ _id: new ObjectId('64bcedd714a9df3a7505c2c4') });
    console.log(estData);
    const averageRating = calculateAverageRating(loopPosts);
    res.render('Establishments', { estData, loopPosts, averageRating });
});

app.get('/estHappyNHealthy', async (req, res) => {
    const loopPosts = await dbconn.getDb().collection('posts').find({ estname: 'Happy n Healthy' }).toArray();
    console.log(loopPosts);
    estIndex = "Happy N' Healthy";
    const estData = await dbconn.getDb().collection('Establishments').findOne({ _id: new ObjectId('64bcee3214a9df3a7505c2c6') });
    console.log(estData);
    const averageRating = calculateAverageRating(loopPosts);
    res.render('Establishments', { estData, loopPosts, averageRating });
});

app.get('/estKuyaMels', async (req, res) => {
    const loopPosts = await dbconn.getDb().collection('posts').find({ estname: 'Kuya Mel\'s' }).toArray();
    console.log(loopPosts);
    estIndex = "Kuya Mels";
    const estData = await dbconn.getDb().collection('Establishments').findOne({ _id: new ObjectId('64bcee6514a9df3a7505c2c7') });
    console.log(estData);
    const averageRating = calculateAverageRating(loopPosts);
    res.render('Establishments', { estData, loopPosts, averageRating });
});

app.get('/estPotatoGiant', async (req, res) => {
    const loopPosts = await dbconn.getDb().collection('posts').find({ estname: 'Potato Giant' }).toArray();
    console.log(loopPosts);
    estIndex = "Potato Giant";
    const estData = await dbconn.getDb().collection('Establishments').findOne({ _id: new ObjectId('64bceedb14a9df3a7505c2c9') });
    console.log(estData);
    const averageRating = calculateAverageRating(loopPosts);
    res.render('Establishments', { estData, loopPosts, averageRating });
});

app.get('/updateHelpfulNum', (req, res) => {
    const postId = req.query.postId;

    if (!postId) {
        return res.status(400).json({ error: 'Missing postId' });
    }

    const db = dbconn.getDb();
    const postsCollection = db.collection('posts');

    postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { helpful_num: 1 } },
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database update error' });
            }

            return res.json({ message: 'helpful_num incremented successfully' });
        }


    );
    res.redirect('../../html/homepage.html');
});