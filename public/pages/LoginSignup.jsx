const { useState } = React
const { useNavigate } = ReactRouter

import { authService } from "../services/auth.service.front.js"
import { userService } from "../services/user.service.front.js"

import { showSuccessMsg, showErrorMsg } from "../services/event-bus.service.js"
import { UserMsg } from "../cmps/UserMsg.jsx"

export function LoginSignup({ setLoggedinUser }) {
  const [credentials, setCredentials] = useState(
    userService.getEmptyCredentials(),
  )
  const [isSignup, setIsSignup] = useState(false)

  const navigate = useNavigate()

  function handleChange({ target }) {
    const { name: field, value } = target
    setCredentials((prevCreds) => ({
      ...prevCreds,
      [field]: value,
    }))
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    isSignup ? signup(credentials) : login(credentials)
  }

  function login(credentials) {
    authService
      .login(credentials)
      .then((user) => {
        setLoggedinUser(user)
        showSuccessMsg("Logged in successfully")
        navigate("/bug")
      })
      .catch((err) => {
        console.log(err)
        showErrorMsg(`Couldn't Login,Try again!`)
      })
  }

  function signup(credentials) {
    authService
      .signup(credentials)
      .then((user) => {
        setLoggedinUser(user)
        showSuccessMsg("Signup in successfully")
        navigate("/bug")
      })
      .catch((err) => {
        console.log(err)
        showErrorMsg(`Couldn't Signup,Try again!`)
      })
  }
  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={credentials.username}
          placeholder="Username"
          onChange={handleChange}
          required
          autoFocus
        />
        <input
          type="password"
          name="password"
          value={credentials.password}
          placeholder="Password"
          onChange={handleChange}
          required
          autoComplete="off"
        />
        {isSignup && (
          <input
            type="text"
            name="fullname"
            value={credentials.fullname}
            placeholder="Fullname"
            onChange={handleChange}
            required
          />
        )}
        <button>{isSignup ? "Signup" : "Login"}</button>
        <div className="login-auth">
          <a href="#" onClick={() => setIsSignup(!isSignup)}>
            {isSignup
              ? "Already a member? Login!"
              : "New user? Signup over here!"}
          </a>
        </div>
      </form>
    </div>
  )
}
