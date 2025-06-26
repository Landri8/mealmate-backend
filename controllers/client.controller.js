const Joi = require('joi');
const clientService = require('../services/client.service');
const { sendResponse } = require('../utils/responseHandler');

const getHomeData = async (req, res) => {
  // validate body
  const schema = Joi.object({
    user_id: Joi.string().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return sendResponse(res, 400, error.details[0].message, null);
  }

  try {
    const data = await clientService.getHomeData(value.user_id);
    sendResponse(res, 200, 'Home data fetched', data);
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, err.message, null);
  }
};

module.exports = { getHomeData };
