import React from 'react'
import './Orders.css'
import { useState } from 'react'
import axios from 'axios';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { assets } from '../../assets/assets'

const Orders = ({ url, token }) => {
  const [orders, setOrders] = useState([])

  const statusHandler = async (event, orderId) => {
    const response = await axios.post(url+"/api/order/status",{
      orderId,
      status: event.target.value
    }, {headers:{token}})
    if(response.data.success){
      toast.success(response.data.message)
      await fetchAllOrders();
    }
    else{
      toast.error(response.data.message)
    }
  }

  const fetchAllOrders = async () => {
    const response = await axios.post(`${url}/api/order/list`,{}, {headers:{token}})
    if (response.data.success) {
      setOrders(response.data.data)
    }
    else {
      toast.error(response.data.message)
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [])

  return (
    <div className='order add'>
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.toReversed().map((order, index) => {
          return (
            <div className="order-item" key={index}>
              <img src={assets.parcel_icon} alt="" />
              <div>
                <p className='order-item-food'>
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return item.name + " X " + item.quantity
                    }
                    else {
                      return item.name + " X " + item.quantity + ", "
                    }
                  })}
                </p>
                <p className='order-item-name'>
                  {order.address.firstName+" "+order.address.lastName}
                </p>
                <div className='order-item-address'>
                  <p>{order.address.street+", "}</p>
                  <p>{order.address.city+", "+order.address.state+", "+order.address.country+", "+order.address.zipcode}</p>
                </div>
                <p className='order-item-phone'>{order.address.phone}</p>
              </div>
              <p>Item : {order.items.length}</p>
              <p>${order.amount}.00</p>
              <select onChange={(event)=>statusHandler(event, order._id)} value={order.status}>
                <option value="Food Processing">Food Processing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Orders