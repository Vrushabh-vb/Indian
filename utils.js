function createSuccess(data) {
  return {
    status: "success",
    data,
  };
}

function createError(error) {
  return {
    status: "error",
    error,
  };
}

function createResult(error, data) {
  if (error) {
    return createError(error);
  } else {
    return createSuccess(data);
  }
}

module.exports = {
  createSuccess,
  createError,
  createResult,
};
