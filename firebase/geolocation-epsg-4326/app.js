/***************************************************
 * Please note that I’m sharing the credential here.
 * Feel free to use it while you’re learning.
 * After that, use your own credential.
 * Doing so, others can have the same advantage and
 * learn as quick as you learned too.
 * Thanks in advance!!!
***************************************************/

// Based on: http://jsfiddle.net/api/post/library/pure/

var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
});

var map = new ol.Map({
  layers: [raster],
  target: 'map',
  view: new ol.View({
    center: ol.proj.transform([-4891439.528367551, -2261957.9822148103], 'EPSG:3857', 'EPSG:4326'),
    zoom: 14,
    projection: 'EPSG:4326'
  })
});

var features = new ol.Collection();
var featureOverlay = new ol.layer.Vector({
  source: new ol.source.Vector({features: features}),
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      //color: '#ffcc33',
      color: '#ff0000',
      width: 2
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        //color: '#ffcc33'
        color: '#ff0000'
      })
    })
  })
});
featureOverlay.setMap(map);

var modify = new ol.interaction.Modify({
  features: features,
  // the SHIFT key must be pressed to delete vertices, so
  // that new vertices can be drawn at the same position
  // of existing vertices
  deleteCondition: function(event) {
    return ol.events.condition.shiftKeyOnly(event) &&
        ol.events.condition.singleClick(event);
  }
});
modify.on('modifyend', function (event) {
  console.log('=======');
  var features = event.features;
  var allDrawnFeatures = features.getArray();
  var lastFeature = allDrawnFeatures.reverse().slice(0, 1)[0];
  var geometry = lastFeature.getGeometry();
  var coordinates = geometry.getCoordinates();
  console.log(coordinates);
  saveGeometry(null, coordinates);
  console.log('=======');
});
map.addInteraction(modify);

var draw; // global so we can remove it later
var typeSelect = document.getElementById('type');

function addInteraction() {
  draw = new ol.interaction.Draw({
    features: features,
    type: /** @type {ol.geom.GeometryType} */ (typeSelect.value)
  });
  console.log('---------------')
  draw.on('drawend', function (event) {
    console.log('++++++++');
    var geometry =  event.feature.getGeometry();
    var coordinates = geometry.getCoordinates();
    console.log(coordinates);
    saveGeometry(null, coordinates);
    // Clear the old features. The old points. The idea is to keep only one point. One equipment must be in one point at a time
    features.clear();
    console.log('++++++++');
  });
  map.addInteraction(draw);
}


/**
 * Handle change event.
 */
typeSelect.onchange = function() {
  map.removeInteraction(draw);
  addInteraction();
};

addInteraction();


/******************************************************
 All code below is related to DBaaS:
 - https://firebase.google.com/docs/web/setup
 - https://firebase.google.com/docs/database/web/start
 ******************************************************/

// Initialize Firebase
const config = {
  apiKey: "AIzaSyAp-CLeimcXe59hvyNqpL66R0TQUyyoNjo",
  authDomain: "talk2016-9079a.firebaseapp.com",
  databaseURL: "https://talk2016-9079a.firebaseio.com",
  storageBucket: "talk2016-9079a.appspot.com",
};
const firebaseRef = firebase.initializeApp(config);
const database = firebase.database();

// MAP all the different kind of OpenLayers geometries
var GEOMETRIES = {
  Point: ol.geom.Point,
  LineString: ol.geom.LineString,
  Polygon: ol.geom.Polygon
}

// function to draw a geometry on the map based on DBaaS response
var drawGeometry = function (response) {
  var data = response;
  var GeometryType = GEOMETRIES[data.type];
  if (!data) {
    return;
  }

  features.clear();
  features.push(new ol.Feature({
    geometry: new GeometryType(data.geometry)
  }));
}

// fetch the geometry we alreaday have saved
// https://firebase.google.com/docs/database/web/retrieve-data
database.ref('mylocation_in_EPSG4326').on('value', function(snapshot) {
  const value = snapshot.val();
  if (value) {
    drawGeometry(value);
  } else {
    features.clear();
  }
});

// function to save a geometry whenever it be updated
var saveGeometry = function (type, geometry) {
  database.ref("mylocation_in_EPSG4326").set({
    type: type || typeSelect.value,
    geometry: geometry
  })
}

/***************************************
 Below is sample data to play with DBaaS 
 ***************************************/

/*
features.push(new ol.Feature({
  geometry: new ol.geom.Point([-4891439.528367551, -2261957.9822148103])
}))
*/

/*
features.push(new ol.Feature({
  geometry: new ol.geom.LineString([
    [-4892132.238936385, -2262125.1882141843],
    [-4891578.070481318, -2261418.1457025465],
    [-4890851.9187126085, -2261876.7678722576]
  ])
}))
*/

/*
features.push(new ol.Feature({
  geometry: new ol.geom.LineString([
    [-4891563.738538515, -2261900.6544435965],
    [-4891353.536710731, -2261661.7887302055],
    [-4891086.007111733, -2262015.3099860246],
    [-4891563.738538515, -2261900.6544435965]
  ])
}))
*/
