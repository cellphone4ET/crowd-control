var state = {
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

//functions to get current location and events data
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
	search for your location instead.');
	$('#main-div').show();
	$('#map').hide();
	$('#results-menu').hide();
	$('html').css({'background': 'url("https://i.imgur.com/UTk3vSX.png")', 'overflow': 'scroll', 'width': '100%'});
}

function getDataFromAPI2(lat, lng, futureStartDate, futureStartDate2) {
	let SEAT_GEEK_URL = "https://api.seatgeek.com/2/events";
	let settings = {
		url: SEAT_GEEK_URL,
		data: {
			lat: lat,
			lon: lng,
			'datetime_local.gt': futureStartDate,
			'datetime_local.lt': futureStartDate2,
			per_page: 25,
			client_id: `MTEyMzQzMjd8MTUyMzgyODA5MS41NA`,
			client_secret: 'ff1ee01bc647aabb41616ad3d3d3d340eb2ed31f38dd732953388a38285cccde'
		},
		dataType: 'json',
		type: 'GET',
		success: function(data) {
			let events = data.events;
			if (events.length === 0) {
				alert('Lucky you! It looks like there are no events in your immediate area that will draw large\
				 crowds. If you\'d like you can see what the crowded areas of another\
				 area are by searching by location.');
			} else {
				displayData(events);
			}
		},
		error: function(error) {
			console.log(error);
		}
	};
	$.ajax(settings);
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
			let events = data.events;
			if (events.length === 0) {
				alert('Lucky you! It looks like there are no crowded places due to large events in your current location. If you\'d like to check out the crowded areas of another location just enter a new city name and hit submit.');
			} else {
				displayData(events);
			}
		},
		error: function(error) {
			console.log(error);
		}
	};
	$.ajax(settings);
}

//functions to display data
function displayData(events) {
	console.log(events);
	let renderedEvents = events.map(function(event) {
		var markerPos = {
			lat: event.venue.location.lat,
			lng: event.venue.location.lon
		}

		let date = new Date(event.datetime_local);
		let readableDate = date.toDateString();
		let readableHours = date.getHours();
		let readableMinutes = ("0"+ date.getMinutes()).slice(-2);
		

		var contentString = `
		<div>
		<h2>${event.short_title}</h2>
		<h3>${event.venue.name}</h3>
		<p id="event-info">On ${readableDate} at ${readableHours}:${readableMinutes} there will be a <br> large crowd around\
		${event.venue.address}. <br><br>It may be best to avoid that area.</p>
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
		icon: 'poop30px.png'
	});
	marker.addListener('click', function(){
		infoWindow.open(map, marker);
		infoWindow.setContent(contentString);
	})
	state.markers.push(marker);
}

function hideShowElementsOnSubmit() {
	$('#main-div').hide();
	$('#map').show();
	$('#results-menu').show();
	$('#collapse-menu-button').show();
	$('html').css({'background': 'none', 'overflow': ''});;
}
//event listeners
function submitManualLocationInput() {
	$('#main-submit-form').on('submit', function(event) {
		event.preventDefault();
		let address = $('#location-input').val();
		geoCodeSearch(address);
		$('#location-input').val(' ');
		hideShowElementsOnSubmit();
	});
}

function submitGeoLocation() {
	$('#geolocation-button').on('click', function(event) {
		getCurrentLocation();
		hideShowElementsOnSubmit();

	});
}

function submitFutureDate() {
	$('#future-date-form').on('submit', function(event) {
		event.preventDefault();
		cleanMarkers();
		let futureDate = $('#future-date-input').val();
		let futureDate2 = moment(futureDate).add(1, 'days');
		let futureDate3 = futureDate2._d;
		let futureDateEnd = moment(futureDate3).format('YYYY-MM-DD');
		getDataFromAPI2(state.userLocation.lat, state.userLocation.lng, futureDate, futureDateEnd);
	});
}

function submitNewLocation(){
	$('#new-location-form').on('submit', function(event) {
		event.preventDefault();
		cleanMarkers();
		let address = $('#new-location-input').val();
		geoCodeSearch(address);
		$('#new-location-input').val(' ');
		hideShowElementsOnSubmit();
	});
}

function cleanMarkers() {
	let markers = state.markers;
	//Loop through all the markers and remove
        for (let i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
}

function openNav() {
    document.getElementById("myNav").style.width = "25%";
}

function closeNav() {
    document.getElementById("myNav").style.width = "0%";
}

$(document).ready(function() {
	submitFutureDate();
	submitNewLocation();
	submitGeoLocation();
	submitManualLocationInput();
});