import React, { useState } from "react";
import { SERVER_URL } from "./config";

const USERNAME = 'username';
const PASSWORD = 'password';

export default function Login({ setMessage }) {
  const [ username, setUsername] = useState('');
  const [ password, setPassword ] = useState('');

  const handleChange = (event) => {
    if (event.target.name === USERNAME) {
      setUsername(event.target.value);
    }

    if (event.target.name === PASSWORD) {
      setPassword(event.target.value);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch(SERVER_URL + "api/login", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password
      }),
    }).catch(error => {
      console.error("Catching: ", error)
    });;
    const { access_token } = await response.json();

    localStorage.setItem('token', access_token);

    setUsername('');
    setPassword('');
    setMessage("You are logged in!");
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username:
        <input
          type="text"
          name="username"
          value={username}
          onChange={handleChange}
        />
      </label>
      <label>
        Password:
        <input
          type="text"
          name="password"
          value={password}
          onChange={handleChange}
        />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}
