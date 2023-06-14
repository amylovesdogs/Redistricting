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
let mapNames = ['Current', 'Proposal 1', 'Proposal 2'];
let viewNames = ['Population', 'Demographics', 'Political Competitiveness'];

// set up the default views
let currentData = viewNames[0];
let currentMap = mapNames[0];

// glbal variables for chart rendering
var chartHandles = [];
var firstDraw = true;

const bgColors = [
  'rgba(255, 99, 132, 0.2)',
  'rgba(255, 159, 64, 0.2)',
  'rgba(255, 205, 86, 0.2)',
  'rgba(75, 192, 192, 0.2)',
  'rgba(54, 162, 235, 0.2)',
  'rgba(153, 102, 255, 0.2)',
  'rgba(201, 203, 207, 0.2)'
];

const borderColors = [
  'rgb(255, 99, 132)',
  'rgb(255, 159, 64)',
  'rgb(255, 205, 86)',
  'rgb(75, 192, 192)',
  'rgb(54, 162, 235)',
  'rgb(153, 102, 255)',
  'rgb(201, 203, 207)'
];

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
      layer.bindPopup('<h2>County Commission District ' + feature.properties.id + '</h2> <hr> <h3>Population: ' + feature.properties.TotalPop + '</h3>');
    }
  });
}

// render the population data section for a given district
function renderPopulation (ctx, textID, d, districtNo) {
  // text based data
  let panel = d3.select(textID);
  let popText = [`District Population Deviation %:  ${d['PopDevPct']}`];
  // remove any existing data in the panel
  panel.selectAll('p').remove();
  // put the data in the panel
  let paragraphs = panel.selectAll('p').data(popText).enter().append('p');
  paragraphs.text(function (d) {
    return d;
  });

  // chart data
  const labels = ['Total Population', 'Voting Age Population'];
  const data = {
    labels: labels,
    datasets: [{
      label: 'Population',
      data: [d['TotalPop'], d['TotalVAP']],
      backgroundColor: [
        bgColors[0],
        bgColors[1],
        bgColors[2]
      ],
      borderColor: [
        borderColors[0],
        borderColors[1],
        borderColors[2]
      ],
      borderWidth: 1
    }]
  };

  let myChart = new Chart(ctx,
    {
      type: 'bar',
      data: data,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  if (firstDraw) {
    chartHandles.push(myChart);
  } else {
    chartHandles[districtNo] = myChart;
  }
}

// render the demographics data section for a given district
function renderDemographics (ctx, textID, d, districtNo) {
  // text based data
  let panel = d3.select(textID);
  let popText = [`Minority %:  ${d['MinorityPct']}`];
  // remove any existing data in the panel
  panel.selectAll('p').remove();
  // put the data in the panel
  let paragraphs = panel.selectAll('p').data(popText).enter().append('p');
  paragraphs.text(function (d) {
    return d;
  });

  // chart data
  const labels = ['Asian', 'African American', 'Native American', 'Hispanic', 'Pacific Islander', 'White'];
  const data = {
    labels: labels,
    datasets: [{
      label: 'Population',
      data: [d['AsianPct'], d['BlackPct'], d['NativePct'], d['HispanicPct'], d['PacificPct'], d['WhitePct']],
      backgroundColor: [
        bgColors[0],
        bgColors[1],
        bgColors[2],
        bgColors[3],
        bgColors[4],
        bgColors[5]
      ],
      borderColor: [
        borderColors[0],
        borderColors[1],
        borderColors[2],
        borderColors[3],
        borderColors[4],
        borderColors[5]
      ],
      hoverOffset: 4
    }]
  };

  let myChart = new Chart(ctx,
    {
      type: 'pie',
      data: data
    });
  if (firstDraw) {
    chartHandles.push(myChart);
  } else {
    chartHandles[districtNo] = myChart;
  }
}

// render the political competitiveness data section for a given district
function renderCompetitive (ctx, textID, d, districtNo) {
  // text based data

  // remove any existing data in the panel
  let panel = d3.select(textID);
  panel.selectAll('p').remove();

  // chart data
  const labels = ['2022 Generic Vote Dem', '2022 Generic Vote Rep', 'PVI Dem', 'PVI Rep', 'Registered Dem', 'Registered Rep'];
  const data = {
    labels: labels,
    datasets: [{
      label: 'Political Competiveness',
      data: [d['2022 DEM'], d['2022 REP'], d['PVI DEM'], d['PVI REP'], d['DemPct'], d['RepPct']],
      backgroundColor: [
        bgColors[0],
        bgColors[1],
        bgColors[2],
        bgColors[3],
        bgColors[4],
        bgColors[5]
      ],
      borderColor: [
        borderColors[0],
        borderColors[1],
        borderColors[2],
        borderColors[3],
        borderColors[4],
        borderColors[5]
      ],
      borderWidth: 1
    }]
  };

  let myChart = new Chart(ctx,
    {
      type: 'bar',
      data: data,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  if (firstDraw) {
    chartHandles.push(myChart);
  } else {
    chartHandles[districtNo] = myChart;
  }
}

function renderChart (ctx, textID, districtData, districtNo) {
  if (!firstDraw) {
    chartHandles[districtNo].destroy();
  }
  switch (currentData) {
    case 'Population':
      renderPopulation(ctx, textID, districtData, districtNo);
      break;
    case 'Demographics':
      renderDemographics(ctx, textID, districtData, districtNo);
      break;
    case 'Political Competitiveness':
      renderCompetitive(ctx, textID, districtData, districtNo);
  }
}

function updatePanelData (mapName, optionSelected) {
  // update the view panel
  let panel = d3.select('#current-view');
  let viewElements = [];
  viewElements.push(`Viewing map: ${currentMap}`);
  viewElements.push(`Viewing data: ${currentData}`);
  // remove any existing data in the panel
  panel.selectAll('p').remove();
  // put the data in the panel
  let paragraphs = panel.selectAll('p').data(viewElements).enter().append('p');
  paragraphs.text(function (d) {
    return d;
  });

  // fetch the data to put in the district panels
  // set the flask route
  var myRoute = ccInfoRoute;
  switch (mapName) {
    case 'Current':
      myRoute = ccInfoRoute;
      break;
    case 'Proposal 1':
      myRoute = alphaInfoRoute;
      break;
    case 'Proposal 2':
      myRoute = bravoInfoRoute;
  }
  d3.json(flaskAppURL + myRoute).then(function (jsonData) {
    // set the district json to a variable
    let districtInfo = jsonData;

    // get the district data for the selected district map and display each district

    for (let i = 0; i < districtInfo.length; i++) {
      let districtNo = i + 1;
      let panelID = '#d' + (districtNo).toString();
      let chartID = 'd' + (districtNo).toString() + 'Chart';
      let textID = panelID + 'Text';
      let panel = d3.select(panelID);
      var ctx = document.getElementById(chartID);
      for (let key in districtInfo[i]) {
        let endText = key.slice(-3);
        if (endText == 'Pct') {
          districtInfo[i][key] = districtInfo[i][key].toFixed(2);
        }
      }

      renderChart(ctx, textID, districtInfo[i], i);
    }
    firstDraw = false;
  });
}

// called then a new base layer (aka district map) is chosen on the map
function onDistrictSelect (e) {
  // set the active layer
  myMap.activeBaseLayer = e.layer;
  currentMap = e.name;

  // update the panel base on the active layer
  updatePanelData(currentMap, currentData);
}

// optionChanged is called a data type is selected from the drop down menu
function optionChanged (value) {
  currentData = value;
  updatePanelData(currentMap, currentData);
}

// ****************************/
// Main code body
// ****************************/

// Add the precinct boundary GeoJSON layer to the base map
const flaskAppURL = 'http://127.0.0.1:5000/api/v1.0';
const precinctRoute = '/district-lines/precincts';
const ccRoute = '/district-lines/cc';
const alphaRoute = '/district-lines/alpha';
const bravoRoute = '/district-lines/bravo';
const ccInfoRoute = '/district-info/cc';
const alphaInfoRoute = '/district-info/alpha';
const bravoInfoRoute = '/district-info/bravo';

// get the precinct line geojson and add it to the map
d3.json(flaskAppURL + precinctRoute).then(function (jsonData) {
  // set the precint json to a variable
  let precinctData = jsonData;

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

  // add the 3 county commission districts maps to the existing map
  // these 3 district maps are mutually exclusive and as such are
  // added as base maps to be selected from

  // first, get and add the existing county commissioner district map
  d3.json(flaskAppURL + ccRoute).then(function (jsonData) {
    baseMaps[mapNames[0]] = districtMap(jsonData);

    // second, get and add proposal 1 county commissioner district map (alpha)
    d3.json(flaskAppURL + alphaRoute).then(function (jsonData) {
      baseMaps[mapNames[1]] = districtMap(jsonData);

      // third, get and add proposal 2 county commissioner map (bravo)
      d3.json(flaskAppURL + bravoRoute).then(function (jsonData) {
        baseMaps[mapNames[2]] = districtMap(jsonData);

        // Next, create a control for our layers and add our district maps to it
        L.control.layers(baseMaps, null).addTo(myMap);

        // set the active base layer to the current district map
        baseMaps[mapNames[0]].addTo(myMap);

        // create a drop-down menu of the test subjects in the HTML
        let dropDown = d3.select('#selDataset');
        let options = dropDown.selectAll('option').data(viewNames).enter().append('option');
        options.text(function (d) {
          return d;
        }).attr('value', function (d) {
          return d;
        });

        updatePanelData(currentMap, currentData);

        // set the function to call when the base layer is changed
        myMap.on('baselayerchange', onDistrictSelect);
      });
    });
  });
});
