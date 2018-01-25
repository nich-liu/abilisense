// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = mongoose.model('Post', new Schema({ 
    username: String, 
    posts: [{date: Date, text: String}],
}));
