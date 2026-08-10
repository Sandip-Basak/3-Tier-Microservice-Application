import React, { useState } from 'react'
import './Login.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = ({ setToken, setLogged, url }) => {
  const [data, setData] = useState({
    email: "",
    password: ""
  })
  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }

  const onLogin = async (event) => {
    event.preventDefault();
    let newURL = url;
    newURL += "/api/user/adminlogin"
    const response = await axios.post(newURL, data);

    if (response.data.success) {
      setToken(response.data.token)
      localStorage.setItem("token", response.data.token)
      setLogged(true)
    }
    else {
      toast.error(response.data.message)
    }
  }

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className='login-popup-container'>
        <div className="login-popup-title">
          <h2>Login</h2>
        </div>
        <div className="login-popup-inputs">
          <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Enter your Email' required />
          <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required />
        </div>
        <button type='submit'>Login</button>
      </form>
    </div>
  )
}

export default Login