import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

let el = document.getElementById('root')
let rt = ReactDOM.createRoot(el)

rt.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
