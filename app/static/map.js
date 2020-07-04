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

L.tileLayer('https://api.maptiler.com/maps/pastel/{z}/{x}/{y}.png?key=wBoJx3TjkRZbDZ0Srk4n', {
    maxZoom: 18,
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,  
    closePopupOnClick: false
}).addTo(map);


map.on('zoomend', function() {
    clearPopups();
    var latlong = map.getCenter();
    var query = latlong.lng + '%2C' + latlong.lat + '.json';
    getNeighborhood(query)
    // plotRandom(); 
});

map.on('dragend', function() {
    clearPopups(); 
    var latlong = map.getCenter();
    var query = latlong.lng + '%2C' + latlong.lat + '.json';
    getNeighborhood(query)
    // plotRandom(); 
});

function getNeighborhood(lonlat) {
    clearPopups(); 
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
                plotRandom(JSON.parse(response)); 
                return JSON.parse(response);
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

// var popup1 = L.popup({closeButton: false, closeOnClick: false})
//     .setLatLng([40.7128, -74.0060])
//     .setContent('asdfasd')
//     .addTo(map); 


// var popup2 = L.popup({closeButton: false,  closeOnClick: false})
//     .setLatLng([40.7000, -74.0060])
//     .setContent('3fadsfadsf')
//     .addTo(map); 

var arrPopups=new Array(0);
var bounds;
function plotRandom(imgs) { 
    bounds = map.getBounds(); 
    var sw = bounds.getSouthWest(); 
    var ne = bounds.getNorthEast(); 
    var lngSpan = ne.lng - sw.lng; 
    var latSpan = ne.lat -  sw.lat; 
    for(var i = 0; i < 5; ++i ) { 
        var point = [sw.lat + latSpan * Math.random(), sw.lng + lngSpan * Math.random()];
        var popup = placePopup(point, imgs[Math.floor(Math.random() * 10)]);  
        popup.addTo(map); 
        arrPopups.push(popup);
    }
}

function placePopup(location, img) { 
    var popup = L.popup({closeButton: false,  closeOnClick: false})
        .setLatLng(location)
        .setContent('<img alt="img not found" src="' + img +'" width = "150" >'); 
    return popup
}

function clearPopups(){ 
    if(arrPopups) { 
        for (i in arrPopups) { 
            arrPopups[i].removeFrom(map); 
        }
    }
    arrPopups = new Array(0);
}

plotRandom(); 
