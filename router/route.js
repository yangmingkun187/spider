'use strict';

var Rental = require('../controller/rental');

module.exports = function(app){
    app.route('/')
        .get(function(req,res,next){
            res.sendFile('index.html');
        });

    app.route('/getInfos')
        .all(Rental.getInfos);
}

