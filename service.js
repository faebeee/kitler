var config = {
    "url" : "http://www.catsthatlooklikehitler.com/kitler/pics/kitler",
    'port' : process.env.PORT||3000,
    "flickr" : {
        "api" : "fc9228d0f911430403a814d59edaf13b",
    }
};

var http = require('http');
var request = require('request');
var express = require('express');
var fs = require('fs');
var lwip = require('lwip');
var Flickr = require("node-flickr");
var keys = {"api_key": config.flickr.api};
var flickr = new Flickr(keys);
var maxPageSearch = 15;
var app = express();

var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});


function getImage(width, height, callback, page){
    page = page || 1;
    flickr.get("photos.search", {"text":"kitler, cat"}, function(err, result){
        if (err) return console.error(err);
        var max = result.photos.photo.length;
        var randId = Math.round( Math.random() * max );
        var randImg = result.photos.photo[randId];

        flickr.get("photos.getSizes", {"photo_id":randImg.id}, function(err, result){
            if (err) return console.error(err);

            var images = result.sizes.size, len = images.length;
            for(var i=0; i < len; i++){
                var image = images[i];
                if(image.width >= width && image.height >= height){
                    callback(image.source);
                    return image.source;
                }
            }
            console.warn('no image found. looking on page '+page);
            if(page >= maxPageSearch){
                throw ("No Image found in "+maxPageSearch+" Pages");
            }
            return getImage(width, height, callback, page+1);
        });
    });
}

function sendBufferedImage( img, res ){
    img.toBuffer('jpg', function(err, buff){
        if (err) throw err;

        res.writeHead(200, {'Content-Type': 'image/jpg' });
        res.end(buff, 'binary');
    });
}

function proceedImage(source, width, height, res){
    width = width || null;
    height = height || null;
    request({url:source,  encoding: 'binary'}, function onImageResponse(err, imageResponse, imageBody) {
        if (err) throw err;

        var buffer = new Buffer(imageBody, "binary");
        lwip.open(buffer, 'jpg', function(err, img){
            if (err) throw err;
            if(width && height){
                img.crop(width, height, function(err, img){
                    if (err) throw err;
                    sendBufferedImage(img, res);
                });
            }else{
                sendBufferedImage(img, res);
            }
        });
    });
}

app.all("/img/*/*", function (req, res) {
    var width = parseInt(req.params[0]);
    var height = parseInt(req.params[1]);

    getImage(width, height, function( uri ){
        proceedImage(uri, width, height, res);
    });
});

app.all("/my/*/*/*", function (req, res) {
    var id = parseInt(req.params[0]);
    var width = parseInt(req.params[1]);
    var height = parseInt(req.params[2]);

    flickr.get("photos.getSizes", {"photo_id":id}, function(err, result){
        if (err) throw err;
        var images = result.sizes.size, len = images.length;
        for(var i=0; i < len; i++){
            var image = images[i];
            if(image.width >= width && image.height >= height){
                proceedImage(image.source, width, height, res);
                return;
            }
        }
    });
});
