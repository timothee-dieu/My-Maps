var map;
var panel = $('#panel').get(0);
var directionsDisplay;
var geocoder;
var selected;
var geoloc;
var waypoints = [];
var infoWindow;
var service;

function init()
{
	navigator.geolocation.getCurrentPosition(loadMap, function()
	{
		alert('Vous devez activer la géolocalisation.');
	});
}

function loadMap(pos)
{
	console.log('Latitude: ' + pos.coords.latitude);
	console.log('Longitude: ' + pos.coords.longitude);

	var lat = pos.coords.latitude;
	var long = pos.coords.longitude;
	var mapOptions = {
		zoom: 12,
		center: new google.maps.LatLng(lat, long),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map($('#map').get(0), mapOptions);
	infoWindow = new google.maps.InfoWindow();
	service = new google.maps.places.PlacesService(map);

	geocoder = new google.maps.Geocoder;

	map.addListener('click', function(e) 
	{
		if (!selected) {
			return;
		}
		selected.val(e.latLng.lat() + ' ' + e.latLng.lng());
		geocodeLatLng(selected);

	});

	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(lat, long),
		map: map,
		animation: google.maps.Animation.DROP,
		title: 'Vous êtes ici!'
	});

	directionsDisplay = new google.maps.DirectionsRenderer({
	    map   : map, 
	    panel : panel,
	    draggable: true
	});

	var start = $('#origin').get(0);
	var end = $('#destination').get(0);
	var autocomplete = new google.maps.places.Autocomplete(start);
	var autocomplete = new google.maps.places.Autocomplete(end);

	autocomplete.bindTo('bounds', map);

	google.maps.event.addListenerOnce(map, 'idle', onMapLoaded);

	geoloc = {lat: lat, lng: long};

}

function onMapLoaded()
{
	$("#wrapper").toggleClass("toggled");
	$('h1 span').toggleClass('animated bounce');
	$('hr').toggleClass('animated zoomIn');

	var backup = localStorage.getItem('myMapBackup');
	
	if (!backup){
		return;
	}
	$('#panel-backup').html(backup);
	$('#panel-backup').css({direction: 'ltr'});
    $('#backup').addClass('animated bounceIn');
    $('#backup').show();

}

function onLocalizeClick()
{

	navigator.geolocation.getCurrentPosition(function(pos)
	{
		var lat = pos.coords.latitude;
		var long = pos.coords.longitude;

		$('#origin').val(lat + ' ' + long);

		geocodeLatLng($('#origin'));

		$('.sidebar-destination').addClass('sidebar-selected');
		$('.sidebar-destination label').addClass('bluecolor');
		$('.sidebar-origin').removeClass('sidebar-selected');
		$('.sidebar-origin label').removeClass('bluecolor');
		selected = $('#destination');
	});
}

function onCalculateClick()
{
	calculate();
	google.maps.event.clearListeners(map, 'idle');
    map.addListener('idle', getPlaces);

    $('.sidebar-origin').removeClass('sidebar-selected');
    $('.sidebar-origin label').removeClass('bluecolor');
    $('.sidebar-destination').removeClass('sidebar-selected');
    $('.sidebar-destination label').removeClass('bluecolor');
    selected = null;
}


function calculate()
{
	var mode = $('#travelmode').val();
	var orig = $('#origin').val();
    var dest = $('#destination').val();

    if(origin && destination) 
    {
        var request = {
            origin      : orig,
            destination : dest,
            waypoints: waypoints,
            optimizeWaypoints: true,
            travelMode  : google.maps.DirectionsTravelMode[mode]
        }
        var directionsService = new google.maps.DirectionsService();
        directionsService.route(request, function(response, status)
        { 
            if(status == google.maps.DirectionsStatus.OK)
            {
            	directionsDisplay.setMap(map);
                directionsDisplay.setDirections(response);
                $('#details').removeClass('animated bounceOut');
                $('#details').addClass('animated bounceIn');
                $('#details').show();
                
                setTimeout(function()
            	{
	                localStorage.setItem('myMapBackup', $('#panel').html());
            	}, 1000);
            }
        });
    }
}

function onClearClick()
{
	orig = $('#origin').val('');
    dest = $('#destination').val('');
    $('.sidebar-origin').removeClass('sidebar-selected');
    $('.sidebar-origin label').removeClass('bluecolor');
    $('.sidebar-destination').removeClass('sidebar-selected');
    $('.sidebar-destination label').removeClass('bluecolor');

    google.maps.event.clearListeners(map, 'idle');
    
    if (geoloc) {
    	map.setCenter(geoloc);
    	directionsDisplay.setMap(null);
    }
    selected = null;
    waypoints = [];
    $('#details').removeClass('animated bounceIn');
    $('#details').addClass('animated bounceOut').delay(1000).queue(function()
    {
    	$('#details').hide().dequeue();	
    });
    $('#panel').html('');

}

function geocodeLatLng(input) 
{
	var content = input.val();
	var latlngStr = content.split(' ', 2);
	var latLng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
	
	geocoder.geocode({'location': latLng}, function(results, status) 
	{
		if (status === google.maps.GeocoderStatus.OK) 
		{
			if (results[0]) {
				input.val(results[0].formatted_address);
			} else {
				window.alert('No results found');
			}
		} else {
			window.alert('Geocoder failed due to: ' + status);
		}
	});
}


function getPlaces()
{
	var places = [];
	var request = 
	{
		bounds: map.getBounds(),
		types: ['museum', 'amusement_park']
	};
	service.radarSearch(request, onRadarSearchSuccess);

	function onRadarSearchSuccess(results, status)
	{
		if (status !== google.maps.places.PlacesServiceStatus.OK) 
		{
			return;
		}
		for (var i = 0, result; result = results[i]; i++) 
		{
			addMarker(result);
		}
	}


	function addMarker(place) 
	{
		for (var i = 0; i < places.length; i++)
		{
			if (place.place_id === places[i].place_id) 
			{
				return;
			}
		}
		var marker = new google.maps.Marker(
		{
			map: map,
			position: place.geometry.location,
			icon: 
			{
				url: 'http://maps.gstatic.com/mapfiles/circle.png',
				anchor: new google.maps.Point(10, 10),
				scaledSize: new google.maps.Size(10, 17)
			}
		});
		places.push(place);

		google.maps.event.addListener(marker, 'click', function() 
		{
			service.getDetails(place, function(result, status) 
			{
				if (status !== google.maps.places.PlacesServiceStatus.OK) 
				{
					return;
				}
				var content = '<h4>' + result.name + '</h4>'; 
				content += 
				"<button type='button' class='btn btn-info' onclick='addWaypoint(\"" + result.formatted_address + "\")'>Passez par ici!</button>";
				infoWindow.setContent(content);
				infoWindow.open(map, marker);
			});
		});
	}

}

function addWaypoint(address)
{
	waypoints.push({location: address, stopover: true});
	onCalculateClick();
}



$(function()
{
	$('#origin').click(function()
	{
		$('.sidebar-origin').addClass('sidebar-selected');
		$('.sidebar-origin label').addClass('bluecolor');
		$('.sidebar-destination').removeClass('sidebar-selected');
		$('.sidebar-destination label').removeClass('bluecolor');
		selected = $('#origin');
	});
	$('#destination').click(function()
	{
		$('.sidebar-destination').addClass('sidebar-selected');
		$('.sidebar-destination label').addClass('bluecolor');
		$('.sidebar-origin').removeClass('sidebar-selected');
		$('.sidebar-origin label').removeClass('bluecolor');
		selected = $('#destination');
	});

	var backup = localStorage.getItem('myMapBackup');
	
	if (!backup){
		return;
	}
	$('#panel-backup').html(backup);
    $('#backup').addClass('animated bounceIn');
    $('#backup').show();
 });