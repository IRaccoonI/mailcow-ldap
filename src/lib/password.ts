import { SHA3 } from "crypto-js";

export function getOTP(username: string) {
  return SHA3(username + process.env.PASSWORD_SALT) // мб SHA3 не лучший выбор
    .toString()
    .slice(0, 16);
}
