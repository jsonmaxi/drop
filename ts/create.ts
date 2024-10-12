import {
  TransactionMessage,
  VersionedTransaction,
  Keypair,
  Connection,
} from "@solana/web3.js";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";

import IDL from "../target/idl/token_minter.json";
import type { TokenMinter } from "../target/types/token_minter";
import { chunk } from "./utils";
import { getTokens } from "./tokens";
import { hasMetadata, metadataUri, saveMetadata } from "./metadata";

async function main() {
  const connection = new Connection("https://api.devnet.solana.com");
  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.PRIVATE_KEY)),
  );
  const provider = new AnchorProvider(connection, new Wallet(payer), {});
  const program = new Program<TokenMinter>(IDL as TokenMinter, provider);

  const tokens = await getTokens();

  // Get new tokens to mint
  const mints = tokens.filter((x) => !hasMetadata(x));
  console.log("Mints to create: ", mints.length);

  // Get the instructions
  const instructions = await Promise.all(
    mints.map((x) =>
      program.methods
        .createToken(x.seed, x.decimals, x.name, x.symbol, metadataUri(x))
        .instruction(),
    ),
  );

  const { blockhash } = await connection.getLatestBlockhash();

  // Combined several mints in a single transaction, and send. Takes above 60k CU per mint
  const transactions = chunk(instructions, 3).map((ixs) => ({
    tx: new VersionedTransaction(
      new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: blockhash,
        instructions: ixs,
      }).compileToV0Message(),
    ),
  }));

  await provider.sendAll(transactions, {
    skipPreflight: true,
    commitment: "confirmed",
  });

  for (const token of mints) {
    saveMetadata(token);
  }
}

main();
