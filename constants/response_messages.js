const authMsg = {
  UNAUTHORIZED: "auth/not-authorized",
  NOT_AUTHENTICATED: "auth/not-authenticated",
  PASSWORD_MISSMATCH: "auth/password-missmatch",
  NOBODY_LOGGED: "auth/nobody-logged",
};

const msg = {
  SERVER_ERROR: "server-error",
  RESOURCE_EXISTS: "data-already-exists/resource=",
  RESOURCE_NOT_FOUND: "data-not-found/resource=",
  SUCCESS_ACTION: "successfull/action=",
  BAD_DATA: "bad-data/resource=",
  BAD_PARAMS: "bad-params/param=",
};

module.exports = { authMsg, msg };
