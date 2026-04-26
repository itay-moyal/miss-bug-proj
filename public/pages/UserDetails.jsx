const { useState, useEffect } = React
const { useParams, useNavigate } = ReactRouterDOM

import { bugService } from "../services/bug.service.js"
import { showErrorMsg } from "../services/event-bus.service.js"
import { userService } from "../services/user.service.front.js"
import { BugList } from "../cmps/BugList.jsx"

export function UserDetails() {
  const [user, setUser] = useState(null)
  const [bugs, setBugs] = useState(null)

  const params = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    loadUser()
    loadBugs()
  }, [params.userId])

  function loadUser() {
    userService
      .getUserById(params.userId)
      .then(setUser)
      .catch((err) => {
        console.log(err)
        showErrorMsg(`Couldn't track user`)
        navigate("/")
      })
  }

  function loadBugs() {
    bugService
      .query({ ownerId: params.userId })
      .then((res) => setBugs(res.bug))
      .catch((err) => showErrorMsg(`Couldn't load bugs - ${err}`))
  }

  function onRemoveBug(bugId) {
    bugService
      .remove(bugId)
      .then(() => {
        const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId)
        setBugs(bugsToUpdate)
        showSuccessMsg("Bug removed")
      })
      .catch((err) => showErrorMsg(`Cannot remove bug`, err))
  }

  function onEditBug(bug) {
    const newSeverity = prompt("New severity?", bug.severity)
    const newDescription = prompt("New description?", bug.description)

    const severity = newSeverity === null ? bug.severity : +newSeverity
    const description =
      newDescription === null || newDescription === undefined
        ? bug.description
        : newDescription
    console.log(description)

    if (description === bug.description && severity === bug.severity) return

    const bugToSave = { ...bug, severity, description }

    bugService
      .save(bugToSave)
      .then((savedBug) => {
        const bugsToUpdate = bugs.map((currBug) =>
          currBug._id === savedBug._id ? savedBug : currBug,
        )

        setBugs(bugsToUpdate)
        showSuccessMsg("Bug updated")
      })
      .catch((err) => showErrorMsg("Cannot update bug", err))
  }

  function onBack() {
    navigate("/")
  }

  if (!user) return <div className="loader">Loading...</div>
  console.log("bugs", bugs)

  return (
    <section className="user-details">
      <h1>Full name : {user.fullname}</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>

      {bugs && (
        <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
      )}
      <button onClick={onBack}>Back</button>
    </section>
  )
}
