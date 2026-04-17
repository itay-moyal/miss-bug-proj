import { makeId, readJsonFile, writeJsonFile } from "./util.service.js"

const PATH = "./data/user.json"
const users = readJsonFile(PATH)

// console.log(users)

export const userService = {
  query,
  getUserById,
  getByUsername,
  remove,
  add,
}

function query() {
  const usersToReturn = users.map((user) => ({
    _id: user._id,
    fullname: user.fullname,
  }))

  return Promise.resolve(usersToReturn)
}

function getUserById(userId) {
  return new Promise((resolve, reject) => {
    const user = users.find((user) => user._id === userId)
    if (!user) return reject("User not found!")
    user = { ...user }
    delete user.password
    resolve(user)
  })
}

function getByUsername(username) {
  const user = users.find((user) => user.username === username)
  return Promise.resolve(user)
}

function remove(userId) {
  users = users.filter((user) => user._id !== userId)
}

function add(user) {
  return getByUsername(user.username).then((existingUser) => {
    if (existingUser) return Promise.reject("Username Already Taken!")

    user._id = makeId()
    users.push(user)

    return _saveUsersToFile().then(() => {
      user = { ...user }
      delete user.password
      return user
    })
  })
}

function _saveUsersToFile() {
  return writeJsonFile(PATH, users)
}
