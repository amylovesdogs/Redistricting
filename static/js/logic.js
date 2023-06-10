// Creating the map object
var myMap = L.map('map', {
  center: [38.837912, -104.553735],
  zoom: 10
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// create a layer for each county commission district map
// Only one district map (aka base layer) can be shown at a time so they must be base layers.
var baseMaps = {
};
var mapNames = ['Current', 'Proposal 1', 'Proposal 2'];

// ****************************/
// Function definitions
// ****************************/

// create and return a district map layer described by the mapData, which is geojson
function districtMap (mapData) {
  return L.geoJson(mapData, {
    // Styling each feature
    style: function (feature) {
      return {
        color: 'black',
        fillColor: feature.properties.color,
        fillOpacity: 0.5,
        weight: 1.5
      };
    },
    // This is called on each feature (aka district)
    onEachFeature: function (feature, layer) {
      // Set the mouse events to change the map styling.
      layer.on({
        // When a user's mouse cursor touches a map feature, the mouseover event calls this function, which makes that feature's opacity change to 90% so that it stands out.
        mouseover: function (event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.9
          });
        },
        // When the cursor no longer hovers over a map feature (that is, when the mouseout event occurs), the feature's opacity reverts back to 50%.
        mouseout: function (event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.5
          });
        }
      });
      // Giving each feature a popup with information that's relevant to it
      layer.bindPopup('<h1>County Commission District ' + feature.properties.id + '</h1> <hr> <h2>Population: ' + feature.properties.TotalPop + '</h2>');
    }
  });
}

function updatePanelData (mapName) {
  console.log('In updatePanelData ', mapName);
  // prepare the data to put in the panel
  let data = ['population: XXX,XXX', 'Dems 42.3%', 'Reps: 52.3%'];

  // update the district map panel
  d3.select('#district').text('Map Displayed: ' + mapName);

  // get the district data for the selected district map and display each district
  for (let district = 1; district < 6; district++) {
    let panelID = '#d' + district.toString();
    let panel = d3.select(panelID);

    // remove any existing data in the panel
    panel.selectAll('p').remove();
    // put the data in the panel
    let paragraphs = panel.selectAll('p').data(data).enter().append('p');
    paragraphs.text(function (d) {
      return d;
    });
  }
}

// called then a new base layer (aka district map) is chosen on the map
function onDistrictSelect (e) {
  // set the active layer
  myMap.activeBaseLayer = e.layer;
  console.log('base map changed to ' + e.name);

  // update the panel base on the active layer
  updatePanelData(e.name);
}

// ****************************/
// Main code body
// ****************************/

// Add the precinct boundary GeoJSON layer to the base map
fetch('../../static/data/2020-precincts.geojson')
  .then((response) => response.json())
  .then(function (jsonData) {
      // set the precint json to a variable
    let precinctData = jsonData;
    console.log('Got the precinct info ', precinctData);

    L.geoJson(precinctData, {
      // Styling each precinct
      style: function (feature) {
        return {
          color: 'black',
          fillOpacity: 0,
          weight: 1
        };
      },
      // add a popup to each precinct
      onEachFeature: function (feature, layer) {
        // Giving each feature a popup with information that's relevant to it
        layer.bindPopup('<p>Precinct ' + feature.properties.PRECINCT + '</p>');
      }
    }).addTo(myMap);

    // first, get and add the existing district map
    fetch('../../static/data/2017-cc-districts.geojson')
      .then((response) => response.json())
      .then(function (jsonData) {
        baseMaps[mapNames[0]] = districtMap(jsonData);

        // second, get and add proposal 1 district map (alpha)
        fetch('../../static/data/alpha-cc-districts.geojson')
          .then((response) => response.json())
          .then(function (jsonData) {
            baseMaps[mapNames[1]] = districtMap(jsonData);

            // third, get and add proposal 2 district map (bravo)
            fetch('../../static/data/bravo-cc-districts.geojson')
              .then((response) => response.json())
              .then(function (jsonData) {
                baseMaps[mapNames[2]] = districtMap(jsonData);

                // Next, create a control for our layers and add our district maps to it
                L.control.layers(baseMaps, null).addTo(myMap);

                 // set the active base layer to the current districts
                baseMaps[mapNames[0]].addTo(myMap);
                console.log('About to call');
                updatePanelData['Current'];
                console.log('Set the active layer to ', mapNames[0], baseMaps[mapNames[0]]);

                // set the function to call when the base layer is changed
                myMap.on('baselayerchange', onDistrictSelect);
              });
          });
      });
  });
