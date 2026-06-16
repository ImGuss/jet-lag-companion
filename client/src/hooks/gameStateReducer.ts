import type {
  GameState,
  RadiusMarker,
  EliminatedRegion,
  ActiveCountry
} from '@shared/types'

const initialState: GameState = {
  activeCountry: null,
  eliminatedRegions: [],
  radiusMarkers: []
}

type GameAction =
  | { type: 'SET_ACTIVE_COUNTRY'; payload: ActiveCountry }
  | { type: 'ADD_RADIUS_MARKER'; payload: RadiusMarker }
  | { type: 'REMOVE_RADIUS_MARKER'; payload: { id: string } }
  | { type: 'RESET_GAME_STATE' }

function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_ACTIVE_COUNTRY':
      return { ...state, activeCountry: action.payload, eliminatedRegions: [], radiusMarkers: [] }
    case 'ADD_RADIUS_MARKER':
      // TODO: Computer geo.ts
      return { ...state, radiusMarkers: [...state.radiusMarkers, action.payload] }
    case 'REMOVE_RADIUS_MARKER':
      return {
        ...state,
        radiusMarkers: state.radiusMarkers.filter(marker => marker.id !== action.payload.id),
        eliminatedRegions: state.eliminatedRegions.filter(region => region.sourceMarkerId !== action.payload.id)
      }
    case 'RESET_GAME_STATE':
      return initialState
    default:
      return state
  }
}

export { initialState, gameStateReducer }