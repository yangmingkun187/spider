var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var controller = require('./controller/rental');

console.log('init express..');
var app = express();
//connect to database
mongoose.connect('mongodb://localhost/rental', function (err) {
    if (err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

app.set('view engine','ejs');
app.use(express.static(__dirname+'/../views'));

app.use(bodyParser.json());

require('./router/route')(app);
controller.init();

app.use(function(req, res, next){
    res.status(404);
    try{
        return res.json('No Found!');
    }
    catch(e){
        console.error('404 set header after send.');
    }
})

app.use(function(err, req, res, next){
    if (!err) {
        return next();
    };

    res.status(500);
    try{
        return res.json(err.message || "server err");
    }
    catch(e){
        console.error('500 set header after send.')
    }
});
module.exports = app;

