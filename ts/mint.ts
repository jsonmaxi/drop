import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { BN, Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";

import IDL from "../target/idl/token_minter.json";
import type { TokenMinter } from "../target/types/token_minter";

async function main() {
  const connection = new Connection("https://api.devnet.solana.com");
  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.PRIVATE_KEY)),
  );

  const provider = new AnchorProvider(connection, new Wallet(payer), {});
  const program = new Program<TokenMinter>(IDL as TokenMinter, provider);

  const seed = new PublicKey("So11111111111111111111111111111111111111112");
  await program.methods.mintToken(seed, new BN(1 * LAMPORTS_PER_SOL)).rpc();
}

main();
