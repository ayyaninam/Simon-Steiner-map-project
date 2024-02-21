import React, {useEffect, useRef} from 'react'
import ReactDOMServer from 'react-dom/server';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { exampleData, statesData } from '../jsonData/fitingSample';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Map = () => {
  // these states will allowed to see on map
    const show_states = ["Alaska","Arizona","California","Colorado","Hawaii","Idaho","Montana","Nevada","New Mexico","Oregon","Utah","Washington","Wyoming"];
    // change this to change gradient levels to your own demand

    const gradient =  {
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
  }
// values I was using before

  //     const gradient = {
  //     0.0: 'green',
  //     0.5: 'yellow',
  //     1.0: 'red'
  // }
    // center position
    const position = [exampleData[0].node.lat, exampleData[0].node.lon]
    // changing mui to string because leaflet accept only html
    const LocationOnIconString = ReactDOMServer.renderToString(<LocationOnIcon style={{fill:'black'}} />);
    // icon specs 
    const myIcon = L.divIcon({
    html: LocationOnIconString,
    iconSize: [30, 30],
    });
    // set this to restrict the map view
    let maxBounds = [];
    // restricting map to not crose states mentioned above in show states
    statesData.features.map((data) => {
      if (show_states.includes(data.properties.name)){
        for (let j of data.geometry.coordinates[0]){
          maxBounds.push([j[1], j[0]]);
        };
      };
    });

    // var map;
    let map = useRef(null);

    useEffect(() => {
        map = L.map("map", {'maxBounds': maxBounds}).setView(position, 5);
        
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        map.on('click', addMarker);


        let minVal = 0;
        let maxVal = 0;

        exampleData.map((data) => {
            if (minVal<parseFloat(data.stat)){minVal=parseFloat(data.stat)}
            if (maxVal>parseFloat(data.stat)){maxVal=parseFloat(data.stat)}
        })

        const points = exampleData
          ? exampleData.map((data) => {
              return [data.node.lat, data.node.lon, (parseFloat(data.stat) - minVal) / (maxVal - minVal)];
            })
          : [];

        L.heatLayer(points,{radius:25, max:maxVal, blur:35, gradient:gradient }).addTo(map);

        L.control.scale().addTo(map);

        return () => map.remove();

      }, []);

      function location_changer(e) {
        e = e.split(',')
        var latLon = L.latLng(e[0], e[1]);
        var bounds = latLon.toBounds(3000); // Change this line to make Zoom in more or less
        map.panTo(latLon).fitBounds(bounds);
        return () => map.remove();
      }

      function addMarker(e){
        return new L.marker(e.latlng, {draggable:'true', icon:myIcon}).addTo(map).on('click', e => e.target.remove());
    }


      return (<div>
        <label htmlFor="location_choice">Choose a Custom Location:</label>
        <select onChange={(e) => location_changer(e.target.value)} style={{padding:'10px', margin:'10px'}} id="location_choice" name="location_choice">
            {exampleData&&exampleData.map((data) => {
                return(
            <option value={`${data.node.lat},${data.node.lon}`}>{data.node.node_name}</option>
                )
            })}
        </select>

        <div  id="map" style={{height:'95vh', width:'95vw'}}>
      </div>
      </div>
      );
}

export default Map




  