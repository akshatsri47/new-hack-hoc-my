import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Routes,BrowserRouter,Route} from 'react-router-dom'
import Homepage from './pages/Homepage'
import ProfilePage from './pages/ProfilePage'
function App() {
  return (
    <BrowserRouter>
      
      <Routes>
        <Route path='/home' element={<Homepage/>}/>
        <Route path='/match' element={<ProfilePage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
