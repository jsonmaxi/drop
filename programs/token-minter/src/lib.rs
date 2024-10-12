use anchor_lang::prelude::*;
use instructions::*;
pub mod instructions;

declare_id!("dropFMi3YzWh5FJysWwmSfnGhh2LuGdXHm1wzNuu71z");

#[program]
pub mod token_minter {
    use super::*;

    pub fn create_token(
        ctx: Context<CreateToken>,
        seed: Pubkey,
        decimals: u8,
        token_name: String,
        token_symbol: String,
        token_uri: String,
    ) -> Result<()> {
        create::create_token(ctx, seed, decimals, token_name, token_symbol, token_uri)
    }

    pub fn mint_token(ctx: Context<MintToken>, seed: Pubkey, amount: u64) -> Result<()> {
        mint::mint_token(ctx, seed, amount)
    }

    pub fn update_token(
        ctx: Context<UpdateToken>,
        seed: Pubkey,
        token_name: String,
        token_symbol: String,
        token_uri: String,
    ) -> Result<()> {
        update::update_token(ctx, seed, token_name, token_symbol, token_uri)
    }
}
