import express from "express"
import { bugService } from "./services/bug.service.js"
import { loggerService } from "./services/logger.service.js"

const app = express()
app.use(express.static('public'))

app.get("/api/bug", (req, res) => {
  bugService.query().then((bugs) => res.send(bugs))
})

app.get("/api/bug/save", (req, res) => {
  const { _id, title, description, severity, createdAt } = req.query
  const bugToSave = {
    _id,
    title,
    description,
    severity: +severity,
    createdAt: +createdAt,
  }

  bugService
    .save(bugToSave)
    .then((savedBug) => res.send(savedBug))
    .catch((err) => {
      loggerService.error(err)
      res.status(404).send("Can't save bug")
    })
})

app.get("/api/bug/:bugId", (req, res) => {
  const bugId = req.params.bugId

  bugService
    .get(bugId)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error(err)
      res.status(404).send("Can't find bug")
    })
})

app.get("/api/bug/:bugId/remove", (req, res) => {
  const bugId = req.params.bugId
  bugService
    .remove(bugId)
    .then(() => res.send("Removed!"))
    .catch((err) => {
      loggerService.error(err)
      res.status(404).send("Can't find bug")
    })
})

const port = 3030
app.listen(port, () =>
  console.log(`Server listening on port http://127.0.0.1:${port}/`),
)
