import type {
  GameState,
  RadiusMarker,
  ActiveCountry
} from '@shared/types'

const initialState: GameState = {
  activeCountries: [],
  eliminatedRegions: [],
  radiusMarkers: [],
  isSelectingCountries: false
}

type GameAction =
  | { type: 'ADD_ACTIVE_COUNTRY'; payload: ActiveCountry }
  | { type: 'REMOVE_ACTIVE_COUNTRY'; payload: { code: string } }
  | { type: 'ADD_RADIUS_MARKER'; payload: RadiusMarker }
  | { type: 'REMOVE_RADIUS_MARKER'; payload: { id: string } }
  | { type: 'SET_SELECTING_COUNTRIES'; payload: boolean }
  | { type: 'RESET_GAME_STATE' }

function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_ACTIVE_COUNTRY':
      if (state.activeCountries.find(country => country.code === action.payload.code)) {
        return state
      }
      return { ...state, activeCountries: [...state.activeCountries, action.payload] }
    case 'REMOVE_ACTIVE_COUNTRY':
      return {
        ...state,
        activeCountries: state.activeCountries.filter(country => country.code !== action.payload.code)
      }
    case 'ADD_RADIUS_MARKER':
      // TODO: Computer geo.ts
      return { ...state, radiusMarkers: [...state.radiusMarkers, action.payload] }
    case 'REMOVE_RADIUS_MARKER':
      return {
        ...state,
        radiusMarkers: state.radiusMarkers.filter(marker => marker.id !== action.payload.id),
        eliminatedRegions: state.eliminatedRegions.filter(region => region.sourceMarkerId !== action.payload.id)
      }
    case 'SET_SELECTING_COUNTRIES':
      return { ...state, isSelectingCountries: action.payload }
    case 'RESET_GAME_STATE':
      return initialState
    default:
      return state
  }
}

export { initialState, gameStateReducer }