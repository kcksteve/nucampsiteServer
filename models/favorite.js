const mongoose = require('mongoose');
const { schema } = require('./user');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    user: {
        type: schema.Types.ObjectId,
        ref: 'User'
    },
    campsite: [{
        type: schema.Types.ObjectId,
        ref: 'Campsite'
    }]
},
{
    timestamps: true
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;