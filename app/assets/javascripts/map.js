var directionsDisplay,
    directionsDisplay_to_restaurant,
    directionsDisplay_to_end,
    directionsService = new google.maps.DirectionsService(),
    map,
    marker,
    markers = [],
    select,
    stopPointLatLonObject,
    stopPointLat,
    stopPointLon,
    check_done;

$(function(){
  $("#directions-panel").hide();
  $("#search_again_button").hide();
  $("#stop_point_miles").hide();

  $("#method" ).change(function() {
    $("#stop_point_miles").hide();
    $("#stop_point_hours").hide();
    $( "#method option:selected" ).each(function() {
      select = "#stop_point_" + $(this).text();
    });
    $(select).show();
  })
  .trigger("change" );
  //when user selects miles or hours the appropriate input box shows up

  function createMap() {
    directionsDisplay = new google.maps.DirectionsRenderer();

    var mapOptions = {
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    //setting up a google map with directions using the options above
    directionsDisplay.setMap(map);

    calcRoute(); //sets route based on the start and end values in the form
  }

  function initialize() {
    //initialize is called when the page loads
    createMap();
    autoComplete();

    $("#map_options").submit(function(event) {
      event.preventDefault();
      // when button is clicked the form and blurb are hidden and search again button appears
      $("#map_options").hide();
      $("#blurb").hide();
      $("#search_again_button").show();

      //a new map is loaded and old markers are removed
      createMap();
      //calcRoute is called from within createMap
      removeMarkers();

      check_done = "not done";
      check();
      function check(){
      //makes sure ajax doesn't fire before calcRoute is finished
        if (check_done === "done"){
        console.log("done!");
        console.log(stopPointLat);
        console.log(stopPointLon);
          //info from form sent to restaurants controller
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
    $("#search_again_button").click(function(event){
      //form and blurb come back when search again button is clicked
      event.preventDefault();
      $("#map_options").show();
      $("#blurb").show();
      $("#directions-panel").hide();
      $("#search_again_button").hide();
    });

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
    //a request for driving directions is made to google maps using the start and end values from the form

    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        //if directions come back
        directionsDisplay.setDirections(response);
        //set the directions on the map using the response

        // startLocation = response.routes[0].legs[0].start_location;
        // endLocation = response.routes[0].legs[0].end_location;
        // console.log(startLocation);
        // console.log(endLocation);
        console.log(response);

        var method = $("#method").val();
        //users choice of hours or miles determines whether the stop point will be calculated the via distance or time method
        var stopPoint = parseInt($(select).val());
        //this is the value in either miles or or hours
        console.log(method);
        console.log(stopPoint);
        getStopPoint(response, stopPoint, method);
      }
    });
  }

  function getStopPoint(response, stop, method) {
    var totalDist = response.routes[0].legs[0].distance.value,
        //pulls the total distance out of the JSON response sent back by google

        totalTime = response.routes[0].legs[0].duration.value,
        //pulls the total time out of the JSON response sent by google

        polyline = new google.maps.Polyline({
          path: [],
          //sets an empty path to start
          strokeColor: 'rgba(0,0,0,0)',
          strokeWeight: 1
        });
    console.log("totalTime " + totalTime);
    console.log("totalDist " + totalDist);

    var distance;
    var time;
    if (method == "hours") {
      distance = ((stop*3600)/totalTime) * totalDist;
      //takes the requested hours into the trip that the user wants to stop and converts that to the distance that must be traveled along the route to find the stop point
    } else if (method == "miles") {
      distance = stop*1609.34;
      //takes the miles in that the person wants to stop and converts it to meters
      time = ((stop/totalDist) * totalTime/60).toFixed(2);
    }
    if (distance > totalDist) {
      alert("Your trip will take about " + (totalTime/3600).toFixed(0) + " hours to travel " + (totalDist*0.000621371).toFixed(0) + " miles. Please chose a stopping point within that time frame or distance.");
    }
    //alert in case the user tries to pick a stopping point outside the bounds of the trip
    //console.log("Distance " + distance);

    var bounds = new google.maps.LatLngBounds();
    //set the bounds of the map

    var steps = response.routes[0].legs[0].steps;
    //determines number of steps in the route

    for (j=0; j<steps.length; j++) {
      //iterates through each step in the route
      var nextSegment = steps[j].path;
      //gets the path for each segment
      for (k=0; k<nextSegment.length; k++) {
        //iterates through each portion of the path
        //path is split up into segments designated by lat lon
        polyline.getPath().push(nextSegment[k]);
        //pushes each portion of the path onto polyline path
        bounds.extend(nextSegment[k]);
        //increase bounds to encompass entire route
      }
    }

    stopPointLatLonObject = polyline.GetPointAtDistance(distance);
    //uses epoly function to determine the appropriate stop point along the route given the distance calculated from user's choice (in miles or hours)
    placeMarker(stopPointLatLonObject);
    //places marker at stop point

    stopPointLat = stopPointLatLonObject["k"];
    stopPointLon = stopPointLatLonObject["D"];
    check_done = "done";
    console.log("stopPointLat " + stopPointLat);
    console.log("stopPointLon " + stopPointLon);
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
    //sets up a new info window object

    var icon = new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/icons/purple-dot.png");
    //sets pins to the purple icon

    var bounds = new google.maps.LatLngBounds(stopPointLatLonObject);
    //sets the center of map bounds based on the stopping point

    for (i = 0; i < restaurants.length; i++) {
      //iterates through the list of restaurant options

      var position = new google.maps.LatLng(restaurants[i][0], restaurants[i][1]);
      //determines position for pin based on restaurant lat/lon

      marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: icon
      });
      //places new google marker onto map in that position

      bounds.extend(position);
      //extends bounds of the map to display the pin
      map.fitBounds(bounds);
      //fits the map to those bounds
      //acts as a zoom

      //sets click listener for marker
      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        console.log("Restaurant: " + restaurants[i][2]);
        //when clicked...
        return function() {
          $("#directions-panel").show();
          infowindow.setContent('<div class="infowindow"><div class="row"><div class="col-xs-3"><img src="' + restaurants[i][3] + '"></div><div class="col-xs-8 col-xs-offset-1"><p><strong>' + restaurants[i][2] + '</strong></p><p>Rating: ' + '  <img src="' + restaurants[i][5] + '"></p><p>' + restaurants[i][6] + '</p></div></div><div class="row"><div class="col-xs-12"><p><a href="' + restaurants[i][7] + '" target="_blank">' + restaurants[i][7] + '</a></p></div></div>');
          //content of info window is set
          infowindow.open(map, marker);
          //info window pops up
          restaurant_directions(restaurants[i][6]);
          //directions to and from the restaurant are listed and displayed on the map
        }
      })(marker, i));
      markers.push(marker);
    }
  }
  //Info being passed in via 'restaurants'
  //0<%= restaurant.latitude %>, 1<%= restaurant.longitude %>, 2'<%= restaurant.name %>', 3'<%= restaurant.image_url %>', 4<%= restaurant.rating %>, 5'<%= restaurant.rating_img_url %>', 6'<%= restaurant.address %>', 7'<%= restaurant.url %>'

  function restaurant_directions(restaurant){
    if(directionsDisplay_to_restaurant != null){
      directionsDisplay_to_restaurant.setMap(null);
      directionsDisplay_to_restaurant = null;
    }
    if(directionsDisplay_to_end != null){
      directionsDisplay_to_end.setMap(null);
      directionsDisplay_to_end = null;
    }
    //deletes any previous routes on the map

    $("#directions-panel").html("");
    //deletes previous directions displayed on the screen

    var start = $("#start").val(),
        end = $("#end").val();
    //sets start and finish values

    //set route info from start to chosen restaurant
    var route_1 = {
        origin: start,
        destination: restaurant,
        travelMode: google.maps.TravelMode.DRIVING
     };
    //sends route info to google and receives directions
    directionsService.route(route_1, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay_to_restaurant.setDirections(response);
      }
    });

    //set route info from selected restaurant to destination
    var route_2 = {
        origin: restaurant,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
    };
    //sends route info to google and receives directions
    directionsService.route(route_2, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay_to_end.setDirections(response);
      }
    });

    //displays route to restaurant on map
    directionsDisplay_to_restaurant = new google.maps.DirectionsRenderer({
      map : map,
      preserveViewport: true,
      suppressMarkers : true,
      polylineOptions : { strokeColor:'blue',
                          strokeOpacity: .5,
                          strokeWeight: 4
                        }
     });
    //displays route from restaurant to destination on map
    directionsDisplay_to_end = new google.maps.DirectionsRenderer({
      map : map,
      preserveViewport: true,
      suppressMarkers : true,
      polylineOptions : {strokeColor:'green',
                          strokeOpacity: .7,
                          strokeWeight: 4
                        }
     });

    //set panel displays with step-by-step directions
    directionsDisplay_to_restaurant.setPanel(document.getElementById('directions-panel'));
    directionsDisplay_to_end.setPanel(document.getElementById('directions-panel'));
  }

  function removeMarkers() {
    for (i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  }

  function autoComplete() {
     new google.maps.places.Autocomplete(document.getElementById('start'));
     new google.maps.places.Autocomplete(document.getElementById('end'));
  }
