import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const Schema = mongoose.Schema;

const customerSchema = new Schema({

    name: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true
    },

    email: {
        type: String, 
        required: true, 
        unique: true
    },

    password: {
        type: String, 
        required:true
    },
    
    date: {
        type: Date,
        default: Date.now(),
    },

    location: String,

    path: String,

    userbio: String

});


export const Customer = mongoose.model('Customer', customerSchema);