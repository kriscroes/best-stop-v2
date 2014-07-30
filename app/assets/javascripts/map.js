  var directionsDisplay = new google.maps.DirectionsRenderer();
  var directionsService = new google.maps.DirectionsService();
  // var $stopPoint;
  var stopPointLat,
      stopPointLon;
//       consumer_key = 'h6izpzzte-6P3SeJ3uluZg',
//       consumer_secret = 'Ks7ZLrcurboT8GidbkMT4oDBwoM',
//       token = 'F-EgdJc44BZhoq3FcwsrMDFGdJHL7aUg',
//       token_secret = 'N5d15VGLriVUkO3n1DbSp59O8gY',
//       URL = "http://api.yelp.com/v2/search?term=food&amp;cll="+stopPointLat+","+stopPointLon+"&consumer_key="+consumer_key+"&consumer_secret="+consumer_secret+"&token="+token+"&token_secret="+token_secret;

// function yelpCall(){
//   $.ajax({
//     url: URL,
//     dataType: 'json',
//     success: function(json){
//       console.log(json);
//     },
//     error: function(e){
//       console.log(e.message);
//     }
//   })
// }

function initialize() {
  calcRoute();
  $("#map_options").submit(function(event) {
    event.preventDefault();
  
    calcRoute();
    // getStopPoint($stopPoint);
    var marker = null;
    marker = handler.addMarker({
      lat: stopPointLat,
      lng: stopPointLon
    });
    
    //make yelp request
    //print results to the screen
    console.log(stopPointLat);
    console.log(stopPointLon);
  })


  var handler = Gmaps.build('Google');
  handler.buildMap({ internal: {id: 'directions'}}, function(){
    directionsDisplay.setMap(handler.getMap());
    // displayOnMap();
    // marker = handler.addMarkers({"lat": stopPointLat, "lng": stopPointLon, infowindow: 'Popup!', marker: 'Marker'});
    // handler.bounds.extendWith(marker);
    // console.log(marker);
  });

  function displayOnMap(){
    // handler.map.centerOn(marker);
  };
}

function calcRoute() {
  var origin = $("#start").val(),
      destination = $("#end").val();
  // var origin      = new google.maps.LatLng(41.850033, -87.6500523);
  // var destination = new google.maps.LatLng(40.7055269, -74.014346);
  var request = {
      origin:      origin,
      destination: destination,
      travelMode:  google.maps.TravelMode.DRIVING,
  };
  directionsService.route(request, function(response, status) {
    //console.log(response);
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      var $stopPoint = parseInt($("#stop_point").val());
      getStopPoint(response, $stopPoint);
    }
  });
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

      // polyline.setPath([]);
      var steps = response.routes[0].legs[0].steps;
      for (j=0; j<steps.length; j++) {
        var nextSegment = steps[j].path;
        for (k=0; k<nextSegment.length; k++) {
          polyline.getPath().push(nextSegment[k]);
          bounds.extend(nextSegment[k]);
        }
      }
  var stopPointLatLonObject = polyline.GetPointAtDistance(distance);
      stopPointLat = stopPointLatLonObject["d"];
      stopPointLon = stopPointLatLonObject["e"];
      // stopPointLatlng = new google.maps.LatLng(stopPointLat, stopPointLon);

      // console.log(stopPointLatLonObject);
      // console.log(stopPointLatlng);
      // var marker = new google.maps.Marker({
      //   position: stopPointLatLonObject,
      //   title:"Hello World!"
      // });
      // marker.setMap(map);
      // console.log(marker);
       //this returns something like this google.maps.LatLng(41.850033, -87.6500523)  
  // insert create marker code here using result of GetPointAtDistance

  // alert("Time:"+time+" totalTime:"+totalTime+" totalDist:"+totalDist+" dist:"+distance);
  // if (!marker) {
  //       marker = createMarker(polyline.GetPointAtDistance(distance),"time: "+time,"marker");
  // } else {
  //   marker.setPosition(polyline.GetPointAtDistance(distance));
  //   marker.setTitle("time:"+time);
  // }
}


google.maps.event.addDomListener(window, "load", initialize);