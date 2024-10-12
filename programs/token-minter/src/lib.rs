use anchor_lang::prelude::*;
use instructions::*;
pub mod instructions;

declare_id!("CzD1FVVrzZs22deQaNKtCjJrGoRy6FjTznN581KNJVt9");

#[program]
pub mod token_minter {
    use super::*;

    pub fn create_token(
        ctx: Context<CreateToken>,
        seed: String,
        decimals: u8,
        token_name: String,
        token_symbol: String,
        token_uri: String,
    ) -> Result<()> {
        create::create_token(ctx, seed, decimals, token_name, token_symbol, token_uri)
    }

    pub fn mint_token(ctx: Context<MintToken>, seed: String, amount: u64) -> Result<()> {
        mint::mint_token(ctx, seed, amount)
    }
}
