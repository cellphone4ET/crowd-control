const state = {
	userLocation: {},
	markers: []
};

var map;
var geocoder;
var infoWindow;
var markerPos;
var contentString;

function init(){
	geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(0, 0);
	var mapOptions = {
		zoom: 13,
		center: latlng,
	};
	map = new google.maps.Map(document.getElementById('map'), mapOptions);

	infoWindow = new google.maps.InfoWindow({
		content: "______"
	});
}


//functions to get current location
function getCurrentLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			state.userLocation = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			geocodeSuccess()
		}, function() {
			handleLocationError(true, infoWindow, map.getCenter());
		});
	} else {
		// Browser doesn't support Geolocation
		alert(`Geolocation wasn't successful, try searching for your location instead.`)
	}
}


function geoCodeSearch(address) {
	geocoder = new google.maps.Geocoder();
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == 'OK') {
			state.userLocation.lat = results[0].geometry.location.lat();
			state.userLocation.lng = results[0].geometry.location.lng();
			geocodeSuccess();
		} else {
			// Browser doesn't support Geolocation
			handleLocationError(false, infoWindow, map.getCenter());
		}
	});
}

function geocodeSuccess(){
	map.setCenter(state.userLocation);
	infoWindow.setPosition(state.userLocation);
	infoWindow.setContent('You are here.');
	infoWindow.open(map);
	getDataFromAPI(state.userLocation.lat, state.userLocation.lng);
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos);
	infoWindow.setContent(browserHasGeolocation ?
	'Error: The Geolocation service failed.' :
	'Error: Your browser doesn\'t support geolocation.');
	alert('Whoops! Looks like geolocation is having some issues. Please\
		search for location instead.');
}


function getDataFromAPI(lat, lng) {
	let SEAT_GEEK_URL = "https://api.seatgeek.com/2/events";
	let settings = {
		url: SEAT_GEEK_URL,
		data: {
			lat: lat,
			lon: lng,
			per_page: 25,
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

		var contentString = `
		<div>
		<h1>${event.short_title}</h1>
		<h2>${event.venue.name}</h2>
		On ${event.datetime_local} there will be a <br> large crowd around\
		${event.venue.address}. <br><br>It may be best to avoid that area.
		</div>`

		createMarker(markerPos, contentString);
	})
}

function createMarker(markerPos, contentString) {
	var marker = new google.maps.Marker({
		position: markerPos,
		map: map,
		title: "Introverts beware!",
		infowindow: infoWindow,
		//icon: 'images/icn_blue.png'
	});
	marker.addListener('click', function(){
		infoWindow.open(map, marker);
		infoWindow.setContent(contentString)
	})
	state.markers.push(marker)
}

function hideShowElementsOnSubmit() {
	$('#main-submit-form').hide();
	$('#map').show();
	$('#results-menu').show();
}
//event listeners
function submitManualLocationInput() {
	$('#main-submit-form').on('submit', function(event) {
		event.preventDefault();
		let address = $('#location-input').val();
		geoCodeSearch(address);
		$('#location-input').val(' ');
		hideShowElementsOnSubmit();
	})
}

function submitGeoLocation() {
	$('#geolocation-button').on('click', function(event) {
		getCurrentLocation();
		hideShowElementsOnSubmit();

	});
}

function submitFutureDate() {}

function submitNewLocation(){
	$('#new-location-form').on('submit', function(event) {
		event.preventDefault();
		init();
		let address = $('#new-location-input').val();
		console.log(address)
		geoCodeSearch(address);
		$('#new-location-input').val(' ');
		hideShowElementsOnSubmit();
	});
}

$(document).ready(function() {
	// submitFutureDate();
	submitNewLocation();
	submitGeoLocation();
	submitManualLocationInput();
});