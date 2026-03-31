import { makeId, readJsonFile, writeJsonFile } from "./util.service.js"

const PATH = "./data/bug.json"
const bugs = readJsonFile(PATH)
console.log("bugs", bugs)

export const bugService = {
  query,
  get,
  remove,
  save,
}

function query() {
  return Promise.resolve(bugs)
}

function get(bugId) {
  return new Promise((resolve, reject) => {
    const bug = bugs.find((bug) => bug._id === bugId)

    if (!bug) reject(`Cant find bug with ID ${bugId}`)
    else resolve(bug)
  })
}

function remove(bugId) {
  const idx = bugs.findIndex((bug) => bug._id === bugId)
  if (idx === -1) return Promise.reject(`Cant find bug with ID ${bugId}`)

  bugs.splice(idx, 1)
  return _saveBugsToFile()
}

function save(bugToSave) {
  if (bugToSave._id) {
    const idx = bugs.findIndex((bug) => bug._id === bugToSave._id)
    bugs[idx] = { ...bugs[idx], ...bugToSave }
  } else {
    bugToSave._id = makeId()
    bugs.push(bugToSave)
  }
}

function _saveBugsToFile() {
  return writeJsonFile(PATH, bugs)
}
