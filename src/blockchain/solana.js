// solana.js
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL, Transaction, SystemProgram,sendTransaction } from '@solana/web3.js';
import {createMintToInstruction,TOKEN_PROGRAM_ID } from "@solana/spl-token";
    
/** Buat koneksi ke devnet (ubah ke 'mainnet-beta' jika perlu) */
export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

/** Ambil saldo SOL */
export async function getSolBalance(pubkey) {
  const lamports = await connection.getBalance(new PublicKey(pubkey));
  return lamports / LAMPORTS_PER_SOL;
}

/** Ambil saldo token SPL untuk mint tertentu (return dalam "amount" as float sesuai decimals) */
export async function getSplTokenBalance(ownerPubkey, mintAddress) {
  const owner = new PublicKey(ownerPubkey);
  const mint = new PublicKey(mintAddress);

  // Ambil semua token accounts milik owner untuk mint ini (parsed agar mudah)
  const res = await connection.getParsedTokenAccountsByOwner(owner, { mint });

  if (!res.value.length) {
    return 0; // belum punya ATA / saldo 0
  }

  // Ambil account pertama (typical: Associated Token Account)
  const info = res.value[0].account.data.parsed.info;
  const amount = info.tokenAmount; // { amount, decimals, uiAmount, uiAmountString }

  // gunakan uiAmount agar otomatis dibagi decimals
  return amount.uiAmount ?? parseFloat(amount.amount) / Math.pow(10, amount.decimals);
}
