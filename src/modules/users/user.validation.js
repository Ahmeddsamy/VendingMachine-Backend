import Joi from "joi";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/;
/* 
Password Should be 8-20 Chachters Long
Password Should include atleast 1 UpperCase letter
Password Should include atleast 1 number
No Special Charchter is allowed
*/

export const signUpSchema = {
  body: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp(passwordPattern)).required(),
    Cpassword: Joi.string().valid(Joi.ref("password")).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid("buyer", "seller").required(),
  }),
};

export const signInSchema = {
  body: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().required(),
  }),
};

export const updateUserSchema = {
  body: Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    password: Joi.string().pattern(new RegExp(passwordPattern)),
    role: Joi.string().valid("buyer", "seller"),
  }),
};

export const changePasswordSchema = {
  body: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().pattern(new RegExp(passwordPattern)).required(),
    CNewPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }),
};

export const forgetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    newPassword: Joi.string().pattern(new RegExp(passwordPattern)).required(),
    CNewPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }),
};
