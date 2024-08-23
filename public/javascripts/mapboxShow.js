// const campground = require("../../models/campground");
mapboxgl.accessToken = maptoken;

const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/streets-v12', // style URL
	center: [-74.5, 40], // starting position [lng, lat]
	zoom: 9, // starting zoom
});
// new mapboxgl.Marker()
// 	.setLngLat(camp.geometry.coordinates)
// 	.addTo(map);

// console.log(camp)