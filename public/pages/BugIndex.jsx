const { useState, useEffect, useRef } = React

import { bugService } from "../services/bug.service.js"
import { showSuccessMsg, showErrorMsg } from "../services/event-bus.service.js"

import { BugFilter } from "../cmps/BugFilter.jsx"
import { BugList } from "../cmps/BugList.jsx"
import { debounce } from "../services/util.service.js"
import { Pagination } from "../cmps/pagination.jsx"
import { authService } from "../services/auth.service.front.js"

export function BugIndex() {
  const loggedinUser = authService.getLoggedinUser()
  const [bugs, setBugs] = useState(null)
  const [pageCount, setPageCount] = useState()
  const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())

  const debouncedSetFilterBy = useRef(debounce(setFilterBy, 400)).current

  useEffect(loadBugs, [filterBy])

  function loadBugs() {
    bugService
      .query(filterBy)
      .then((res) => {
        // console.log(res)
        setBugs(res.bug)
        setPageCount(res.pageCount)
      })
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

  function onAddBug() {
    const bug = {
      title: prompt("Bug title?", "Bug " + Date.now()),
      severity: +prompt("Bug severity?", 3),
      description: prompt("Describe the bug"),
    }

    bugService
      .save(bug)
      .then((savedBug) => {
        setBugs([...bugs, savedBug])
        showSuccessMsg("Bug added")
      })
      .catch((err) => showErrorMsg(`Cannot add bug`, err))
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

  function onSetFilterBy(filterBy) {
    setFilterBy((prevFilter) => ({ ...prevFilter, ...filterBy }))
  }

  return (
    <section className="bug-index main-content">
      <header>
        <h2>Bug List</h2>
        {loggedinUser && <button onClick={onAddBug}>Add Bug</button>}
      </header>

      <BugFilter filterBy={filterBy} onSetFilterBy={debouncedSetFilterBy} />

      <BugList
        bugs={bugs}
        onRemoveBug={onRemoveBug}
        onEditBug={onEditBug}
        loggedinUser={loggedinUser}
      />

      <Pagination
        pageCount={pageCount}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
      />
    </section>
  )
}
