import { utilService } from "./util.service.js"

const STORAGE_KEY = "bugs"
const BASE_URL = "/api/bug/"
_createBugs()

export const bugService = {
  query,
  getById,
  save,
  remove,
  getDefaultFilter,
}

function query(filterBy) {
  return axios
    .get(BASE_URL)
    .then((res) => res.data)
    .then((bugs) => {
      if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, "i")
        bugs = bugs.filter((bug) => regExp.test(bug.title))
      }

      if (filterBy.minSeverity) {
        bugs = bugs.filter((bug) => bug.severity >= filterBy.minSeverity)
      }

      return bugs
    })
}

function getById(bugId) {
  return axios.get(BASE_URL + bugId)
  .then(res => res.data)
}

function remove(bugId) {
  return axios.get(BASE_URL + bugId + "/remove")
}

function save(bug) {
  const queryStr = `save?title=${bug.title}&description=${bug.description}&severity=${bug.severity}&_id=${bug._id}`
  console.log(bug)
  return axios.get(BASE_URL + queryStr).then((res) => res.data)
}

function _createBugs() {
  let bugs = utilService.loadFromStorage(STORAGE_KEY)
  if (bugs && bugs.length > 0) return

  bugs = [
    {
      title: "Infinite Loop Detected",
      severity: 4,
      _id: "1NF1N1T3",
    },
    {
      title: "Keyboard Not Found",
      severity: 3,
      _id: "K3YB0RD",
    },
    {
      title: "404 Coffee Not Found",
      severity: 2,
      _id: "C0FF33",
    },
    {
      title: "Unexpected Response",
      severity: 1,
      _id: "G0053",
    },
  ]
  utilService.saveToStorage(STORAGE_KEY, bugs)
}

function getDefaultFilter() {
  return { txt: "", minSeverity: 0 }
}
