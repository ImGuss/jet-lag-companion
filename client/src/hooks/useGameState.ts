import { useReducer } from 'react'
import { gameStateReducer, initialState } from './gameStateReducer'

import type {
  RadiusMarker,
  ActiveCountry
} from '@shared/types'


export const useGameState = () => {
  const [state, dispatch] = useReducer(gameStateReducer, initialState)

  const setActiveCountry = (activeCountry: ActiveCountry) => dispatch({ type: 'SET_ACTIVE_COUNTRY', payload: activeCountry })

  const addRadiusMarker = (radiusMarker: RadiusMarker) => dispatch({ type: 'ADD_RADIUS_MARKER', payload: radiusMarker })

  const removeRadiusMarker = (markerId: string) => dispatch({ type: 'REMOVE_RADIUS_MARKER', payload: { id: markerId } })

  const resetGameState = () => dispatch({ type: 'RESET_GAME_STATE' })

  return {
    state,
    setActiveCountry,
    addRadiusMarker,
    removeRadiusMarker,
    resetGameState
  }
}