import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKeys(): { encryptionKey: Buffer; hmacKey: Buffer } {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  const hmacKey = process.env.HMAC_KEY;
  if (!encryptionKey || !hmacKey) {
    throw new Error("ENCRYPTION_KEY e HMAC_KEY devem estar definidas no ambiente");
  }
  return {
    encryptionKey: Buffer.from(encryptionKey, "hex"),
    hmacKey: Buffer.from(hmacKey, "hex"),
  };
}

export function encrypt(plaintext: string): string {
  const { encryptionKey } = getKeys();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

export function decrypt(ciphertext: string): string {
  const { encryptionKey } = getKeys();
  const [ivB64, authTagB64, encrypted] = ciphertext.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function hmac(value: string): string {
  const { hmacKey } = getKeys();
  return crypto.createHmac("sha256", hmacKey).update(value).digest("hex");
}

export function cpfHmac(cpf: string): string {
  return hmac(cpf.replace(/\D/g, ""));
}

export function emailHmac(email: string): string {
  return hmac(email.trim().toLowerCase());
}

export function phoneHmac(phone: string): string {
  return hmac(phone.replace(/\D/g, ""));
}

export function gerarPessoaId(): string {
  return crypto.randomUUID();
}

export function gerarTokenPseudonimo(): string {
  return crypto.randomUUID();
}

export function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

export function hashTexto(texto: string): string {
  return crypto.createHash("sha256").update(texto).digest("hex").slice(0, 16);
}
