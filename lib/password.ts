import bcrypt from "bcryptjs";

const COST = 12;

export const hashPassword = (password: string) => bcrypt.hash(password, COST);
export const verifyPassword = (password: string, passwordHash: string) => bcrypt.compare(password, passwordHash);
