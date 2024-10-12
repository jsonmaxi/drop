import axios from "axios";
import { PublicKey } from "@solana/web3.js";

import IDL from "../target/idl/token_minter.json";

export interface Token {
  decimals: number;
  description: string;
  logoURI: string;
  mint: PublicKey;
  name: string;
  seed: PublicKey;
  symbol: string;
}

export const getTokens = async (): Promise<Token[]> => {
  const { data: tokens } = await axios.get<
    {
      address: string;
      name: string;
      symbol: string;
      decimals: number;
      logoURI: string;
    }[]
  >("https://tokens.jup.ag/tokens?tags=verified");

  return tokens.map((x) => {
    return {
      decimals: x.decimals,
      description: `Mock of ${x.symbol} (${x.address})`,
      logoURI: x.logoURI,
      mint: PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), new PublicKey(x.address).toBuffer()],
        new PublicKey(IDL.address),
      )[0],
      name: `${x.name}`,
      seed: new PublicKey(x.address),
      symbol: x.symbol,
    };
  });
};
