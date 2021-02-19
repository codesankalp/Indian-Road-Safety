// arrays to hold copies of the markers and html used by the side_bar 
// because the function closure trick doesnt work there 
var gmarkers = [];
var map = null;
//map markers
var markerIcon = { safeRoad: "http://maps.google.com/mapfiles/ms/icons/motorcycling.png",
dangerRoad: "http://maps.google.com/mapfiles/ms/icons/caution.png",
inBetween :"http://maps.google.com/mapfiles/ms/icons/truck.png",
}

function initialize() {
  var myWrapper = $("#wrapper");
  $("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
    myWrapper.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
      // code to execute after transition ends
      google.maps.event.trigger(map, 'resize');
    });
  });
  // create the map
  // 28.622437, 77.120899
  var myOptions = {
    zoom: 15,
    center: new google.maps.LatLng(28.622437, 77.120899),
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    },
    navigationControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById("map_canvas"),
  myOptions);

google.maps.event.addListener(map, 'click', function() {
  infowindow.close();
});

// Add markers to the map
// Set up three different markers with info windows 
// add the points 
//My coordinates   
// 28°37'33.2"N 77°06'53.7"E
// 28.635229, 77.137766
// 28.615742, 77.108743
var point = new google.maps.LatLng(28.625877,77.114919);
var marker = createMarker(markerIcon.safeRoad,point, "Image-1-Marker", "This road is safe for traveling.(Paved)")

var point = new google.maps.LatLng(28.635229, 77.137766);
var marker = createMarker(markerIcon.dangerRoad,point, "Image-2-Marker", "This road is dangerous for traveling.(Cracks/Potholes)")

var point = new google.maps.LatLng(28.615742, 77.108743);
var marker = createMarker(markerIcon.inBetween,point, "Image-3-Marker", "This road is between danger and safe(Unpaved).")
}

var infowindow = new google.maps.InfoWindow({
size: new google.maps.Size(150, 50)
});

// This function picks up the click and opens the corresponding info window
function myclick(i) {
google.maps.event.trigger(gmarkers[i], "click");
}

// A function to create the marker and set up the event window function 
function createMarker(icon,latlng, name, html) {
var contentString = html;
var marker = new google.maps.Marker({
  position: latlng,
  map: map,
  icon:icon,
  zIndex: Math.round(latlng.lat() * -100000) << 5
});

google.maps.event.addListener(marker, 'click', function() {
  infowindow.setContent(contentString);
  infowindow.open(map, marker);
});
// save the info we need to use later for the side_bar
gmarkers.push(marker);
// add a line to the side_bar html
var sidebar = $('#side_bar');
var sidebar_entry = $('<li/>', {
  'html': name,
  'click': function() {
    google.maps.event.trigger(marker, 'click');
  },
  'mouseenter': function() {
    $(this).css('color', '#ff704d');
  },
  'mouseleave': function() {
    $(this).css('color', '#ffffff');
  }
}).appendTo(sidebar);
}

google.maps.event.addDomListener(window, 'load', initialize);