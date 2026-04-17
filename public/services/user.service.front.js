const BASE_URL = "/api/user"

export const userService = {
  query,
  getUserById,
  getEmptyCredentials,
}

function query() {
  return axios.get(BASE_URL).then((res) => res.data)
}
function getUserById(userId) {
  return axios.get(BASE_URL + userId).then((res) => res.data)
}
function getEmptyCredentials() {
  return {
    username: "",
    password: "",
    fullname: "",
  }
}
