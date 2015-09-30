var imageBaseUrl = "http://www.catsthatlooklikehitler.com/kitler/pics/kitler";


var http = require('http');
var request = require('request');

http.createServer(function (req, resp) {
  var x = request(getRandomImage())
  req.pipe(x)
  x.pipe(resp)
}).listen(8080);





function getRandomImage(){
    var _url = imageBaseUrl+ Math.round(Math.random() * (8000 - 0 + 1))+".jpg";
    return _url;
}
