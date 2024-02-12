import Joi from "joi";

export const addProductSchema = {
  body: Joi.object({
    productName: Joi.string().required(),
    cost: Joi.number().min(5).required(),
    amountAvailable: Joi.number().min(0).required(),
  }),
};

export const updateProductSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    productName: Joi.string(),
    cost: Joi.number().min(5),
    amountAvailable: Joi.number().min(0),
  }).min(1), // Ensure at least one field is provided for update
};
