import { Keypair } from "@solana/web3.js";

export function createSolanaAddress(): Keypair {
  const address = Keypair.generate();

  return address;
}
