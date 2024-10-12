use {
    anchor_lang::prelude::*,
    anchor_spl::{
        metadata::{
            mpl_token_metadata::types::DataV2, update_metadata_accounts_v2, Metadata,
            UpdateMetadataAccountsV2,
        },
        token::{Mint, Token},
    },
};

#[derive(Accounts)]
#[instruction(seed: Pubkey)]
pub struct UpdateToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    // Create mint account
    // Same PDA as address of the account and mint
    #[account(
        seeds = [b"mint", seed.key().as_ref()],
        bump,
        mint::authority = mint_account.key(),
    )]
    pub mint_account: Account<'info, Mint>,

    /// CHECK: Validate address by deriving pda
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), mint_account.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata_account: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn update_token(
    ctx: Context<UpdateToken>,
    seed: Pubkey,
    meta_name: String,
    meta_symbol: String,
    meta_uri: String,
) -> Result<()> {
    // PDA signer seeds
    let signer_seeds: &[&[&[u8]]] = &[&[b"mint", seed.as_ref(), &[ctx.bumps.mint_account]]];

    // Cross Program Invocation (CPI) signed by PDA
    // Invoking the create_metadata_account_v3 instruction on the token metadata program
    update_metadata_accounts_v2(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            UpdateMetadataAccountsV2 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                update_authority: ctx.accounts.mint_account.to_account_info(), // PDA is update authority
            },
        )
        .with_signer(signer_seeds),
        Some(ctx.accounts.mint_account.key()),
        Some(DataV2 {
            name: meta_name,
            symbol: meta_symbol,
            uri: meta_uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        }),
        Some(false), // Is mutable
        Some(true),  // Update authority is signer
    )?;

    Ok(())
}
