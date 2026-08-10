import React, { useEffect, useState } from 'react'
import NavBar from './components/NavBar/NavBar'
import SideBar from './components/SideBar/SideBar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Login from './components/Login/Login'
import axios from 'axios'

// Notification
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"
  const [token, setToken] = useState("")
  const [logged, setLogged] = useState(false)

  useEffect(()=>{
    if(localStorage.getItem("token")){
      setToken(localStorage.getItem("token"));
      validateToken(localStorage.getItem("token"));
    }
  },[])

  useEffect(()=>{
    validateToken(localStorage.getItem("token"));
  },[setLogged])

  const validateToken = async (token) => {
    const response = await axios.post(url+"/api/validate",{},{headers:{token}})

    if(response.data.success){
      setLogged(true);
    }
    else{
      setLogged(false);
      setToken("");
      localStorage.removeItem("token");
    }
  }

  return (
    <div>
      <ToastContainer />

      {!logged?
      <Login setToken={setToken} setLogged={setLogged} url={url} />:
      <div>
      <NavBar setToken={setToken} setLogged={setLogged} />
      <hr />
      <div className="app-content">
        <SideBar />

        <Routes>
          <Route path='/add' element={<Add url={url} token={token} />} />
          <Route path='/list' element={<List url={url} token={token} />} />
          <Route path='/' element={<Orders url={url} token={token} />} />
        </Routes>
      </div>
      </div>
      }
      
    </div>
  )
}

export default App