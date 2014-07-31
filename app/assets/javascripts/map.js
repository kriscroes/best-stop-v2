$(function(){

  var map;
  var marker;
  var markers = [];
  var directionsDisplay;
  var directionsService = new google.maps.DirectionsService(); 
  var stopPointLat,
      stopPointLon,
      check_done;

  function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers:true});
    // var newYork = new google.maps.LatLng(40.7055, -74.0143);
    var mapOptions = {
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("directions"), mapOptions);
    polyline = new google.maps.Polyline({
      path: [],
      strokeColor: '#FF0000',
      strokeWeight: 3
    });
    directionsDisplay.setMap(map);

    calcRoute();

    $("#map_options").submit(function(event) {
      event.preventDefault();
      check_done = "not done";
      calcRoute();

      check();
      function check(){
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

      console.log(stopPointLat);
      console.log(stopPointLon);
    });
  }
  google.maps.event.addDomListener(window, "load", initialize);

  function calcRoute() {
    removeMarkers();
    var origin = $("#start").val(),
        destination = $("#end").val();
    // var origin = new google.maps.LatLng(41.850033, -87.6500523);
    // var destination = new google.maps.LatLng(40.7055269, -74.014346);
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
    var stopPointLatLonObject = polyline.GetPointAtDistance(distance);
    placeMarker(stopPointLatLonObject);
    stopPointLat = stopPointLatLonObject["d"];
    stopPointLon = stopPointLatLonObject["e"];
    check_done = "done";
    console.log("check_done inside calcRoute: "+check_done);
  }

});