import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().port().default(3000),

  JWT_SECRET: Joi.string().required(),
  ACCESS_TOKEN_NAME: Joi.string().required().default('access_token'),
  ACCESS_TOKEN_JWT_EXPIRES_IN: Joi.string().required().default('5m'),
  REFRESH_TOKEN_NAME: Joi.string().required().default('refresh_token'),
  REFRESH_TOKEN_JWT_EXPIRES_IN: Joi.string().required().default('1h'),
  BCRYPT_SALT_ROUNDS: Joi.number().required().default(10),

  POSTGRES_URL_PROD: Joi.string().required(),
});
