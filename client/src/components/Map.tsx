import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'

import type { GeoJSON } from 'geojson'

import 'mapbox-gl/dist/mapbox-gl.css'
import './Map.css'

const Map = () => {
  const [countries, setCountries] = useState<GeoJSON | null>(null)
  // const [activeCountryCode, setActiveCountryCode] = useState<string | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/data/world-countries.geojson')

        if (!res.ok) {
          throw new Error('Error fetching geojson data')
        }

        const countryData = await res.json()

        setCountries(countryData)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])
  
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
      container: mapContainerRef.current,
      center: [-71.06776, 42.35816],
      zoom: 9
      // minZoom: 9
    })
    mapRef.current.on('load', () => {
      setIsMapLoaded(true)
    })

    
    return () => {
      mapRef.current.remove()
    }
  }, [])

  useEffect(() => {
    const outOfBoundsPaint = {
      'fill-color': '#000',
      'fill-opacity': 0.5
    }

    if (!countries || !isMapLoaded) { return }

    if (!mapRef.current.getSource('all-countries')) {
        mapRef.current.addSource('all-countries', {
          type: 'geojson',
          data: countries
        })
      }

      if (!mapRef.current.getLayer('country-filter')) {
        mapRef.current.addLayer({
          id: 'country-filter',
          type:'fill',
          source: 'all-countries',
          layout: {},
          paint: outOfBoundsPaint,
          filter: ['!=', ['get', 'ISO_A3_EH'], 'USA']
        })
      }
  }, [countries, isMapLoaded])


  return (
    <>
      <div id="map-container" ref={mapContainerRef}/>
    </>
  )
}

export default Map