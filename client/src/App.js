import React, { useState, useEffect } from "react";
import { SERVER_URL } from "./config";
import "whatwg-fetch";
import Login from "./Login";

export default function App() {
  const [ message, setMessage ] = useState('');
  const [ data, setData ] = useState([]);

  async function fetchData() {
    const token = localStorage.getItem('token');

    if (token && !data.length) {
      const response = await fetch(SERVER_URL + 'api/animal', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }).catch(error => {
        console.error("Catching api/animal", error)
      });
      console.log(response)
      const responseData = await response.json();
      console.log(responseData)
      setData(responseData);
      setMessage("You are logged in!");
    } 
  }

  function handleRemoveToken() {
    localStorage.removeItem('token');

    setMessage('Please log in.')
    setData([]);
  }

  useEffect(() => {
    fetchData();
  }, [message]);
  
  return (
    <div className="container">
      <Login setMessage={setMessage}/>
      <div className="section">{message}</div>
      <div className="section"> 
      {data.map(item => JSON.stringify(item))}
      </div>
      <button onClick={handleRemoveToken}>Remove token from localStorage</button>
    </div>
  );
}
