import { isValidServiceKey } from "./isValidServiceKey";

export const ServiceKeyValidationMiddleware = async (req, res, next) => {
  const { serviceKey } = req.query;
  if (await isValidServiceKey(serviceKey)) {
    return next();
  }
  res.status(403).json('Not Valid Service Key');
}
