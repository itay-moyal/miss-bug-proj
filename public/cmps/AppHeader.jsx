import { authService } from "../services/auth.service.front.js"
import { showSuccessMsg, showErrorMsg } from "../services/event-bus.service.js"
import { UserMsg } from "./UserMsg.jsx"

const { NavLink, Link } = ReactRouterDOM
const { useNavigate } = ReactRouter

export function AppHeader({ loggedinUser, setLoggedinUser }) {
  const naviage = useNavigate()

  function onLogout() {
    authService
      .logout()
      .then(() => {
        setLoggedinUser(null)
        naviage("/auth")
      })
      .catch((err) => {
        console.log(err)
        showErrorMsg(`Couldn't Logout,Try again!`)
      })
  }
  return (
    <header className="app-header main-content single-row">
      <h1>Miss Bug</h1>
      <nav className="app-header-nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/bug">Bugs</NavLink>
        <NavLink to="/about">About</NavLink>
        {!loggedinUser ? (
          <NavLink to="/auth">Login</NavLink>
        ) : (
          <div className="user">
            <Link to={`/user/${loggedinUser._id}`}>
              {loggedinUser.fullname}
            </Link>
            <button onClick={onLogout}>Logout</button>
          </div>
        )}
      </nav>
      {/* <UserMsg /> */}
    </header>
  )
}
