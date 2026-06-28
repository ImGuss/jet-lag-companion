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
  const stagedCountriesRef = useRef(stagedCountries)

  // fetches country GeoJSON
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
  
  // creates mapbox instance
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
      container: mapContainerRef.current,
      center: [-71.06776, 42.35816],
      zoom: 2
      // minZoom: 9
    })
    mapRef.current.on('load', () => {
      setIsMapLoaded(true)
    })

    
    return () => {
      mapRef.current.remove()
    }
  }, [])

  // creates countries layer
  useEffect(() => {
    const countryPaint = {
      'fill-color': [
        'case',
        [
          'all',
          ['boolean', ['feature-state', 'selected'], false],
          ['boolean', ['feature-state', 'hover'], false]
        ],
        'rgba(201, 79, 79, 0.65)',

        ['boolean', ['feature-state', 'selected'], false],
        'rgba(232, 131, 58, 0.65)',

        ['boolean', ['feature-state', 'hover'], false],
        'rgba(232, 131, 58, 0.35)',

        'rgba(0,0,0,0)'
      ],
      'fill-opacity': 1
    }

    if (!countries || !isMapLoaded) { return }

    if (!mapRef.current.getSource('all-countries')) {
      mapRef.current.addSource('all-countries', {
        type: 'geojson',
        data: countries,
        promoteId: 'ISO_A3_EH'
      })
    }

    if (!mapRef.current.getLayer('country-filter')) {
      mapRef.current.addLayer({
        id: 'country-filter',
        type:'fill',
        source: 'all-countries',
        layout: {},
        paint: countryPaint as mapboxgl.FillLayerSpecification['paint']
      })
    }
  }, [countries, isMapLoaded, state.activeCountries])

  // sync refs to state
  useEffect(() => {
    selectingCountriesRef.current = state.isSelectingCountries
    addActiveCountryRef.current = addActiveCountry
    stagedCountriesRef.current = stagedCountries
  }, [state.isSelectingCountries, addActiveCountry, stagedCountries])

  // hover and click handler
  useEffect(() => {
    if (!isMapLoaded) { return }

    let hoveredCountryId = null

    mapRef.current.on('mousemove', 'country-filter', (e) => {
      if (hoveredCountryId !== null) {
        mapRef.current.setFeatureState(
          { source: 'all-countries', id: hoveredCountryId },
          { hover: false }
        )
      }

      hoveredCountryId = e.features[0].properties.ISO_A3_EH
      mapRef.current.setFeatureState(
        { source: 'all-countries', id: hoveredCountryId },
        { hover: true }
      )
    })

    mapRef.current.on('mouseleave', 'country-filter', () => {
      if (hoveredCountryId !== null) {
        mapRef.current.setFeatureState(
          { source: 'all-countries', id: hoveredCountryId },
          { hover: false }
        )
      }
    })

    mapRef.current.addInteraction('click-country', {
      type: 'click',
      target: { layerId: 'country-filter' },
      handler: ({ feature }) => {
        if (isPolygonFeature(feature)) {
          const featureState = mapRef.current.getFeatureState({
            id: feature.properties.ISO_A3_EH,
            source: 'all-countries',
            sourceLayer: 'country-filter'
          })

          console.log(featureState.hover)
        }
      }
    })

    return () => {
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