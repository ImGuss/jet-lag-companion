import GameStateProvider from './contexts/GameStateContext'

import Map from './components/Map'
import BottomSheet from './components/BottomSheet'

import './App.css'

function App() {

  return (
    <GameStateProvider>
      <section>
        <Map />
        <BottomSheet />
      </section>
    </GameStateProvider>
  )
}

export default App
