  var directionsDisplay = new google.maps.DirectionsRenderer();
  var directionsService = new google.maps.DirectionsService();

function initialize() {

  calcRoute();
  
  $("#map_options").submit(function(event) {
    event.preventDefault();
    calcRoute();
  })

  var handler = Gmaps.build('Google');
  handler.buildMap({ internal: {id: 'directions'}}, function(){
    directionsDisplay.setMap(handler.getMap());
  });


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
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      }
    });
  }

google.maps.event.addDomListener(window, "load", initialize);