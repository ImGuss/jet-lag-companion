import {
  buildCircle,
  deriveActiveGeometry,
  validateRadiusMarker,
  validateElimArea,
  radiusElimination,
  buildBisectedPoly,
  bisectorElimination
} from '../lib/geo'

import type {
  GameState,
  RadiusMarker,
  BisectorMarker,
  ActiveCountry,
  EliminatedRegion
} from '@shared/types'

const initialState: GameState = {
  activeCountries: [],
  activeGeometry: null,
  eliminatedRegions: [],
  radiusMarkers: [],
  bisectorMarkers: [],
  isSelectingCountries: false
}

type GameAction =
  | { type: 'ADD_ACTIVE_COUNTRIES'; payload: ActiveCountry[] }
  | { type: 'REMOVE_ACTIVE_COUNTRY'; payload: { code: string } }
  | { type: 'ADD_RADIUS_MARKER'; payload: RadiusMarker }
  | { type: 'REMOVE_RADIUS_MARKER'; payload: { id: string } }
  | { type: 'ADD_BISECTOR_MARKER'; payload: BisectorMarker }
  | { type: 'REMOVE_BISECTOR_MARKER'; payload: { id: string } }
  | { type: 'SET_SELECTING_COUNTRIES'; payload: boolean }
  | { type: 'RESET_GAME_STATE' }

function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_ACTIVE_COUNTRIES': {
      const newCountries = action.payload.filter(incoming => (
        !state.activeCountries.some(existing => existing.code === incoming.code)
      ))
      const combinedCountries = [...state.activeCountries, ...newCountries]
      const newGeo = deriveActiveGeometry({
        activeCountries: combinedCountries,
        eliminatedRegions: state.eliminatedRegions
      })
      return {
        ...state,
        activeCountries: combinedCountries,
        activeGeometry: newGeo
      }
    }
    case 'REMOVE_ACTIVE_COUNTRY': {
      const filteredCountries = state.activeCountries.filter(c => c.code !== action.payload.code)
      const newGeo = deriveActiveGeometry({
        activeCountries: filteredCountries,
        eliminatedRegions: state.eliminatedRegions
      })
      return {
        ...state,
        activeCountries: filteredCountries,
        activeGeometry: newGeo
      }
    }
    case 'ADD_RADIUS_MARKER': {
      const { center, radius, withinRadius } = action.payload
      
      const radiusMarkerId = crypto.randomUUID()
      const circle = buildCircle({center: center, radius: radius})

      const isValid = validateRadiusMarker({
        circleFeature: circle,
        activeGeometry: state.activeGeometry,
        withinRadius: withinRadius
      })

      if (!isValid.ok) {
        // return some sort of error
        return state
      }

      const newRegionGeo = radiusElimination({
        circleFeature: circle,
        activeGeometry: state.activeGeometry!,
        withinRadius: withinRadius
      })

      const newRegion: EliminatedRegion = {
        id: crypto.randomUUID(),
        geometry: newRegionGeo,
        sourceMarkerType: 'radius',
        sourceMarkerId: radiusMarkerId
      }

      const newRadiusMarker: RadiusMarker = {
        id: radiusMarkerId,
        center: center,
        radius: radius,
        withinRadius: withinRadius
      }
      const newEliminatedRegions = [...state.eliminatedRegions, newRegion]
      const newActiveGeo = deriveActiveGeometry({
        activeCountries: state.activeCountries,
        eliminatedRegions: newEliminatedRegions
      })
      
      return {
        ...state,
        activeGeometry: newActiveGeo,
        eliminatedRegions: newEliminatedRegions,
        radiusMarkers: [...state.radiusMarkers, newRadiusMarker]
      }
    }
    case 'REMOVE_RADIUS_MARKER': {
      const newEliminatedRegions = state.eliminatedRegions.filter(region => region.sourceMarkerId !== action.payload.id || region.sourceMarkerType !== 'radius')

      const newActiveGeo = deriveActiveGeometry({
        activeCountries: state.activeCountries,
        eliminatedRegions: newEliminatedRegions
      })
      return {
        ...state,
        radiusMarkers: state.radiusMarkers.filter(marker => marker.id !== action.payload.id),
        eliminatedRegions: newEliminatedRegions,
        activeGeometry: newActiveGeo
      }
    }
    case 'ADD_BISECTOR_MARKER': {
      const { startPoint, endPoint, isCloserToEnd } = action.payload

      if (!state.activeGeometry) {
        // return some error
        return state
      }

      const bisectorMarkerId = crypto.randomUUID()
      const bisectedPoly = buildBisectedPoly({
        startPoint: startPoint,
        endPoint: endPoint,
        isCloserToEnd: isCloserToEnd,
        activeGeometry: state.activeGeometry
      })

      const isValid = validateElimArea({
        elimFeature: bisectedPoly,
        activeGeometry: state.activeGeometry
      })

      if (!isValid.ok) {
        // return error
        return state
      }

      const newRegionGeo = bisectorElimination({
        elimFeature: bisectedPoly,
        activeGeometry: state.activeGeometry
      })

      const newRegion: EliminatedRegion = {
        id: crypto.randomUUID(),
        geometry: newRegionGeo,
        sourceMarkerType: 'bisector',
        sourceMarkerId: bisectorMarkerId
      }

      const newBisectorMarker: BisectorMarker = {
        id: bisectorMarkerId,
        startPoint: startPoint,
        endPoint: endPoint,
        isCloserToEnd: isCloserToEnd
      }

      const newEliminatedRegions = [...state.eliminatedRegions, newRegion]
      const newActiveGeo = deriveActiveGeometry({
        activeCountries: state.activeCountries,
        eliminatedRegions: newEliminatedRegions
      })

      return {
        ...state,
        activeGeometry: newActiveGeo,
        eliminatedRegions: newEliminatedRegions,
        bisectorMarkers: [...state.bisectorMarkers, newBisectorMarker]
      }
    }
    case 'REMOVE_BISECTOR_MARKER': {
      const newEliminatedRegions = state.eliminatedRegions.filter(region => region.sourceMarkerId !== action.payload.id || region.sourceMarkerType !== 'bisector')

      const newActiveGeo = deriveActiveGeometry({
        activeCountries: state.activeCountries,
        eliminatedRegions: newEliminatedRegions
      })
      return {
        ...state,
        bisectorMarkers: state.bisectorMarkers.filter(marker => marker.id !== action.payload.id),
        eliminatedRegions: newEliminatedRegions,
        activeGeometry: newActiveGeo
      }
    }
    case 'SET_SELECTING_COUNTRIES': {
      return { ...state, isSelectingCountries: action.payload }
    }
    case 'RESET_GAME_STATE': {
      return initialState
    }
    default: {
      return state
    }
  }
}

export { initialState, gameStateReducer }