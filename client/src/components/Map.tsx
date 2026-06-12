import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import { circle } from '@turf/turf'
import 'mapbox-gl/dist/mapbox-gl.css'

import './Map.css'

const Map = () => {
  const mapRef = useRef(null)
  const mapContainerRef = useRef(null)


  useEffect(() => {
    const center = [-71.06776, 42.35816]
    const radius = 10
    const options = { steps: 64 }

    const newCircle = circle(center, radius, options)

    mapRef.current = new mapboxgl.Map({
      accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
      container: mapContainerRef.current,
      center: [-71.06776, 42.35816],
      zoom: 9,
      minZoom: 9
    })

    mapRef.current.on('style.load', () => {
      if (!mapRef.current.getSource('new-circle')) {
        mapRef.current.addSource('new-circle', {
          type: 'geojson',
          data: newCircle
        })
      }

      if (!mapRef.current.getLayer('circle-fill')) {
        mapRef.current.addLayer({
          id: 'circle-fill',
          type: 'fill',
          source: 'new-circle',
          layout: {},
          paint: {
            'fill-color': '#000',
            'fill-opacity': 0.5
          }
        })
      }
    })

    
    return () => {
      mapRef.current.remove()
    }
  }, [])


  return (
    <>
      <div id="map-container" ref={mapContainerRef}/>
    </>
  )
}

export default Map