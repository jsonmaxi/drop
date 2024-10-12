import fs from "fs";
import { Token } from "./tokens";

export const metadataPath = (token: Token) =>
  `./data/metadata/${token.mint.toString()}.json`;
export const metadataUri = (token: Token) =>
  `https://raw.githubusercontent.com/jsonmaxi/drop/main/data/metadata/${token.mint.toString()}.json`;

export const hasMetadata = (token: Token) => fs.existsSync(metadataPath(token));
export const saveMetadata = (token: Token) =>
  fs.writeFileSync(
    metadataPath(token),
    JSON.stringify(
      {
        name: token.name,
        symbol: token.symbol,
        description: token.description,
        image: token.logoURI,
      },
      null,
      2,
    ),
  );
