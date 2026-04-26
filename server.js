import express from "express"
import path from "path"
import cookieParser from "cookie-parser"
import { bugService } from "./services/bug.service.js"
import { loggerService } from "./services/logger.service.js"
import { userService } from "./services/user.service.js"
import { authService } from "./services/authService.js"

//TODO : Only the bug's creator can DELETE/UPDATE a bug.

const app = express()
app.use(express.static("public"))
app.use(cookieParser())
app.use(express.json())

// Support Arrays in query Params (req.query)
app.set("query parser", "extended")

// BUGS REST API

app.get("/api/bug", (req, res) => {
  const queryOptions = parseQueryParams(req.query)
  bugService
    .query(queryOptions)
    .then((bugs) => res.send(bugs))
    .catch((err) => {
      loggerService.error(err)
      res.status(404).send("Can't get bugs")
    })
})

app.get("/api/bug/:bugId", (req, res) => {
  const { bugId } = req.params
  const { visitCountMap = [] } = req.cookies
  console.log(visitCountMap)

  if (visitCountMap.length === 3 && !visitCountMap.includes(bugId)) {
    return res.status(401).send("Wait for a bit")
  }
  if (!visitCountMap.includes(bugId)) visitCountMap.push(bugId)
  res.cookie("visitCountMap", visitCountMap, { maxAge: 1000 * 7 })

  bugService
    .get(bugId)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error(err)
      res.status(404).send("Can't find bug")
    })
})

app.put("/api/bug/:bugId", (req, res) => {
  const loggedinUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedinUser) return res.status(401).send("Unauthenticated!")

  const { _id, title, description, severity, labels, owner } = req.body
  if (!_id || !title || severity === undefined)
    return res.status(400).send("Missing required fields")
  const bugToSave = {
    _id,
    title,
    description,
    severity,
    labels: labels || [],
    owner: loggedinUser,
  }

  for (const key in bugToSave) {
    if (!bugToSave[key]) delete bugToSave[key]
  }

  bugService
    .save(bugToSave, loggedinUser)
    .then((savedBug) => res.send(savedBug))
    .catch((err) => {
      loggerService.error(err)
      res.status(404).send("Can't save bug")
    })
})

app.post("/api/bug", (req, res) => {
  const loggedinUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedinUser) return res.status(401).send("Unauthenticated!")

  const { title, description, severity, labels } = req.body
  if (!title || severity === undefined)
    return res.status(400).send("Missing required fields")
  const bugToSave = {
    title,
    description,
    severity: +severity || 1,
    lables: labels || [],
  }

  for (const key in bugToSave) {
    if (!bugToSave[key]) delete bugToSave[key]
  }

  bugService
    .save(bugToSave, loggedinUser)
    .then((savedBug) => res.send(savedBug))
    .catch((err) => {
      loggerService.error(err)
      res.status(404).send("Can't save bug")
    })
})

app.delete("/api/bug/:bugId", (req, res) => {
  const loggedinUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedinUser) return res.status(401).send("Unauthenticated!")

  const { bugId } = req.params
  bugService
    .remove(bugId, loggedinUser)
    .then(() => res.send("Removed!"))
    .catch((err) => {
      loggerService.error(err)
      res.status(404).send("Can't find bug")
    })
})

// USER API
app.get("/api/user", (req, res) => {
  userService
    .query()
    .then((users) => res.send(users))
    .catch((err) => {
      loggerService.error("Cannot load users", err)
      res.status(400).send("Cannot load users.")
    })
})

app.get("/api/user/:userId", (req, res) => {
  const { userId } = req.params

  userService
    .getUserById(userId)
    .then((user) => res.send(user))
    .catch((err) => {
      loggerService.error("Cannot load user", err)
      res.status(400).send("Cannot load user.")
    })
})

//AUTH API

app.post("/api/auth/signup", (req, res) => {
  const credentials = req.body
  userService
    .add(credentials)
    .then((user) => {
      if (user) {
        const loginToken = authService.getLoginToken(user)
        res.cookie("loginToken", loginToken)
        res.send(user)
      } else {
        res.status(400).send("Cannot Signup!")
      }
    })
    .catch((err) => res.status(400).send("Username taken! ", err))
})

app.post("/api/auth/login", (req, res) => {
  const credentials = req.body

  authService
    .checkLogin(credentials)
    .then((user) => {
      const loginToken = authService.getLoginToken(user)
      res.cookie("loginToken", loginToken)
      res.send(user)
    })
    .catch((err) => res.status(404).send("Invalid Credentials", err))
})

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("loginToken")
  res.send("Logged out.")
})

app.get("{*splat}", (req, res) => {
  res.sendFile(path.resolve("public/index.html"))
})

const port = 3030
app.listen(port, () =>
  console.log(`Server listening on port http://127.0.0.1:${port}/`),
)

function parseQueryParams(queryParams) {
  const filterBy = {
    txt: queryParams.txt || "",
    severity: +queryParams.severity || 0,
    labels: queryParams.labels || [],
    ownerId: queryParams.ownerId || "",
  }
  const sortBy = {
    sortField: queryParams.sortField || "",
    sortDir: +queryParams.sortDir || 1,
  }
  const pagination = {
    pageIdx:
      queryParams.pageIdx !== undefined
        ? +queryParams.pageIdx || 0
        : queryParams.pageIdx,
    pageSize: +queryParams.pageSize || 3,
  }
  return { filterBy, sortBy, pagination }
}
