import {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
  } from "@solana/web3.js";
  import {
    getOrCreateAssociatedTokenAccount,
    mintTo,
  } from "@solana/spl-token";
  
  export async function mintToken(recipientAddress) {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const mintAddress = new PublicKey("FKU8zvmr1YmmEg6egDYBEAvb7ffBqszYbjgBK5Nxfnwc");
    const secret = Uint8Array.from([/* secret key array */]);
    const payer = Keypair.fromSecretKey(secret);
    const recipient = new PublicKey(recipientAddress);
    
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mintAddress,
      recipient
    );
  
    const txSig = await mintTo(
      connection,
      payer,
      mintAddress,
      recipientTokenAccount.address,
      payer,
      1000000
    );
  
    return txSig;
  }