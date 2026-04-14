const BASE_URL = "/api/bug/"

export const bugService = {
  query,
  getById,
  save,
  remove,
  getEmptyBug,
  getDefaultFilter,
  getLabels,
}

function query(queryOptions) {
  return axios.get(BASE_URL, { params: queryOptions }).then((res) => res.data)
}

function getById(bugId) {
  return axios.get(BASE_URL + bugId).then((res) => res.data)
}

function remove(bugId) {
  return axios.delete(BASE_URL + bugId).then((res) => res.data)
}

function save(bug) {
  const method = bug._id ? "put" : "post"
  return axios[method](BASE_URL + (bug._id || ""), bug).then((res) => res.data)
}

function getEmptyBug() {
  return { title: "", description: "", severity: 5 }
}

function getDefaultFilter() {
  return { txt: "", severity: 0, labels: [], sortField: "", sortDir: 1 }
}

function getLabels() {
  return ["back", "front", "critical", "fixed", "in progress", "stuck"]
}
