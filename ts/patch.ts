import { Connection } from "@solana/web3.js";

import { getTokens } from "./tokens";
import { hasMetadata, saveMetadata } from "./metadata";
import { chunk } from "./utils";

async function main() {
  const connection = new Connection("https://api.devnet.solana.com");
  const universe = await getTokens().then((x) =>
    x.filter((x) => !hasMetadata(x)),
  );

  for (const tokens of chunk(universe, 100)) {
    const accounts = await connection.getMultipleAccountsInfo(
      tokens.map((x) => x.mint),
    );
    tokens.forEach((token, i) => {
      if (accounts[i] === null) {
        // console.log("Not found: ", token.symbol);
        return;
      }
      if (hasMetadata(token)) {
        // console.log("Already has metadata: ", token.symbol);
        return;
      }
      console.log("Patching metadata for: ", token.symbol);
      saveMetadata(token);
    });
  }
}

main();
