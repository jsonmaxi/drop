import { describe, it, expect } from "vitest";
import * as anchor from "@coral-xyz/anchor";

import { deserializeMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { BankrunProvider } from "anchor-bankrun";
import { startAnchor } from "solana-bankrun";

import type { TokenMinter } from "../target/types/token_minter";
import IDL from "../target/idl/token_minter.json";
import { getAccount, getMint } from "spl-token-bankrun";

const PROGRAM_ID = new PublicKey(IDL.address);
const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

describe("Token Faucet", async () => {
  const context = await startAnchor(
    ".",
    [
      { name: "token_minter", programId: PROGRAM_ID },
      { name: "token_metadata", programId: METADATA_PROGRAM_ID },
    ],
    []
  );
  const provider = new BankrunProvider(context);
  anchor.setProvider(provider);

  const payer = provider.wallet as anchor.Wallet;
  const program = new anchor.Program<TokenMinter>(IDL as TokenMinter, provider);

  const seed = "USDC";
  // Derive the PDA to use as mint account address.
  // This same PDA is also used as the mint authority.
  const [mintPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), Buffer.from(seed)],
    program.programId
  );

  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mintPDA.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  const metadata = {
    name: "Solana Gold",
    symbol: "GOLDSOL",
    uri: "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json",
  };

  it("Create a token!", async () => {
    await program.methods
      .createToken(seed, 5, metadata.name, metadata.symbol, metadata.uri)
      .accounts({
        payer: payer.publicKey,
      })
      .rpc();

    expect(await getMint(context.banksClient, mintPDA)).toMatchObject({
      decimals: 5,
      freezeAuthority: null,
      isInitialized: true,
      mintAuthority: mintPDA,
      supply: 0n,
    });

    expect(
      deserializeMetadata(
        (await context.banksClient.getAccount(metadataPDA)) as any
      )
    ).toMatchObject({
      mint: mintPDA.toString(),
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      sellerFeeBasisPoints: 0,
    });
  });

  it("Mint 1 Token!", async () => {
    // Derive the associated token address account for the mint and payer.
    const associatedTokenAccountAddress = getAssociatedTokenAddressSync(
      mintPDA,
      payer.publicKey
    );

    await program.methods
      .mintToken(seed, new anchor.BN(1_000_000))
      .accounts({ payer: payer.publicKey })
      .rpc();

    expect(
      await getAccount(context.banksClient, associatedTokenAccountAddress)
    ).toMatchObject({
      amount: 1_000_000n,
      mint: mintPDA,
      owner: payer.publicKey,
    });
  });
});
