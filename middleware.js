import { expressjwt } from "express-jwt";
const secretKey = process.env.JWT_SECRET_KEY;
const jwtMiddleware = expressjwt({
  secret: secretKey,
  algorithms: ["HS256"],
});
