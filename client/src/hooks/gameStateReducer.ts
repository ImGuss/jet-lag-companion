import { unionCountryGeo } from '../lib/geo'

import type {
  GameState,
  RadiusMarker,
  ActiveCountry
} from '@shared/types'

const initialState: GameState = {
  activeCountries: [],
  activeGeometry: null,
  eliminatedRegions: [],
  radiusMarkers: [],
  isSelectingCountries: false
}

type GameAction =
  | { type: 'ADD_ACTIVE_COUNTRIES'; payload: ActiveCountry[] }
  | { type: 'REMOVE_ACTIVE_COUNTRY'; payload: { code: string } }
  | { type: 'ADD_RADIUS_MARKER'; payload: RadiusMarker }
  | { type: 'REMOVE_RADIUS_MARKER'; payload: { id: string } }
  | { type: 'SET_SELECTING_COUNTRIES'; payload: boolean }
  | { type: 'RESET_GAME_STATE' }

function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_ACTIVE_COUNTRIES': {
      const newCountries = action.payload.filter(incoming => (
        !state.activeCountries.some(existing => existing.code === incoming.code)
      ))
      const combinedCountries = [...state.activeCountries, ...newCountries]
      const newGeo = unionCountryGeo(combinedCountries)
      return {
        ...state,
        activeCountries: combinedCountries,
        activeGeometry: newGeo
      }
    }
    case 'REMOVE_ACTIVE_COUNTRY': {
      const filteredCountries = state.activeCountries.filter(c => c.code !== action.payload.code)
      const newGeo = unionCountryGeo(filteredCountries)
      return {
        ...state,
        activeCountries: filteredCountries,
        activeGeometry: newGeo
      }
    }
    case 'ADD_RADIUS_MARKER': {
      // TODO: Computer geo.ts
      return { ...state, radiusMarkers: [...state.radiusMarkers, action.payload] }
    }
    case 'REMOVE_RADIUS_MARKER': {
      return {
        ...state,
        radiusMarkers: state.radiusMarkers.filter(marker => marker.id !== action.payload.id),
        eliminatedRegions: state.eliminatedRegions.filter(region => region.sourceMarkerId !== action.payload.id)
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