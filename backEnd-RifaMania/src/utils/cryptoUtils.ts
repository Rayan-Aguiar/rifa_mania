import * as crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

let SECRET_KEY = process.env.SECRET_KEY as string;

if (SECRET_KEY.length !== 64) {
  SECRET_KEY = crypto.createHash("sha256").update(SECRET_KEY).digest("hex");
}

export function encrypt(text: string): string {
  const keyBuffer = Buffer.from(SECRET_KEY, "hex");
  const iv = Buffer.alloc(16, 0);

  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decrypt(encryptedText: string): string {
  const keyBuffer = Buffer.from(SECRET_KEY, "hex");
  const iv = Buffer.alloc(16, 0);

  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
