import { useState } from 'react'

import GameStateProvider from './contexts/GameStateContext'

import Map from './components/Map'
import BottomSheet from './components/BottomSheet'
import SidePanel from './components/SidePanel'

import './App.css'

function App() {
  const [center, setCenter] = useState<[number, number] | null>(null)
  const [radius, setRadius] = useState<number | null>(null)
  const [isPlacing, setIsPlacing] = useState(false)

  return (
    <GameStateProvider>
      <section>
        <Map
          radiusPreview={{
            center,
            radius,
            isPlacing,
            setCenter,
            setRadius,
            setIsPlacing
          }}
        />
        <BottomSheet />
        <SidePanel
          isOpen={true}
          onClose={() => console.log('closing')}
        >
          <p>Children</p>
        </SidePanel>
      </section>
    </GameStateProvider>
  )
}

export default App
