import { useRef, useEffect, useState } from 'react'
import { useGameStateContext } from '../contexts/GameStateContext'
import mapboxgl from 'mapbox-gl'

import type { Feature, Polygon, MultiPolygon, Geometry, FeatureCollection } from 'geojson'

import 'mapbox-gl/dist/mapbox-gl.css'
import './Map.css'

function isPolygonFeature(feature: Feature<Geometry>): feature is Feature<Polygon | MultiPolygon> {
  return feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon'
}

const Map = () => {
  const [countries, setCountries] = useState<FeatureCollection | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  
  const { state, addActiveCountry } = useGameStateContext()
  
  const selectingCountriesRef = useRef(state.isSelectingCountries)
  const addActiveCountryRef = useRef(addActiveCountry)

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
          filter: ['!', ['in', ['get', 'ISO_A3_EH'], ['literal', state.activeCountries.map(country => country.code)]]]
        })
      } else {
        mapRef.current.setFilter(
          'country-filter',
          ['!', ['in', ['get', 'ISO_A3_EH'], ['literal', state.activeCountries.map(country => country.code)]]]
        )
      }

      //      ------- placeholder for now until i get user input setup --------- v
      const feature = countries?.features.find(f => f.properties.ISO_A3_EH === 'USA')
      
      if (state.activeCountries.length === 0 && feature && isPolygonFeature(feature)) {
        addActiveCountry({ code: 'USA', geometry: feature })
      }
  }, [countries, isMapLoaded, state.activeCountries])

  useEffect(() => {
    selectingCountriesRef.current = state.isSelectingCountries
    addActiveCountryRef.current = addActiveCountry
  }, [state.isSelectingCountries, addActiveCountry])

  useEffect(() => {
    const hoverPaint = {
      'fill-color': 'red',
      'opacity': '0.5'
    }
    if (selectingCountriesRef) {
      mapRef.current.on('mouseenter', 'all-countries', () => {
        mapRef.current.addLayer({
          id: 'country-hover',
          type: 'fill',
          source: 'all-countries',
          paint: hoverPaint
        })
      })

      mapRef.current.addInteraction('country-select', {
        type: 'click',
        target: {layerId: 'country-filter'},
        handler: e => console.log(e)
      })
    }

    return () => {
      mapRef.current.removeInteraction('country-select')
    }
  }, [isMapLoaded])


  return (
    <>
      <div id="map-container" ref={mapContainerRef}/>
    </>
  )
}

export default Map