import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const postSchema = new Schema({

    review: {
        type: String,
        required: true
    },

    estname:{
        type: String,
        required: true,
    },

    cust:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Customer',
        immutable: true
    },

    rating:{
        type: Schema.Types.Number,
        required: true,
    },

    attached:{
        type: [String],
        default: []
    },  

    helpful_num: {
        type: Schema.Types.Number,
        default: 0
    },

    nothelpful_num: {
        type: Schema.Types.Number,
        default: 0
    }

});

export const Post = mongoose.model('Post', postSchema);