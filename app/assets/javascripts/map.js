var directionsDisplay,
    directionsDisplay_to_restaurant,
    directionsDisplay_to_end,
    directionsService = new google.maps.DirectionsService(),
    map,
    marker,
    markers = [],
    stopPointLatLonObject,
    stopPointLat,
    stopPointLon,
    check_done;

$(function(){

  function createMap() {
    directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers:true});

    var mapOptions = {
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    polyline = new google.maps.Polyline({
      path: [],
      strokeColor: '#FF0000',
      strokeWeight: 3
    });
    directionsDisplay.setMap(map);

    calcRoute(); //shows landing page/initial route
  }

  function initialize() {
    createMap();

    $("#map_options").submit(function(event) {
      event.preventDefault();
      createMap();
      removeMarkers();
      check_done = "not done";
      calcRoute();
      $("#restaurant_options").show();
      console.log(stopPointLat);
      console.log(stopPointLon);
      
      check();
      function check(){ 
      //makes sure ajax doesn't fire before calcRoute is finished
        if (check_done === "done"){
        console.log("done!");
          $.ajax({
             url:'/restaurants/yelp_search', 
             type: 'POST',
             data:(
               'lat=' + stopPointLat + '&' +
               'lon=' + stopPointLon + '&' +
               'type=' + $("#type").val() + '&' +
               'sort=' + $("#sort").val() + '&' +
               'mtd=' + $("#mtd").val()
             )
          });
        } else {
          console.log("Are ya done yet???");
          setTimeout(check, 1000);
        }
      }
      console.log("You clicked?");
    });
  }
  google.maps.event.addDomListener(window, "load", initialize);
});

  function calcRoute() {
    var origin = $("#start").val(),
        destination = $("#end").val();

    var request = {
        origin:      origin,
        destination: destination,
        travelMode:  google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        startLocation = response.routes[0].legs[0].start_location;
        endLocation = response.routes[0].legs[0].end_location;
        //polyline.setMap(map);
        //marker.setMap(null);
        placeMarker(startLocation);
        placeMarker(endLocation);
        var $stopPoint = parseInt($("#stop_point").val());
        getStopPoint(response, $stopPoint);
      }
    });
  }

  function placeMarker(location) {
    marker = new google.maps.Marker({
        position: location,
        map: map
    });
    markers.push(marker);
  }

  function placeRestaurantMarkers(restaurants) {
    var infowindow = new google.maps.InfoWindow();
    var icon = new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/icons/purple-dot.png");
    var bounds = new google.maps.LatLngBounds(stopPointLatLonObject);

    for (i = 0; i < restaurants.length; i++) {  
      var position = new google.maps.LatLng(restaurants[i][0], restaurants[i][1])
      marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: icon
      });
      bounds.extend(position);
      map.fitBounds(bounds);
      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        console.log("Restaurant: " + restaurants[i][2]);
        return function() {
          infowindow.setContent('<img src="' + restaurants[i][3] + '"><p><strong>' + restaurants[i][2] + '</strong></p><p>Rating: ' + '  <img src="' + restaurants[i][5] + '"><p>' + restaurants[i][6] + '</p><p><a href="' + restaurants[i][7] + '" target="_blank">' + restaurants[i][7] + '</a></p>');
          infowindow.open(map, marker);
          restaurant_directions(restaurants[i][6]);
        }
      })(marker, i));
      markers.push(marker);
    }
  }
  function restaurant_directions(restaurant){

    $("#directions-panel").html("");
    var start = $("#start").val(),
        end = $("#end").val();
 
 //add route from start to stop pos
    route_1 = {
        origin: start,
        destination: restaurant,
        travelMode: google.maps.TravelMode.DRIVING
     };
 
    directionsService.route(route_1, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay_to_restaurant.setDirections(response);
      }
    });
 
       //add route from stop pos to selected restaurant
    route_2 = {
        origin: restaurant,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(route_2, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay_to_end.setDirections(response);
      }
    });
 
     // setting up direction renderer deviation route
 
 
    directionsDisplay_to_restaurant = new google.maps.DirectionsRenderer({
      map : map,
      preserveViewport: true,
      suppressMarkers : true,
      polylineOptions : {strokeColor:'blue',
                          strokeOpacity: .5,
                          strokeWeight: 4
                        }
     });
 
   
    directionsDisplay_to_end = new google.maps.DirectionsRenderer({
      map : map,
      preserveViewport: true,
      suppressMarkers : true,
      polylineOptions : {strokeColor:'green',
                          strokeOpacity: .7,
                          strokeWeight: 4
                        }
     });
 
     //set panel display
     // directionsDisplay.setPanel(document.getElementById('directions-panel'));
       // directionsDisplay_to_stop.setPanel(document.getElementById('directions-panel'));
    directionsDisplay_to_restaurant.setPanel(document.getElementById('directions-panel'));
    directionsDisplay_to_end.setPanel(document.getElementById('directions-panel'));
  }
  // 0<%= restaurant.latitude %>, 1<%= restaurant.longitude %>, 2'<%= restaurant.name %>', 3'<%= restaurant.image_url %>', 4<%= restaurant.rating %>, 5'<%= restaurant.rating_img_url %>', 6'<%= restaurant.address %>', 7'<%= restaurant.url %>'

  function removeMarkers() {
    for (i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  }

  function getStopPoint(response, percentage) {
    var totalDist = response.routes[0].legs[0].distance.value,
        totalTime = response.routes[0].legs[0].duration.value,
        distance = (percentage/100) * totalDist,
        time = ((percentage/100) * totalTime/60).toFixed(2),
        polyline = new google.maps.Polyline({
          path: [],
          strokeColor: '#FF0000',
          strokeWeight: 3
        });
        var bounds = new google.maps.LatLngBounds();
        var steps = response.routes[0].legs[0].steps;
        for (j=0; j<steps.length; j++) {
          var nextSegment = steps[j].path;
          for (k=0; k<nextSegment.length; k++) {
            polyline.getPath().push(nextSegment[k]);
            bounds.extend(nextSegment[k]);
          }
        }
    stopPointLatLonObject = polyline.GetPointAtDistance(distance);
    placeMarker(stopPointLatLonObject);
    stopPointLat = stopPointLatLonObject["d"];
    stopPointLon = stopPointLatLonObject["e"];
    check_done = "done";
  }

