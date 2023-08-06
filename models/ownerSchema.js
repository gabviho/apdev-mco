import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ownerSchema = new Schema({

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
        default: Date.now()
    },

    establishment:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Establishment',
        immutable: true
    },

    location: String,

});

export const Owner = mongoose.model('Owner', ownerSchema);