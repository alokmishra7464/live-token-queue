const asyncHandler = require('../utils/asyncHandler');
const tokenService = require('../services/tokenService');

exports.queue = asyncHandler(async (req, res) => res.json(await tokenService.listQueue()));
exports.next = asyncHandler(async (req, res) => res.json(await tokenService.callNext()));
exports.done = asyncHandler(async (req, res) => res.json(await tokenService.markDone(req.params.id)));
exports.skip = asyncHandler(async (req, res) => res.json(await tokenService.markSkipped(req.params.id)));
