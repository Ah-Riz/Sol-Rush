import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

export async function mintSPLToken(recipientAddress) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Mint authority = wallet yang punya izin mint
  const secretKey = Uint8Array.from([9,2,158,29,238,193,229,126,191,57,228,148,29,203,96,253,131,142,109,110,20,149,33,181,243,40,65,120,248,97,33,11,232,128,112,44,191,131,233,132,152,114,39,104,203,25,194,47,225,142,46,52,223,248,167,197,212,72,241,200,117,140,241,141]);
  const mintAuthority = Keypair.fromSecretKey(secretKey);
  console.log(await connection.getBalance(mintAuthority.publicKey));

  // SPL token yang sudah dibuat
  const mintAddress = new PublicKey("5ttQ3kYx23HdaYhjK7w5a24vFQM27vfNZmini3N8XaN7");

  // PublicKey penerima
  const recipient = new PublicKey(recipientAddress);

  try {
    console.log("Membuat/mendapatkan ATA untuk:", recipient.toBase58());

    // 1. Buat/dapatkan ATA penerima
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority, // payer (mintAuthority yang bayar biaya ATA)
      mintAddress,
      recipient
    );
    await connection.confirmTransaction(ataCreationResponse, "confirmed");

    console.log("ATA Penerima:", recipientTokenAccount.address.toBase58());

    // 2. Mint token
    const amount = 1_000_000; // contoh 1 token (decimals = 6)
    const signature = await mintTo(
      connection,
      mintAuthority,              // payer
      mintAddress,                // mint
      recipientTokenAccount.address, // ATA
      mintAuthority,              // authority
      amount                      // jumlah mint
    );

    console.log("Mint sukses! Tx hash:", signature);
    return signature;
  } catch (error) {
    console.error("Mint gagal:", error);
    throw error;
  }
}
