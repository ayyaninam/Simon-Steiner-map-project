import React, { useEffect, useRef } from 'react'
import ReactDOMServer from 'react-dom/server';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import "leaflet-boundary-canvas";
import { exampleData, statesData } from '../jsonData/fitingSample';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Map = () => {
  // these states will allowed to see on map
  const show_states = ["Alaska", "Arizona", "California", "Colorado", "Hawaii", "Idaho", "Montana", "Nevada", "New Mexico", "Oregon", "Utah", "Washington", "Wyoming"];
  // change this to change gradient levels to your own demand

  const gradient = {
    0.0: '#e6194b',
    0.1: '#3cb44b',
    0.2: '#ffe119',
    0.3: '#4363d8',
    0.4: '#f58231',
    0.5: '#911eb4',
    0.6: '#46f0f0',
    0.7: '#f032e6',
    0.8: '#bcf60c',
    0.9: '#fabebe',
    1.0: '#4363d8'
  };

  // for updating the value in dict 

  // values I was using before

  //     const gradient = {
  //     0.0: 'green',
  //     0.5: 'yellow',
  //     1.0: 'red'
  // }

  // center position

  // changing mui to string because leaflet accept only html
  const LocationOnIconString = ReactDOMServer.renderToString(<LocationOnIcon style={{ fill: 'black' }} />);
  // icon specs 
  const myIcon = L.divIcon({
    html: LocationOnIconString,
    iconSize: [30, 30],
  });
  // set this to restrict the map view
  let maxBounds = {
    "type": "FeatureCollection", "features": statesData.features.filter((data) => show_states.includes(data.properties.name))
  };

  const california = maxBounds.features.filter((data) => data.properties.name == "California")

  const position = [california[0].geometry.coordinates[0][0][1], california[0].geometry.coordinates[0][0][0]]


  // var map;
  let map = useRef(null);

  useEffect(() => {

    // map = L.map("map", {maxBounds:[maxBounds.features.map((data) => {return data.geometry.coordinates[0].map((data) => {return [data[1], data[0]]})})],maxZoom: 18,minZoom: 5,}).setView(position, 5)
    map = L.map("map", { minZoom: 3, zoom: 1 }).setView(position, 13)
    // L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    //   attribution:
    //     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(map);
    map.on('click', addMarker);

    // Boundary for Restricting the map 
    const osm = new L.TileLayer.BoundaryCanvas(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        boundary: maxBounds && maxBounds,
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, UK shape <a href="https://github.com/johan/world.geo.json">johan/word.geo.json</a>'
      }
    );
    // applying boundaries
    map.addLayer(osm);
    const countryLayer = L.geoJSON(maxBounds && maxBounds);
    map.fitBounds(countryLayer.getBounds());


    let minVal = 0;
    let maxVal = 0;


    const points = exampleData
      ? exampleData.map((data) => {
        if (parseFloat(data.stat) < minVal) { minVal = parseFloat(data.stat) }
        if (parseFloat(data.stat) > maxVal) { maxVal = parseFloat(data.stat) }
        return [data.node.lat, data.node.lon, data.stat];
      })
      : [];

    L.heatLayer(points, { radius: 25, max: minVal, blur: 30, gradient: gradient }).addTo(map);
    L.control.scale().addTo(map);

    // adding legend here 
    const legend = L.control({ position: 'topright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'legend');
      const grades = Object.keys(gradient).sort();
      const labels = [];

      // Generate labels for legend based on gradient colors
      for (let i = 0; i < grades.length; i++) {
        const startValue = parseFloat(grades[i]) * (maxVal - minVal) + minVal;
        const endValue = parseFloat(grades[i + 1]) * (maxVal - minVal) + minVal;
        const label = `${startValue.toFixed(2)}-${endValue?endValue.toFixed(2):'  +'}`;
        const circleColor = gradient[grades[i]];

        labels.push(
          '<span class="legend-circle" style="border-radius:10px;background-color:' + circleColor + '">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> ' + `<span style="background-color:white;border:1px solid grey; border-radius:10px; padding:0px 10px;">${label}</span>`
        );
      }

      div.innerHTML = labels.join('<br>');
      return div;
    };

    legend.addTo(map);



    // legend in the map code

    return () => map.remove();

  }, []);

  function location_changer(e) {
    e = e.split(',')
    var latLon = L.latLng(e[0], e[1]);
    var bounds = latLon.toBounds(3000); // Change this line to make Zoom in more or less
    map.panTo(latLon).fitBounds(bounds);
    return new L.marker({ 'lat': e[0], 'lon': e[1] }, { draggable: 'true', icon: myIcon }).addTo(map).on('click', e => e.target.remove());
  }

  function addMarker(e) {
    return new L.marker(e.latlng, { draggable: 'true', icon: myIcon }).addTo(map).on('click', e => e.target.remove());
  }


  return (<div>
    <label htmlFor="location_choice">Choose a Custom Location:</label>
    <select onChange={(e) => location_changer(e.target.value)} style={{ padding: '10px', margin: '10px' }} id="location_choice" name="location_choice">
      {exampleData && exampleData.map((data) => {
        return (
          <option key={`${data.node.lat},${data.node.lon}`} value={`${data.node.lat},${data.node.lon}`}>{data.node.node_name}</option>
        )
      })}
    </select>

    <div id="map" style={{ height: '95vh', width: '95vw' }}>
    </div>
  </div>
  );
}

export default Map




