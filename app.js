"use strict";

window.Webflow ||= [];
window.Webflow.push(() => {
  // Add console logs to help debug
  console.log("Mapbox script initialized");

  //////////////////////////////////////////////////////////////
  /////////////////////// VARIABLES ////////////////////////////
  const popUps = document.getElementsByClassName("mapboxgl-popup");
  const churchesContainer = document.querySelector(".church-list_wrapper"); // Container holding church items
  const viewOnMapBtns = document.querySelectorAll('[btn-selector="mapbox"]');
  const churchItems = document.querySelectorAll(".church-list_item");
  const mapElement = document.getElementById("map");
  let churches = []; // Array to store church data
  let markers = []; // Array to store map markers

  // Debug log to check elements are found
  console.log("Church items found:", churchItems.length);
  console.log("View on map buttons found:", viewOnMapBtns.length);

  // Set the Mapbox access token for authentication
  mapboxgl.accessToken =
    "pk.eyJ1IjoiamNsZXdpczMzIiwiYSI6ImNseWozcGgycDBsdGgya29zN2dxMWhkcDAifQ.UHnihh1moE6mQ6I2C9AMUQ";

  // Check if the map container exists
  if (!mapElement) {
    console.error("Map container with id 'map' not found!");
    return; // Exit if no map container
  }

  //////////////////////////////////////////////////////////////
  /////////////////// INITIALIZE MAPBOX MAP ////////////////////

  // Initialize the Mapbox map within the element with id 'map'
  let map;
  try {
    map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/jclewis33/clwkvzow2040801qg4gd50ntj",
      center: [-97.022553, 32.771663],
      zoom: 9, // Start with a slightly zoomed out view
    });
    console.log("Map initialized successfully");
  } catch (error) {
    console.error("Error initializing map:", error);
    return; // Exit if map fails to initialize
  }

  // Adjust the zoom level of the map based on the screen size
  let mq = window.matchMedia("(max-width: 767px)");
  if (mq.matches) {
    map.setZoom(8); // Set map zoom level for mobile size
  }

  //////////////////////////////////////////////////////////////
  /////////////////// COLLECT CHURCH DATA //////////////////////

  // Function to collect church data from the collection list
  function collectChurchData() {
    console.log("Collecting church data");

    churchItems.forEach((church, index) => {
      // Get church name and address
      const name =
        church.querySelector(".church-list_church-name")?.textContent.trim() ||
        `Church ${index + 1}`;
      const address =
        church.querySelector(".church-list_address")?.textContent.trim() || "";

      // Set up default values
      let websiteUrl = "";
      let websiteText = "";
      let facebookUrl = "";
      let facebookText = "";
      let linkToUse = null;

      // Get website if available and not invisible
      const websiteElement = church.querySelector(".church-list_website");
      if (
        websiteElement &&
        !websiteElement.classList.contains("w-condition-invisible")
      ) {
        websiteUrl = websiteElement.getAttribute("href") || "";
        websiteText = websiteElement.textContent.trim() || "Website";
        // Set website as the preferred link
        linkToUse = {
          url: websiteUrl,
          text: websiteText,
          type: "website",
        };
      }

      // Get Facebook if available and not invisible
      // Only use Facebook if we don't already have a website
      const facebookElement = church.querySelector(".church-list_facebook");
      if (
        facebookElement &&
        !facebookElement.classList.contains("w-condition-invisible")
      ) {
        facebookUrl = facebookElement.getAttribute("href") || "";
        facebookText = facebookElement.textContent.trim() || "Facebook";
        // Set Facebook as link only if website isn't available
        if (!linkToUse) {
          linkToUse = {
            url: facebookUrl,
            text: facebookText,
            type: "facebook",
          };
        }
      }

      // Get coordinates from the section_chuches_location divs
      let lat = 0;
      let lng = 0;

      // Find the latitude div
      const latDiv = church.querySelector(
        ".section_chuches_location[location-latitude]"
      );
      if (latDiv) {
        lat = parseFloat(
          latDiv.getAttribute("location-latitude") || latDiv.textContent.trim()
        );
      }

      // Find the longitude div
      const lngDiv = church.querySelector(
        ".section_chuches_location[location-longitude]"
      );
      if (lngDiv) {
        lng = parseFloat(
          lngDiv.getAttribute("location-longitude") || lngDiv.textContent.trim()
        );
      }

      console.log(`Coordinates for ${name}: lat=${lat}, lng=${lng}`);

      // Only add churches with valid coordinates
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        churches.push({
          id: index,
          name,
          address,
          linkToUse, // Store the single link to use
          coordinates: [lng, lat], // Mapbox uses [longitude, latitude] format
          element: church,
        });
        console.log(`Added church: ${name} at coordinates [${lng}, ${lat}]`);
      } else {
        console.warn(`No valid coordinates found for church: ${name}`);
      }
    });

    console.log("Churches collected:", churches.length);
  }

  //////////////////////////////////////////////////////////////
  /////////////////// ADD MARKERS TO MAP ///////////////////////

  // Function to add markers to the map
  function addMarkersToMap() {
    console.log("Adding markers to map");

    churches.forEach((church) => {
      // Create marker element
      const markerEl = document.createElement("div");
      markerEl.className = "church-marker";
      markerEl.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C7.58 0 4 3.58 4 8C4 13.25 12 22 12 22C12 22 20 13.25 20 8C20 3.58 16.42 0 12 0ZM12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11Z" fill="#D32F2F"/>
        </svg>
      `;

      // Create popup with church information including ONE link (website or Facebook)
      let popupContent = `
        <div class="church-popup">
          <p class="church-popup_name">${church.name}</p>
          <p class="church-popup_address">${church.address}</p>
      `;

      // Add the single link if available
      if (church.linkToUse && church.linkToUse.url) {
        popupContent += `
          <div class="church-popup_links">
            <a href="${church.linkToUse.url}" target="_blank" class="church-popup_link ${church.linkToUse.type}">${church.linkToUse.text}</a>
          </div>
        `;
      }

      popupContent += `</div>`;

      // Create popup with church information
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

      // Create the marker and add it to the map
      try {
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat(church.coordinates)
          .setPopup(popup)
          .addTo(map);

        // Store the marker reference
        markers.push({
          id: church.id,
          marker,
        });

        console.log(
          `Added marker for ${church.name} at [${church.coordinates}]`
        );
      } catch (error) {
        console.error(`Error adding marker for ${church.name}:`, error);
      }
    });
  }

  //////////////////////////////////////////////////////////////
  ///////////////// VIEW ON MAP FUNCTIONALITY //////////////////

  // Function to scroll to map element
  function scrollToMap() {
    mapElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Function to handle "View on Map" button clicks
  function setupViewOnMapButtons() {
    console.log("Setting up view on map buttons");

    viewOnMapBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();

        // Find the corresponding church
        const churchItem = btn.closest(".church-list_item");
        if (!churchItem) {
          console.error("Could not find parent church item");
          return;
        }

        const churchId = Array.from(churchItems).indexOf(churchItem);
        console.log("Church ID:", churchId);

        if (churchId >= 0) {
          const church = churches.find((c) => c.id === churchId);

          if (church) {
            console.log(`Flying to church: ${church.name}`, church.coordinates);

            // First scroll to the map
            scrollToMap();

            // Close any open popups
            closeAllPopups();

            // Short delay to allow smooth scrolling to complete
            setTimeout(() => {
              // Fly to the church location with a more moderate zoom level
              map.flyTo({
                center: church.coordinates,
                zoom: 13, // More moderate zoom level
                essential: true,
              });

              // Find and open the marker popup
              const markerObj = markers.find((m) => m.id === church.id);
              if (markerObj) {
                setTimeout(() => {
                  markerObj.marker.togglePopup();
                }, 800); // Slightly shorter delay for popup
              } else {
                console.error("Could not find marker for church", church.id);
              }
            }, 600); // Delay to allow scroll to complete
          } else {
            console.error("Could not find church data for ID", churchId);
          }
        }
      });
    });
  }

  // Function to close all open popups
  function closeAllPopups() {
    const openPopups = document.querySelectorAll(".mapboxgl-popup");
    openPopups.forEach((popup) => {
      popup.remove();
    });
  }

  //////////////////////////////////////////////////////////////
  /////////////////// INITIALIZE THE MAP ///////////////////////

  // Wait for the map to load before adding markers
  map.on("load", () => {
    console.log("Map loaded");
    collectChurchData();

    // Only proceed if we found churches
    if (churches.length > 0) {
      addMarkersToMap();
      setupViewOnMapButtons();

      // Fit map to show all markers
      try {
        const bounds = new mapboxgl.LngLatBounds();
        churches.forEach((church) => {
          bounds.extend(church.coordinates);
        });

        map.fitBounds(bounds, {
          padding: 50,
          maxZoom: 12, // Limit how far it can zoom in for the overview
        });
        console.log("Map bounds adjusted to show all churches");
      } catch (error) {
        console.error("Error adjusting map bounds:", error);
      }
    } else {
      console.warn("No churches with valid coordinates found");
    }
  });
});

/*code to add into webflor project
<script src="http://localhost:1234/app.js"></script>
*/
