export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia2lsbGlhbmdlbW9ldHMiLCJhIjoiY2xiczhwMG9oMHl0MDN1bXZ2cjBlOWhpNiJ9.1kpBKmU2mRSHDE9jE4GlEA';
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia2lsbGlhbmdlbW9ldHMiLCJhIjoiY2xiczkyYnJlMTFpNjNwa2UwZ2xyYzRociJ9.0Ah6r0O7rKXzUFCA52j_8g';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/killiangemoets/clbsa4sb7002v15pntvkabk6v', // style URL
    //   center: [-118.1, 34.1], // starting position [lng, lat]
    //   zoom: 4, // starting zoom
    //   interactive: false,
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Ad popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
