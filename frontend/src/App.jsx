import './App.css'
import { useState } from 'react'
function App() {
  const [evenements, setEvenements] = useState([]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100">
      <h1 className="text-4xl font-bold text-pink-600">
        Bonjour Tailwind
      </h1>
    </div>
  )
}


export default App
