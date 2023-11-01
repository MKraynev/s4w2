import dotenv from "dotenv"
dotenv.config();

export const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost/nest";

export const JWT_SECRET = process.env.JWT_SECRET_TOKEN || "veryStrongSecret12311"
export const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || "5m"

export const MAIL_LOGIN = process.env.GMAIL_LOGIN;
export const MAIL_PASSWORD = process.env.GMAIL_PASSWORD;

export const CONFIRM_REGISTRATION_URL = process.env.REGISTRATION_CONFIRM_URL || "localhost:5001/auth/registration-confirmation"
export const REFRESH_PASSWORD_URL = process.env.REFRESH_PASSWORD_URL || "localhost:5001/auth/new-password"

export const ADMIN_LOGIN = process.env.ADMIN_LOGIN;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;