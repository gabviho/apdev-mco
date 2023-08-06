import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const commentSchema = new Schema({

    comment: {
        type: String,
        required: true
    },

    post_number:{
        type: Schema.Types.ObjectId,
        required: true,
    },

    owner:{
        type: Schema.Types.ObjectId,
        
        ref: 'Owner',
        immutable: true
    }

});

export const Comment = mongoose.model('Comment', commentSchema);

