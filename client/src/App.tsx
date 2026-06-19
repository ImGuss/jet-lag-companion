import GameStateProvider from './contexts/GameStateContext'
import Map from './components/Map'

import './App.css'

function App() {

  return (
    <GameStateProvider>
      <section>
        <Map />
      </section>
    </GameStateProvider>
  )
}

export default App
