// Create an error that carries an HTTP status code
module.exports = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};
