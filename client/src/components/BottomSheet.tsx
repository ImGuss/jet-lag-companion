import { useState } from 'react'
import { useGameStateContext } from '../contexts/GameStateContext'

import { ChevronUp, ChevronDown, Minus } from 'lucide-react'

import './BottomSheet.css'

interface AccordionToggle {
  isSetupOpen: boolean;
  isToolsOpen: boolean;
  isHistoryOpen: boolean;
}

const BottomSheet = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isImperial, setIsImperial] = useState(false)
  const [accordionToggle, setAccordionToggle] = useState<AccordionToggle>({
    isSetupOpen: true,
    isToolsOpen: false,
    isHistoryOpen: false
  })

  const { state } = useGameStateContext()

  const toggleSheet = () => {
    setIsOpen(prevIsOpen => !prevIsOpen)
  }

  const toggleAccordion = (section: keyof AccordionToggle) => {
    setAccordionToggle(prev => ({...prev, [section]: !prev[section]}))
  }

  const renderActiveCountries = state.activeCountries.map(country => {
    return (
      <span key={country.code}>{country.geometry.properties.NAME}</span>
    )
  })

  return (
    <>
    {/* TOGGLE BUTTON */}
      <button
        className="sheet-btn"
        onClick={toggleSheet}
      >
        <ChevronUp
          className={`sheet-arrow ${isOpen ? 'open' : ''}`}
        />
      </button>

      {/* SHEET */}
      <section className={`sheet ${isOpen ? 'open' : ''}`}>
        <span className="sheet-handle">
          <Minus size="3rem" />
        </span>
        <div className="sheet-content">

          {/* GAME SETUP */}
          <div className="accordion-section">
            <button
              className="accordion-header"
              onClick={() => toggleAccordion('isSetupOpen')}
            >
              <span className="accordion-title">
                Game Setup
              </span>
              <ChevronDown
                className={`accordion-arrow ${accordionToggle.isSetupOpen ? 'open' : ''}`}
              />
            </button>
            <div className={`accordion-body ${accordionToggle.isSetupOpen ? 'expanded' : ''}`}>
              <div className="setup-container">
                <div className="field-label">Countries in Play</div>
                <div className="country-display">
                  {
                    state.activeCountries.length > 0 ?
                    renderActiveCountries :
                    <span>No country chosen yet.</span>
                  }
                  <button className="change-btn">Change</button>
                </div>

                <div className="field-label">Units</div>
                <div className="unit-toggle">
                  <button
                    className={`unit-btn ${isImperial ? 'active' : ''}`}
                    onClick={() => setIsImperial(true)}
                  >
                    Miles
                  </button>
                  <button
                    className={`unit-btn ${!isImperial ? 'active' : ''}`}
                    onClick={() => setIsImperial(false)}
                  >
                    Kilometers
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TOOLS */}
          <div className="accordion-section">
            <button
              className="accordion-header"
              onClick={() => toggleAccordion('isToolsOpen')}
            >
              <span className="accordion-title">
                Elimination Tools
              </span>
              <ChevronDown
                className={`accordion-arrow ${accordionToggle.isToolsOpen ? 'open' : ''}`}
              />
            </button>
            <div
              className={`accordion-body ${accordionToggle.isToolsOpen ? 'expanded' : ''}`}
            >
              <div className="tools-container">
                <div className="field-label">Tools</div>
                <div className="tools-grid">
                  <button className="tool-btn">
                    Circle
                    <span>Inside or outside radius</span>
                    </button>
                  <button className="tool-btn">
                    Half Plane
                    <span>One side of a line</span>
                    </button>
                  <button className="tool-btn">
                    Coast Line
                    <span>Distance from coast</span>
                    </button>
                  <button className="tool-btn">
                    Station Zone
                    <span>Pick a station</span>
                    </button>
                </div>
              </div>
            </div>
          </div>

          {/* HISTORY */}
          <div className="accordion-section">
            <button
              className="accordion-header"
              onClick={() => toggleAccordion('isHistoryOpen')}
            >
              <span className="accordion-title">
                History
              </span>
              <ChevronDown
                className={`accordion-arrow ${accordionToggle.isHistoryOpen ? 'open' : ''}`}
              />
            </button>
            <div
              className={`accordion-body ${accordionToggle.isHistoryOpen ? 'expanded' : ''}`}
            >
              history
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default BottomSheet