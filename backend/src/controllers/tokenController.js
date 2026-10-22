const asyncHandler = require('../utils/asyncHandler');
const tokenService = require('../services/tokenService');

exports.getToken = asyncHandler(async (req, res) => {
  await tokenService.createToken(req.user.phone);
  res.status(201).json(await tokenService.getStatus(req.user.phone));
});

exports.myStatus = asyncHandler(async (req, res) => {
  res.json(await tokenService.getStatus(req.user.phone));
});
