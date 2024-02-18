import React from 'react'
import { MapContainer, TileLayer, useMap, Marker, Popup, Polygon, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {statesData, exampleData} from '../jsonData/fitingSample.js'
const MapGL = () => {
    // const position = statesData.features[0].geometry.coordinates[0][0]
    const position = [exampleData[0].node.lat, exampleData[0].node.lon]
    
    const purpleOptions = (d) => {return ({ 
      fillColor: getColor(d),
      weight: 2, 
      opacity:1, 
      fillOpacity:1,
      dashArray:3,
      color:'white'
    
    }) }
    
    function getColor(d) {
      return d > 1000 ? '#800026' :
             d > 500  ? '#BD0026' :
             d > 200  ? '#E31A1C' :
             d > 100  ? '#FC4E2A' :
             d > 50   ? '#FD8D3C' :
             d > 20   ? '#FEB24C' :
             d > 10   ? '#FED976' :
                        '#FFEDA0';
  }

  // let statevizeLatLon = exampleData.filter((item, index) => )
  let all_cords = [];
  {exampleData.map((data) => {
    const coordinates = [data.node.lat, data.node.lon];
    all_cords.push(coordinates)
  })}

  return (
    <MapContainer style={{ width:'95vw', height:'95vh', margin:'auto' }} center={position} zoom={5} scrollWheelZoom={true}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

{}

    {exampleData.map((data) => {
      const points = [data.node.lat, data.node.lon]

      return (
        <CircleMarker radius="5"  center={points} >
      <Popup>
        NAME: {data.node.node_name}<br/>
        LAT: {data.node.lat}<br/>
        LON: {data.node.lon}<br/>
        STAT: {data.stat}<br/>
      </Popup>
        </CircleMarker>
      )
    })}



        <Polygon
        positions={all_cords}
        pathOptions={{fillColor: 'purple'}}
        />
    
  </MapContainer>
  )
}

export default MapGL