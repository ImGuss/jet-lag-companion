import { createContext, useContext } from 'react'
import { useGameState } from '../hooks/useGameState'

import type { ReactNode } from 'react'

type GameStateContextType = ReturnType<typeof useGameState> | null

const GameStateContext = createContext<GameStateContextType>(null)

interface GameStateProviderProps {
  children: ReactNode;
}

const GameStateProvider = (props: GameStateProviderProps) => {
  const value = useGameState()

  return (
    <GameStateContext.Provider value={value}>
      {props.children}
    </GameStateContext.Provider>
  )
}

export const useGameStateContext = () => {
  const context =  useContext(GameStateContext)
  if (context === null) {
    throw new Error('useGameStateContext must be used within a GameStateProvider')
  }

  return context
}

export default GameStateProvider