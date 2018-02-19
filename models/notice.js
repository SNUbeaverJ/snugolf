var mongoose = require('mongoose');

var boardSchema = mongoose.Schema({
    // writer: String,
    // password: String,
    writer:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username: String
    },
    title: String,
    contents: String,
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }],
    date: {type: Date, default: Date.now}
});

module.exports =  mongoose.model('BoardContents', boardSchema);