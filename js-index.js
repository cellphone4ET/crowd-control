

function getDataFromAPI(searchTerm, callback) {
	let SEAT_GEEK_URL = "https://api.seatgeek.com/2/events";
	let settings = { 
		url: SEAT_GEEK_URL,
		data: {
			lat: 30.286119,
			lon: -97.723227,
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

getDataFromAPI('Seattle');

