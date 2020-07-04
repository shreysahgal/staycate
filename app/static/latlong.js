var access_token = '?access_token=sk.eyJ1Ijoid2hhbGVzMTQxMCIsImEiOiJja2M3MDVrajEweDJiMnlvYmE4ZGE4YWRvIn0.ioSoRYYB3IsNF8ZIzT-d7A';
var secret = 'sk.eyJ1Ijoid2hhbGVzMTQxMCIsImEiOiJja2M3MDVrajEweDJiMnlvYmE4ZGE4YWRvIn0.ioSoRYYB3IsNF8ZIzT-d7A';
var urlInit = 'https://api.mapbox.com/geocoding/v5/';
var mode = 'mapbox.places/';
var type = '&types=neighborhood';



function geocode() {
    $('#result').html('');
    lonlatInput = $('#lonlat').val();
    lonlatInput = lonlatInput.split(',');
    lonlat = lonlatInput[0].trim() + '%2C' + lonlatInput[1].trim() + '.json';
    getNeighborhood(lonlat);
    console.log("ddd");
}

function getNeighborhood(lonlat) {
    var url = urlInit + mode + lonlat + access_token + type;
    $.ajax({
    type: 'GET',
    url: url,
    success: function(rgeo) {
        console.log("success");
        var result = rgeo;
        var neighborhood = rgeo.features[0].text;
        $('#result').html(neighborhood);
    },
    error: function(rgeo) {
        console.log("fail");
        console.log(rgeo);
    }
    });
}