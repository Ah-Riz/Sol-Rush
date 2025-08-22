// mintSPLToken.js
import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

// Ganti dengan mint token yang sudah Anda buat
const MINT_ADDRESS = new PublicKey("5ttQ3kYx23HdaYhjK7w5a24vFQM27vfNZmini3N8XaN7");

// Gunakan secret key (pemilik mint authority)
const SECRET_KEY_ARRAY = JSON.parse(import.meta.env.SECRET_KEY_ARRAY);
const AMOUNT_IN_TOKENS = 1; // ubah sesuai kebutuhan

function toUint8Array(arr) { 
  return new Uint8Array(arr);
}

export async function mintSPLToken(recipientPubKeyString) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const payer = Keypair.fromSecretKey(toUint8Array(SECRET_KEY_ARRAY));

  console.log("Mint Authority:", payer.publicKey.toBase58());

  const mintInfo = await getMint(connection, MINT_ADDRESS);
  const decimals = mintInfo.decimals;

  const recipient = new PublicKey(recipientPubKeyString);

  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    MINT_ADDRESS,
    recipient
  );

  const amountSmallest = BigInt(Math.round(AMOUNT_IN_TOKENS * 10 ** decimals));

  const signature = await mintTo(
    connection,
    payer,
    MINT_ADDRESS,
    ata.address,
    payer, // Mint authority
    amountSmallest
  );

  return {
    signature,
    mintAddress: MINT_ADDRESS.toBase58(),
    recipient: recipient.toBase58(),
    amount: AMOUNT_IN_TOKENS,
  };
}
