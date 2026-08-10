import React from 'react'
import './NavBar.css'
import { assets } from '../../assets/assets'

const NavBar = ({setToken, setLogged}) => {

  const logout = () => {
    localStorage.removeItem("token")
    setToken("")
    setLogged(false)
  }

  return (
    <div className='navbar'>
      <img className='logo' src={assets.logo} alt='' />
      <div className="navbar-profile">
        <img className='profile' src={assets.profile_image} alt='' />
        <ul className='nav-profile-dropdown'>
          <li onClick={logout} ><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
        </ul>
      </div>
    </div>
  )
}

export default NavBar