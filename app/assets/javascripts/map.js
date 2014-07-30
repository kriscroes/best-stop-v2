
function initialize() {
var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService = new google.maps.DirectionsService();

function calcRoute() {
  var origin      = new google.maps.LatLng(41.850033, -87.6500523);
  var destination = new google.maps.LatLng(42.850033, -85.6500523);
  var request = {
      origin:      origin,
      destination: destination,
      travelMode:  google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
  });
}

calcRoute();

var handler = Gmaps.build('Google');
handler.buildMap({ internal: {id: 'directions'}}, function(){
  directionsDisplay.setMap(handler.getMap());
});


}

google.maps.event.addDomListener(window, "load", initialize);