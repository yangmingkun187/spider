var superagent = require('superagent');
var eventproxy = require('eventproxy');
var cheerio = require('cheerio');
var async = require('async');
var cfg = require('../config/config');
var RentalModel = require('../model/rental');

var Rental = (function() {
    
    var listUrls = [];
    
    var callback = function() {};
    
    return {
        addListUrl: function(url) {
            listUrls.push(url);
        },
        getListUrl: function() {
            return listUrls;
        },
    }
})();

var fetchListUrls = function() {
    for (var page = 1; page <= cfg.page; page++) {
        Rental.addListUrl('http://cd.lianjia.com/zufang/pg' + page + '/');
    }
};

var analysisList = function() {
    async.mapLimit(Rental.getListUrl(), 2, function (url, callback) {
        analysisDetail(url, callback);
    }, function (err, result) {
        console.log('final:');
        console.log(result);
    });
};

var analysisDetail = function(url, callback) {
    superagent.get(url)
        .end(function (err, res) {
            if (err) {
                return console.error(err);
            }

            var detailUrls = [];
            var $ = cheerio.load(res.text);

            for(var i = 0; i < $('.house-lst .info-panel h2 a').length; i++){
                detailUrls.push($('.house-lst .info-panel h2 a')[i].attribs.href)
            }

            var ep = new eventproxy();

            ep.after('detail', detailUrls.length, function (topics) {
                topics = topics.map(function (detailPair) {
                    var detailUrl = detailPair[0];
                    var detailHtml = detailPair[1];
                    var $ = cheerio.load(detailHtml);

                    var name = $('.title-box.left').text().trim();
                    var type = $('.desc-text dl').eq(1).find('dd').text();
                    var location = $('.zone-name')['0'].children[0].data;
                    var price = $('strong.ft-num').text();
                    var imageUrl = $('.iframe-img')[0].attribs.src;

                    RentalModel.create({
                        name:name,
                        type: type,
                        location: location,
                        price: price,
                        imageUrl: imageUrl,
                        href: detailUrl
                    });

                    console.log(name + '已存入数据库!');
                });
            });

            detailUrls.forEach(function (detailUrl) {
                superagent.get(detailUrl)
                    .end(function (err, res) {
                        console.log('fetch ' + detailUrl + ' successful');
                        ep.emit('detail', [detailUrl, res.text]);
                    });
            });
        });
};

module.exports = {
    init: function() {
        fetchListUrls();
        analysisList();
    },
    getInfos : function(req, res, next) {
        res.json({result: true,params: ''});
    }
}
