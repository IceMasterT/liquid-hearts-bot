import bs58 from "bs58";

export function getPrivateKeyBase58(key: Uint8Array): string {
  return bs58.encode(key);
}
