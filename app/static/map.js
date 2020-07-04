var access_token = '?access_token=sk.eyJ1Ijoid2hhbGVzMTQxMCIsImEiOiJja2M3MDVrajEweDJiMnlvYmE4ZGE4YWRvIn0.ioSoRYYB3IsNF8ZIzT-d7A';
var secret = 'sk.eyJ1Ijoid2hhbGVzMTQxMCIsImEiOiJja2M3MDVrajEweDJiMnlvYmE4ZGE4YWRvIn0.ioSoRYYB3IsNF8ZIzT-d7A';
var urlInit = 'https://api.mapbox.com/geocoding/v5/';
var mode = 'mapbox.places/';
// var type = '&types=neighborhood';


function geocode() {
    $('#result').html('');
    lonlatInput = $('#lonlat').val();
    lonlatInput = lonlatInput.split(',');
    lonlat = lonlatInput[0].trim() + '%2C' + lonlatInput[1].trim() + '.json';
    getNeighborhood(lonlat);
    console.log("ddd");
}


var map = L.map('mapid').setView([40.7128, -74.0060], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);

var marker = L.marker([40.7128, -74.0060]).addTo(map);

map.on('zoomend', function() {
    var latlong = map.getCenter();
    var query = latlong.lng + '%2C' + latlong.lat + '.json';
    getNeighborhood(query)
});

map.on('dragend', function() {
    var latlong = map.getCenter();
    var query = latlong.lng + '%2C' + latlong.lat + '.json';
    getNeighborhood(query)
});

function getNeighborhood(lonlat) {
    var url = urlInit + mode + lonlat + access_token;
    $.ajax({
    type: 'GET',
    url: url,
    success: function(rgeo) {        
        var result = rgeo;
        if (result.features.length == 0){
            console.log("no location (probably in the middle of the ocean)");
        } else {
            console.log("city: " + getPlaceName(result.features[0].context))
            var neighborhood = rgeo.features[0].text;
            $('#result').html(neighborhood);
            var city = getPlaceName(result.features[0].context);
            city = city.trim();
            city = city.replace(" ", '')
            city = city.replace("-", '')
            console.log("cleaned up city " + city )
        }
        $.ajax({
            url: "/index/" + city,
            type: 'POST',
            data: {
                city: city.value
            },
            dataType: "text",
            success: function (response) {
                console.log('woohoo something happened!')
                console.log(JSON.parse(response).posts)
                var popup = L.popup({closeButton: false})
                    .setLatLng(map.getCenter())
                    .setContent('<img alt="Qries" src="' + JSON.parse(response)[0] +'" width = "150" >')
                    .openOn(map); 
            },
            error: function(response) { 
                console.log("function failed :(")
            }
        });
    },
    error: function(rgeo) {
        console.log("fail");
        console.log(rgeo);
    }
    });
}

// get's the place (which should be a city?)
function getPlaceName(context){
    var result = "";
    var country = "";
    context.forEach(function(element){
        var id = element.id.split(".")[0];
        if (id.localeCompare("place") == 0){
            result = element.text;
        }
        if (id.localeCompare("country") == 0){
            country = element.text;
        }
    });
    if (result.localeCompare("") == 0) {
        return country
    }
    return result;
}

// var popup = L.popup({closeButton: false})
//     .setLatLng([40.7128, -74.0060])
//     .setContent('<img alt="Qries" src="' + data[8] +'" width = "150" >')
//     .openOn(map); 

