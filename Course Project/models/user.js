const mongoose = require('mongoose');

const Schema = mongoose.Schema;


passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstname:{
        type: String,
        default:''
    },
    lastname:{
        type: String,
        default:''
    },

    // username: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    // password:  {
    //     type: String,
    //     required: true
    // },
    admin:   {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);

