import { log } from "console"
import { makeId, readJsonFile, writeJsonFile } from "./util.service.js"

const PATH = "./data/bug.json"
const bugs = readJsonFile(PATH)

// console.log("bugs", bugs)

export const bugService = {
  query,
  get,
  remove,
  save,
}

function query(queryOptions = {}) {
  const { filterBy, sortBy, pagination } = queryOptions
  const results = {}
  let returnedBugs = [...bugs]

  if (filterBy.txt) {
    const regExp = new RegExp(filterBy.txt, "i")
    returnedBugs = returnedBugs.filter(
      (bug) => regExp.test(bug.title) || regExp.test(bug.description),
    )
  }

  if (filterBy.severity) {
    returnedBugs = returnedBugs.filter(
      (bug) => bug.severity >= filterBy.severity,
    )
  }
  if (filterBy.labels && filterBy.labels.length > 0) {
    returnedBugs = returnedBugs.filter((bug) =>
      filterBy.labels.some((label) => bug.labels?.includes(label)),
    )
  }

  if (filterBy.ownerId) {
    returnedBugs = returnedBugs.filter(
      (bug) => bug.owner._id === filterBy.ownerId,
    )
  }

  if (sortBy.sortField === "severity" || sortBy.sortField === "createdAt") {
    const { sortField, sortDir } = sortBy
    returnedBugs.sort(
      (bug1, bug2) => (bug1[sortField] - bug2[sortField]) * sortDir,
    )
  } else if (sortBy.sortField === "title") {
    returnedBugs.sort(
      (bug1, bug2) => bug1.title.localeCompare(bug2.title) * sortBy.sortDir,
    )
  }

  if (pagination.pageIdx !== undefined) {
    const { pageIdx, pageSize } = pagination
    const startIdx = pageIdx * pageSize
    const endIdx = pageIdx * pageSize + pageSize
    results.pageCount = Math.ceil(returnedBugs.length / pageSize)
    returnedBugs = returnedBugs.slice(startIdx, endIdx)
  }
  results.bug = returnedBugs
  return Promise.resolve(results)
}

function get(bugId) {
  return new Promise((resolve, reject) => {
    const bug = bugs.find((bug) => bug._id === bugId)

    if (!bug) reject(`Cant find bug with ID ${bugId}`)
    else resolve(bug)
  })
}

function remove(bugId, loggedinUser) {
  const idx = bugs.findIndex((bug) => bug._id === bugId)
  if (idx === -1) return Promise.reject("No such bug.")
  if (!loggedinUser.isAdmin && bugs[idx].owner._id !== loggedinUser._id)
    return Promise.reject("Not the owner of the bug.")

  bugs.splice(idx, 1)
  return _saveBugsToFile()
}

function save(bugToSave, loggedinUser) {
  if (bugToSave._id) {
    const idx = bugs.findIndex((bug) => bug._id === bugToSave._id)

    if (idx === -1) return Promise.reject("No such bug.")
    if (!loggedinUser.isAdmin && bugs[idx].owner._id !== loggedinUser._id)
      return Promise.reject("Not the owner of the bug.")

    bugs[idx] = { ...bugs[idx], ...bugToSave }
  } else {
    bugToSave._id = makeId()
    bugToSave.createdAt = Date.now()
    bugToSave.owner = _extractOwnerDetails(loggedinUser)
    bugs.push(bugToSave)
  }
  return _saveBugsToFile().then(() => bugToSave)
}

function _saveBugsToFile() {
  return writeJsonFile(PATH, bugs)
}

function _extractOwnerDetails(user) {
  const { _id, fullname, isAdmin } = user
  const owner = { _id, fullname, isAdmin }
  if (isAdmin) owner.isAdmin = isAdmin
  return owner
}
