$(document).ready(function() {

const state = {
	userLocation: {},
	crowdedLocations: {},
	markers: []
};

var map;
var geocoder;
var infoWindow;
var markerPos;
var contentString;


//functions to get current location
function getCurrentLocation() {
	geocoder = new google.maps.Geocoder();
	infoWindow = new google.maps.InfoWindow;

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {

			var pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			var latlng = new google.maps.LatLng(state.userLocation.lat, state.userLocation.lat);
			var mapOptions = {
				zoom: 13,
				center: latlng,
			};
			map = new google.maps.Map(document.getElementById('map'), mapOptions);
			infoWindow.setPosition(pos);
            infoWindow.setContent('You are here.');
            infoWindow.open(map);
			map.setCenter(pos);

			state.userLocation = pos;
			getDataFromAPI(state.userLocation.lat, state.userLocation.lng);
		}, function() {
			handleLocationError(true, infoWindow, map.getCenter());
		});
	} else {
		// Browser doesn't support Geolocation
		handleLocationError(false, infoWindow, map.getCenter());
	}
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos);
	infoWindow.setContent(browserHasGeolocation ?
		'Error: The Geolocation service failed.' :
		'Error: Your browser doesn\'t support geolocation.');
}

function geoCodeSearch(address) {
	geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
      	
      	state.userLocation.lat = results[0].geometry.location.lat();
      	state.userLocation.lng = results[0].geometry.location.lng();
      	getDataFromAPI(state.userLocation.lat, state.userLocation.lng);

      	var latlng = new google.maps.LatLng(state.userLocation.lat, state.userLocation.lng);
		var mapOptions = {
			zoom: 13,
			center: latlng,
		};
		map = new google.maps.Map(document.getElementById('map'), mapOptions);
      	map.setCenter(results[0].geometry.location);
        let marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
}

function getDataFromAPI(lat, lng) {
	let SEAT_GEEK_URL = "https://api.seatgeek.com/2/events";
	let settings = { 
		url: SEAT_GEEK_URL,
		data: {
			lat: lat,
			lon: lng,
			// datetime_local: 2018-04-27,
			// datetime_local: 2018-10-04,
			per_page: 5,
			client_id: `MTEyMzQzMjd8MTUyMzgyODA5MS41NA`,
			client_secret: 'ff1ee01bc647aabb41616ad3d3d3d340eb2ed31f38dd732953388a38285cccde'
		},
		dataType: 'json',
		type: 'GET',
		success: function(data) {
			displayData(data);
		},
		error: function(error) {
			console.log(error);
		}
	};
	$.ajax(settings);
}

//functions to display data
function displayData(data) {
	console.log(data);
	let results = data.events;
	let events = results.map(function(event) {
		var markerPos = {
			lat: event.venue.location.lat,
			lng: event.venue.location.lon
		}

		var contentString = `On ${event.datetime_local} there will be a large crowd around\
		${event.venue.address}. May be best to avoid that area.`

		state.crowdedLocations.lat = markerPos.lat;
		state.crowdedLocations.lng = markerPos.lng;

		createMarker(markerPos, contentString);

	})
}

function createMarker(markerPos, contentString) {
	
	var infowindow = new google.maps.InfoWindow({
	     content: contentString
	   });
	var marker = new google.maps.Marker({
			position: markerPos,
			map: map,
			title: "Introverts beware!",
			infowindow: infoWindow,
			
			//icon: 'images/icn_blue.png'
		});
		marker.addListener('click', function(){
			infowindow.open(map, marker);
		})
	state.markers.push(marker)
}

//event listeners
function submitManualLocationInput() {
	$('#main-submit-form').on('submit', function(event) {
		event.preventDefault();
		let address= $('#location-input').val();
		geoCodeSearch(address);
		$('#location-input').val(' ');
	})
}

function submitGeoLocation() {
	$('#geolocation-button').on('click', function(event) {
		getCurrentLocation();
	})
}

submitGeoLocation();
submitManualLocationInput();

});



