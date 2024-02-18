import React, {useEffect, useRef} from 'react'
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { exampleData } from '../jsonData/fitingSample';

const Map = () => {
    const position = [exampleData[0].node.lat, exampleData[0].node.lon]
    const myIcon = L.icon({
      iconUrl: require('../static/images/plus.png'),
      iconSize: [10, 10],
  });

    // var map;
    let map = useRef(null);
    useEffect(() => {
        map = L.map("map").setView(position, 5);
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

        L.heatLayer(points,{radius:25, max:maxVal, blur:35}).addTo(map);
        L.control.scale().addTo(map);
        return () => map.remove();

      }, []);

      function location_changer(e) {
        e = e.split(',')
        var latLon = L.latLng(e[0], e[1]);
        var bounds = latLon.toBounds(1500); // 500 = metres
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




  