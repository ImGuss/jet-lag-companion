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

      </button>
      {/* SIDE PANEL */}
      <section
        className={`side-panel ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapse' : ''}`}
      >
        {children}
      </section>
    </>
  )
}

export default SidePanel