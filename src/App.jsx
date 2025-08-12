import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ReservoirTracker from './components/ReservoirTracker'
import Waves from './components/ui/Waves'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <ReservoirTracker />
     
    </>
  )
}

export default App
