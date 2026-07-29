import { useState } from 'react'

import type { ReactNode } from 'react'

import './SidePanel.css'

type SidePanelProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode
}

const SidePanel = (props: SidePanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const { isOpen, onClose, children } = props

  return (
    <>
      <button
        className={`expand-panel-btn ${isCollapsed ? 'collapse' : ''}`}
        onClick={() => setIsCollapsed(false)}
      >
        ^
      </button>
      {/* SIDE PANEL */}
      <div className={`side-panel-bar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapse' : ''}`}>
        <section className="side-panel">
          <button
            onClick={() => setIsCollapsed(true)}
          >
            Button
          </button>
          {children}
        </section>
      </div>
    </>
  )
}

export default SidePanel