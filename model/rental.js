'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RentalSchema = new Schema({
    name: String,
    type: String,
    location: String,
    price: Number,
    imageUrl: String,
    href: String
});

module.exports = mongoose.model('Rental', RentalSchema);
