import { useState } from 'react'
import './App.css'
import DocumentSubmissionForm from './Components/Documentsubmissionform'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <DocumentSubmissionForm/>
    </>
  )
}

export default App
