// arrays to hold copies of the markers and html used by the side_bar 
// because the function closure trick doesnt work there 
var gmarkers = [];
const API_KEY = 'AIzaSyAbpbW83LdxA5HAs32QbSdvnWcEOruSFvM';
var map = null;
//map markers
var markerIcon = {
  safeRoad: "/static/Images/safe.svg",
  dangerRoad: "/static/Images/danger.svg",
  inBetween: "/static/Images/warning.svg",
}

function initialize() {
  var myWrapper = $("#wrapper");
  $("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
    myWrapper.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (e) {
      // code to execute after transition ends
      google.maps.event.trigger(map, 'resize');
    });
  });
  // create the map
  // 28.622437, 77.120899
  var myOptions = {
    zoom: 12,
    center: new google.maps.LatLng(28.644800, 77.216721),
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    },
    navigationControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById("map_canvas"),
    myOptions);

  google.maps.event.addListener(map, 'click', function () {
    infowindow.close();
  });

  // <p style="text-align: center;">Original Image</p>
  //       <img class="image-1" src="/static/Images/road-img.jpg" alt="sample-image-1">
  //       <br>
  //       <br>
  //       <p style="text-align: center;">Detected Image</p>
  //       <img class="image-1-out image-1" src="/static/Images/road-img.jpg" alt="sample-image-1-out">

  // Add markers to the map
  // Set up three different markers with info windows 
  // add the points 
  //My coordinates   
  // 28°37'33.2"N 77°06'53.7"E
  // 28.635229, 77.137766
  // 28.615742, 77.108743
  // 28.652580, 76.922609
  // 28.630283, 77.328073

  function get_html(res, text) {
    return (`
      <h4>${text}</h4>
      <p><b>Latitude: </b>${res.latitude}</p>
      <br>
      <p><b>Longitude: </b>${res.longitude}</p>
      <br>
      <p><b>Effect Percentage: </b>${res.effect_percentage}</p>
      <img src="${res.original_image}" width=100px height=100px />
      <img src="${res.detected_image}" width=165px height=135px />
      <div style="display: flex;">
      <a href="${res.original_image}" target="_blank">
      <p>Original Image</p>
      </a>
      <a href="${res.detected_image}" target="_blank" style="margin-left:21%;">
      <p >Detected Image</p>
      </a>
      </div>  
    `)
  }

  $.ajax({
    url: "/api/road/",
    type: 'GET',
    dataType: 'json',
    success: function (res) {
      let api_data = res;
      console.log(api_data);
      let road = 0;
      for (road = 0; road < api_data.length; road++) {
        var eff_per = Number(api_data[road].effect_percentage).toFixed(2);
        var point = new google.maps.LatLng(api_data[road].latitude, api_data[road].longitude);
        if (api_data[road].effect_percentage <= 40) {
          var marker = createMarker(markerIcon.safeRoad, point, `Road ${api_data[road].id} - Effect (${eff_per}%)`, get_html(api_data[road], "Paved Road - Safe"));
        }
        else if (api_data[road].effect_percentage <= 80) {
          var marker = createMarker(markerIcon.inBetween, point, `Road ${api_data[road].id} - Effect (${eff_per}%)`, get_html(api_data[road], "Good Road - Needs Some Repairing"));
        }
        else {
          var marker = createMarker(markerIcon.dangerRoad, point, `Road ${api_data[road].id} - Effect (${eff_per}%)`, get_html(api_data[road], "Danger Road - Needs Immediate Repairing"));
        }
      }
    },
    failure: function (res) {
      console.log(res.data);
    }
  })


  function getRndInteger(min, max) {
    return (Math.random() * (max - min) + min).toFixed(6)
  }

  // var i = 0;
  // var j = 28.625877;
  // var k = 77.114919;
  // for (i = 0; i < 100; i++) {
  //   j = getRndInteger(28.630283, 28.652580);
  //   k = getRndInteger(76.922609, 77.328073);
  //   // console.log(j, k);
  //   var point = new google.maps.LatLng(j, k);
  //   var marker = createMarker(markerIcon.inBetween, point, "Image-1-Marker", "This road is safe for traveling.(Paved)")
  // // }
  // var point = new google.maps.LatLng(28.625877, 77.114919);
  // var marker = createMarker(markerIcon.safeRoad, point, "Image-1-Marker", "This road is safe for traveling.(Paved)")


  // var point = new google.maps.LatLng(28.631488, 76.964971);
  // var marker = createMarker(markerIcon.safeRoad, point, "Image-1-Marker", "This road is safe for traveling.(Paved)")

  // var point = new google.maps.LatLng(28.635229, 77.137766);
  // var marker = createMarker(markerIcon.dangerRoad, point, "Image-2-Marker", "This road is dangerous for traveling.(Cracks/Potholes)")

  // var point = new google.maps.LatLng(28.615742, 77.108743);
  // var marker = createMarker(markerIcon.inBetween, point, "Image-3-Marker", "This road is between danger and safe(Unpaved).")
}

var infowindow = new google.maps.InfoWindow({
  size: new google.maps.Size(150, 50)
});

// This function picks up the click and opens the corresponding info window
function myclick(i) {
  google.maps.event.trigger(gmarkers[i], "click");
}

// A function to create the marker and set up the event window function 
function createMarker(icon, latlng, name, html) {
  var contentString = html;
  var marker = new google.maps.Marker({
    position: latlng,
    map: map,
    icon: icon,
    animation: google.maps.Animation.DROP,
    zIndex: Math.round(latlng.lat() * -100000) << 5
  });

  google.maps.event.addListener(marker, 'click', function () {
    infowindow.setContent(contentString);
    infowindow.open(map, marker);
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  });
  // save the info we need to use later for the side_bar
  gmarkers.push(marker);
  // add a line to the side_bar html
  var sidebar = $('#side_bar');
  var sidebar_entry = $('<li/>', {
    'html': name,
    'click': function () {
      google.maps.event.trigger(marker, 'click');
    },
    'mouseenter': function () {
      $(this).css('color', '#ff704d');
    },
    'mouseleave': function () {
      $(this).css('color', '#ffffff');
    }
  }).appendTo(sidebar);
}

google.maps.event.addDomListener(window, 'load', initialize);