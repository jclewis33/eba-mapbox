"use strict";

window.Webflow ||= [];
window.Webflow.push(() => {
  //alert("hello world");
  //////////////////////////////////////////////////////////////
  /////////////////////// VARIABLES ////////////////////////////
  const popUps = document.getElementsByClassName("mapboxgl-popup");

  const viewOnMapBtn = document.querySelectorAll('btn-selector="mapbox"');

  // Set the Mapbox access token for authentication
  mapboxgl.accessToken =
    "pk.eyJ1IjoiamNsZXdpczMzIiwiYSI6ImNseWozcGgycDBsdGgya29zN2dxMWhkcDAifQ.UHnihh1moE6mQ6I2C9AMUQ";

  //////////////////////////////////////////////////////////////
  /////////////////// INITIALIZE MAPBOX MAP ////////////////////

  // Initialize the Mapbox map within the element with id 'map'
  const map = new mapboxgl.Map({
    container: "map", // The id of the HTML element to initialize the map in
    style: "mapbox://styles/jclewis33/clwkvzow2040801qg4gd50ntj", // The Mapbox style to use
    center: [-97.022553, 32.771663], // Initial center coordinates [longitude, latitude]
    zoom: 10.25, // Initial zoom level
  });

  // Adjust the zoom level of the map based on the screen size
  let mq = window.matchMedia("(max-width: 767px)");
  if (mq.matches) {
    map.setZoom(8); // Set map zoom level for mobile size
  }
});

/*code to add into webflor project
<script src="http://localhost:1234/app.js"></script>
*/
