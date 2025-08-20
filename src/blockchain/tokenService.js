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
    // 1. Connect ke Solana devnet
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  
    // 2. Mint Address
    const mintAddress = new PublicKey("FKU8zvmr1YmmEg6egDYBEAvb7ffBqszYbjgBK5Nxfnwc");
  
    // 3. Load wallet authority (mint authority)
    const secret = Uint8Array.from([/* secret key array */]);
    const payer = Keypair.fromSecretKey(secret);
  
    // 4. Recipient
    const recipient = new PublicKey(recipientAddress);
  
    // 5. Pastikan ATA ada
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mintAddress,
      recipient
    );
  
    // 6. Mint token
    const txSig = await mintTo(
      connection,
      payer,
      mintAddress,
      recipientTokenAccount.address,
      payer,   // authority
      1000000  // jumlah mint
    );
  
    return txSig;
  }
  