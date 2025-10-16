import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { blockMetaMaskInjection } from './utils/metamaskBlocker.js'

// Block MetaMask injection issues
blockMetaMaskInjection()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)