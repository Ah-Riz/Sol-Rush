import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL, Transaction, SystemProgram, sendTransaction } from '@solana/web3.js';
import { createMintToInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
    
export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export async function getSolBalance(pubkey) {
  const lamports = await connection.getBalance(new PublicKey(pubkey));
  return lamports / LAMPORTS_PER_SOL;
}

export async function getSplTokenBalance(ownerPubkey, mintAddress) {
  const owner = new PublicKey(ownerPubkey);
  const mint = new PublicKey(mintAddress);

  const res = await connection.getParsedTokenAccountsByOwner(owner, { mint });
  
  if (!res.value.length) {
    return 0; 
  }

  const info = res.value[0].account.data.parsed.info;
  const amount = info.tokenAmount; 

  return amount.uiAmount ?? parseFloat(amount.amount) / Math.pow(10, amount.decimals);
}
