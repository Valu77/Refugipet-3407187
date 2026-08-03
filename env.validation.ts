import * as Joi from 'joi';
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  MAIL_HOST: Joi.string().default('localhost'),
  MAIL_PORT: Joi.number().default(1025),
  MAIL_FROM: Joi.string()
    .email({ tlds: false })
    .default('noreply@nn-company.com'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
});