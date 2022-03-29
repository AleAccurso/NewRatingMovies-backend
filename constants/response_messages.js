const authMsg = {
  UNAUTHORIZED: "Not authorized",
  NOT_AUTHENTICATED: "Not authenticated",
  PASSWORD_MISSMATCH: "Password does not match!",
  NOBODY_LOGGED: "No user Logged",
};

const msg = {
  SERVER_ERROR: "Server error",
  RESOURCE_EXISTS: "data_already_exists/resource=",
  RESOURCE_NOT_FOUND: "data_not_found/resource=",
  SUCCESS_ACTION: "successfull/action=",
  BAD_DATA: "bad_data/resource=",
  BAD_PARAMS: "bad_params/param=",
};

module.exports = { authMsg, msg };
