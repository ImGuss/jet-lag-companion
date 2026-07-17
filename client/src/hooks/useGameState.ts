import { useReducer } from 'react'
import { gameStateReducer, initialState } from './gameStateReducer'

import type {
  RadiusMarker,
  ActiveCountry,
  BisectorMarker
} from '@shared/types'


export const useGameState = () => {
  const [state, dispatch] = useReducer(gameStateReducer, initialState)

  const addActiveCountries = (activeCountries: ActiveCountry[]) => dispatch({ type: 'ADD_ACTIVE_COUNTRIES', payload: activeCountries })

  const removeActiveCountry = (countryCode: string) => dispatch({ type: 'REMOVE_ACTIVE_COUNTRY', payload: { code: countryCode } })

  const addRadiusMarker = (radiusMarker: RadiusMarker) => dispatch({ type: 'ADD_RADIUS_MARKER', payload: radiusMarker })

  const removeRadiusMarker = (markerId: string) => dispatch({ type: 'REMOVE_RADIUS_MARKER', payload: { id: markerId } })

  const addBisectorMarker = (bisectorMarker: BisectorMarker) => dispatch({ type: 'ADD_BISECTOR_MARKER', payload: bisectorMarker })

  const removeBisectorMarker = (bisectorId: string) => dispatch({ type: 'REMOVE_BISECTOR_MARKER', payload: { id: bisectorId } })

  const setSelectingCountries = (bool: boolean) => dispatch({  type: 'SET_SELECTING_COUNTRIES', payload: bool})

  const resetGameState = () => dispatch({ type: 'RESET_GAME_STATE' })

  return {
    state,
    addActiveCountries,
    removeActiveCountry,
    addRadiusMarker,
    removeRadiusMarker,
    addBisectorMarker,
    removeBisectorMarker,
    setSelectingCountries,
    resetGameState
  }
}