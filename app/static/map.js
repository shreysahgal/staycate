var access_token = '?access_token=sk.eyJ1Ijoid2hhbGVzMTQxMCIsImEiOiJja2M3MDVrajEweDJiMnlvYmE4ZGE4YWRvIn0.ioSoRYYB3IsNF8ZIzT-d7A';
var secret = 'sk.eyJ1Ijoid2hhbGVzMTQxMCIsImEiOiJja2M3MDVrajEweDJiMnlvYmE4ZGE4YWRvIn0.ioSoRYYB3IsNF8ZIzT-d7A';
var urlInit = 'https://api.mapbox.com/geocoding/v5/';
var mode = 'mapbox.places/';

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
    var url = urlInit + mode + lonlat + access_token;
    $.ajax({
    type: 'GET',
    url: url,
    success: function(rgeo) {        
        var result = rgeo;
        if (result.features.length == 0){
            console.log("no location (probably in the middle of the ocean)");
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
                // console.log(JSON.parse(response).posts)
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

// var popup = L.popup({closeButton: false})
//     .setLatLng([40.7128, -74.0060])
//     .setContent('<img alt="Qries" src="' + data[8] +'" width = "150" >')
//     .openOn(map); 

