import { useReducer } from 'react'
import { gameStateReducer, initialState } from './gameStateReducer'

import type {
  RadiusMarker,
  ActiveCountry
} from '@shared/types'


export const useGameState = () => {
  const [state, dispatch] = useReducer(gameStateReducer, initialState)

  const addActiveCountry = (activeCountry: ActiveCountry) => dispatch({ type: 'ADD_ACTIVE_COUNTRY', payload: activeCountry })

  const removeActiveCountry = (countryCode: string) => dispatch({ type: 'REMOVE_ACTIVE_COUNTRY', payload: { code: countryCode } })

  const addRadiusMarker = (radiusMarker: RadiusMarker) => dispatch({ type: 'ADD_RADIUS_MARKER', payload: radiusMarker })

  const removeRadiusMarker = (markerId: string) => dispatch({ type: 'REMOVE_RADIUS_MARKER', payload: { id: markerId } })

  const setSelectingCountries = (bool: boolean) => dispatch({  type: 'SET_SELECTING_COUNTRIES', payload: bool})

  const resetGameState = () => dispatch({ type: 'RESET_GAME_STATE' })

  return {
    state,
    addActiveCountry,
    removeActiveCountry,
    addRadiusMarker,
    removeRadiusMarker,
    setSelectingCountries,
    resetGameState
  }
}