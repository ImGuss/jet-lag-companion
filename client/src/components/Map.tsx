import { useRef, useEffect, useState } from 'react'
import { useGameStateContext } from '../contexts/GameStateContext'
import mapboxgl from 'mapbox-gl'

import { Check } from 'lucide-react'

import type { Feature, Polygon, MultiPolygon, Geometry, FeatureCollection } from 'geojson'

import type { ActiveCountry } from '@shared/types'

import 'mapbox-gl/dist/mapbox-gl.css'
import './Map.css'

function isPolygonFeature(feature: Feature<Geometry>): feature is Feature<Polygon | MultiPolygon> {
  return feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon'
}

const Map = () => {
  const [countries, setCountries] = useState<FeatureCollection | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [stagedCountries, setStagedCountries] = useState<ActiveCountry[]>([])

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
    if (!isMapLoaded) { return }

    const hoverPaint = {
      'fill-color': '#E8833A',
      'opacity': '0.2'
    }

    const stagedPaint = {
      'fill-color': '#E8833A',
      'opacity': '0.5'
    }

    if (!mapRef.current.getLayer('country-hover')) {
      mapRef.current.addLayer({
        id: 'country-hover',
        type: 'fill',
        source: 'all-countries',
        paint: hoverPaint,
        filter: ['==', ['get', 'ISO_A3_EH'], '']
      })
    }

    if (!mapRef.current.getLayer('staged-countries')) {
      mapRef.current.addLayer({
        id: 'staged-countries',
        type: 'fill',
        source: 'all-countries',
        paint: stagedPaint,
        filter: ['in', ['get', 'ISO_A3_EH'], ['literal', stagedCountries.map(c => c.code)]]
      })
    }

    let hoveredCountryId = null

    mapRef.current.addInteraction('country-mouse-move', {
      type: 'mousemove',
      target: {layerId: 'country-filter'},
      handler: ({ feature }) => {
        if (selectingCountriesRef.current) {
          if (feature.properties.ISO_A3_EH !== hoveredCountryId) {
            hoveredCountryId = feature.properties.ISO_A3_EH
            mapRef.current.setFilter('country-hover', ['==', ['get', 'ISO_A3_EH'], hoveredCountryId])
          }
        }
      }
    })

    // necessary in order for mouseleave to work
    mapRef.current.addInteraction('country-mouse-enter', {
      type: 'mouseenter',
      target: { layerId: 'country-hover' },
      handler: () => {}
    })

    mapRef.current.addInteraction('country-mouse-leave', {
      type: 'mouseleave',
      target: { layerId: 'country-hover' },
      handler: () => {
        mapRef.current.setFilter('country-hover', ['==', ['get', 'ISO_A3_EH'], ''])
        hoveredCountryId = null
      }
    })

    mapRef.current.addInteraction('click-country', {
      type: 'click',
      target: { layerId: 'country-filter' },
      handler: ({ feature }) => {
        if (isPolygonFeature(feature)) {
          const country: ActiveCountry = {
            code: feature.properties.ISO_A3_EH,
            geometry: feature
          }
          setStagedCountries(prev => [...prev, country])
        }
      }
    })

    return () => {
      mapRef.current.removeInteraction('country-mouse-move')
      mapRef.current.removeInteraction('country-mouse-enter')
      mapRef.current.removeInteraction('country-mouse-leave')
      mapRef.current.removeInteraction('click-country')
    }
  }, [isMapLoaded])


  return (
    <>
      <div className={`confirm-bar ${state.isSelectingCountries ? 'selecting' : ''}`}>
        <button className="confirm-btn">
          <span className="confirm-count">{stagedCountries.length}</span>
          <span className="confirm-label">Confirm Selection</span>
          <span className="confirm-check"><Check size="0.9rem" /></span>
        </button>
      </div>

      <div id="map-container" ref={mapContainerRef}/>
    </>
  )
}

export default Map