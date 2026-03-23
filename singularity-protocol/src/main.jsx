import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'
import './styles/scroll-reveal.css'
import './styles/modal.css'
import './styles/mode.css'
/* cursor.css    — imported inside CustomCursor.jsx */
/* hud.css       — imported inside HUD.jsx          */
/* control-panel.css — imported inside ControlPanel.jsx */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)