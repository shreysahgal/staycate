var access_token = '?access_token=sk.eyJ1Ijoid2hhbGVzMTQxMCIsImEiOiJja2M3MDVrajEweDJiMnlvYmE4ZGE4YWRvIn0.ioSoRYYB3IsNF8ZIzT-d7A';
var secret = 'sk.eyJ1Ijoid2hhbGVzMTQxMCIsImEiOiJja2M3MDVrajEweDJiMnlvYmE4ZGE4YWRvIn0.ioSoRYYB3IsNF8ZIzT-d7A';
var urlInit = 'https://api.mapbox.com/geocoding/v5/';
var mode = 'mapbox.places/';
var lastCenter;

var map = L.map('mapid').setView([40.7128, -74.0060], 13);

L.tileLayer('https://api.maptiler.com/maps/pastel/{z}/{x}/{y}.png?key=wBoJx3TjkRZbDZ0Srk4n', {
    maxZoom: 18,
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,  
    closePopupOnClick: false
}).addTo(map);

new L.Control.GPlaceAutocomplete({
    callback: function(place){
        var loc = place.geometry.location;
        map.panTo([loc.lat(), loc.lng()]);
        map.setZoom(18);
        displayPosts(loc.lat(), loc.lng());
    }
}).addTo(map);


lastCenter = map.latLngToLayerPoint(map.getCenter());
// var query = lastCenter.lng + '%2C' + lastCenter.lat + '.json';
// getNeighborhood(query);


map.on('zoomend', function() {
    clearPopups();
    var latlong = map.getCenter();
    var query = latlong.lng + '%2C' + latlong.lat + '.json';
    getNeighborhood(query)
    // plotRandom(); 
});

map.on('dragend', function() {

    var latlong = map.getCenter();
    curCenter = map.latLngToLayerPoint(latlong);
    dist = curCenter.distanceTo(lastCenter);

    if (dist >= 600) {
        console.log('changing');
        clearPopups();
        var query = latlong.lng + '%2C' + latlong.lat + '.json';
        getNeighborhood(query);
        lastCenter = curCenter;
    }
});

function getPOIs() {
    
    var latlong = map.getCenter();
    map.featuresAt({x: latlong.lat, y: latlong.lng}, {
        radius: radius,
        includeGeometry: true,
        layer: pois
      }, function(err, features) {
       if (err || !features.length) {
          popup.remove();
          return;
        }
    
        buildListings(features);
      });
}


function getNeighborhood(lonlat) {
    clearPopups(); 
    var url = urlInit + mode + lonlat + access_token;
    $.ajax({
    type: 'GET',
    url: url,
    success: function(rgeo) {        
        var result = rgeo;
        if (result.features.length == 0){
            // console.log("no location (probably in the middle of the ocean)");
        } else {
            // console.log("city: " + getPlaceName(result.features[0].context))
            var neighborhood = rgeo.features[0].text;
            $('#result').html(neighborhood);
            var hashtag;
            // !!!!!!!!!!!!!!!!!!!!!!!!
            // DELETE THE FIRST PART OF THIS IF ELSE TO NOT INCLUDE POI
            // !!!!!!!!!!!!!!!!!!!!!!!!
            // check poi here because poi is not in context
            if (result.features[0].id.split(".")[0].localeCompare("poi") == 0) {
                // poi!
                hashtag = result.features[0].text.replace(" ", '').replace("-", '').toLowerCase();
            } else {                
                hashtag = getHashtag(result.features[0].context);
            }
            console.log("Hashtag: " + hashtag);
        }
        $.ajax({
            url: "/index/" + hashtag,
            type: 'POST',
            dataType: "text",
            success: function (response) {
                // console.log('woohoo something happened!')
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

// upgrade of the getPlaceName below
// instead of just getting city or country, find the optimal tag to search for in the context (e.g. POI, Neighborhood, locality, etc.)
function getHashtag(context){
    var neighborhood = "";
    var locality = "";
    var city = "";
    var region = "";
    var country = "";
    var result = "nothing"
    context.forEach(function(element){
        var id = element.id.split(".")[0];
        switch(id){
            case "neighborhood":
                neighborhood = element.text.replace(" ", '').replace("-", '').toLowerCase();
                break;
            case "locality":
                locality = element.text.replace(" ", '').replace("-", '').toLowerCase();
                break;
            case "place":
                city = element.text.replace(" ", '').replace("-", '').toLowerCase();
                break;
            case "region":
                region = element.text.replace(" ", '').replace("-", '').toLowerCase();
                break;
            case "country":
                country = element.text.replace(" ", '').replace("-", '').toLowerCase();
                break;
            default:
                break;
        }
    });
    // see if city is major city        
    $.ajax({
        // async false because if not then sometimes hashtag will not have anything before request is done
        async: false,
        url: "/majorcity/" + city + "," + region,
        type: 'POST',
        data: {
            city: city.value
        },
        dataType: "text",
        success: function (response) {
            if (response.localeCompare("NotMajor") == 0){                    
                // not major
                console.log(city + " is not a major city");
                result = country;
            } else {
                    // major
                    console.log(city + " is a major city");
                    // check for neighborhood
                    if (neighborhood.localeCompare("") != 0){
                        // there is a neighborhood; use that
                        result = neighborhood;
                    } else if (locality.localeCompare("") != 0){
                        // there is a neighborhood; use that
                        console.log("Locality: " + locality);
                        result = locality;
                    }  else {                        
                        result = response;
                        console.log("result after city: " + result);
                    }
            }
        },
        error: function(response) { 
            console.log("major city function failed :(")
        }
    });
    
    console.log("final result: " + result);
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
    for(var i = 0; i < 10; ++i ) { 
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

function displayPosts(lat, lng) {
    base = '/nearbyplaces?';
    loc = lat+','+lng;
    type = 'tourist_attraction';
    radius = 16000
    var url = base + "location=" + loc + "&radius=" + radius + "&type=" + type;
    console.log(url);
    $.ajax({
        type: 'GET',
        url: url,
        success: function(response) {
            var lat, lng, name;
            response.results.forEach(function(place) {
                lat = place.geometry.location.lat;
                lng = place.geometry.location.lng;
                name = place.name.replace(' ', '');
            })
        },
        error: function(response) {
            console.log("Google call error");
        }
    });
}

plotRandom(); 
