import Joi from '@hapi/joi';

export default {
  Id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .description('Product Option identifier. Id is a GUID'), // GUID(uuidv4) format
  Name: Joi.string().min(1).max(255).description('Product name'),
  Description: Joi.string().min(1).max(255).description('Product description'),
};
