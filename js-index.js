

function getDataFromAPI(lat, lon) {
	let SEAT_GEEK_URL = "https://api.seatgeek.com/2/events";
	let settings = { 
		url: SEAT_GEEK_URL,
		data: {
			lat: lat,
			lon: lon,
			datetime_utc: '2018-04-20',
			per_page: 5,
			client_id: `MTEyMzQzMjd8MTUyMzgyODA5MS41NA`,
			client_secret: 'ff1ee01bc647aabb41616ad3d3d3d340eb2ed31f38dd732953388a38285cccde'
		},
		dataType: 'json',
		type: 'GET',
		success: function(data) {
			console.log(data);
		},
		error: function(error) {
			console.log(error);
		}
	};
	$.ajax(settings);
}

function printData(data) {
	return console.log('working');
}

function submitButton() {
	$('#main-submit-form').on('submit', function(event) {
		event.preventDefault();
		let address= $('#location-input').val();
		geoCodeSearch(address);
	})
}

function geoCodeSearch(address) {
	let geocoder= new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
      	console.log(results[0].geometry.location);
      	let lat = results[0].geometry.location.lat();
      	let lon = results[0].geometry.location.lon();
      	getDataFromAPI(lat, lon);
        // map.setCenter(results[0].geometry.location);
        // var marker = new google.maps.Marker({
        //     map: map,
        //     position: results[0].geometry.location
        // });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

 function init() {
 	console.log('hi');
 }



submitButton();