import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const MINT_ADDRESS = new PublicKey("5ttQ3kYx23HdaYhjK7w5a24vFQM27vfNZmini3N8XaN7");


const SECRET_KEY_ARRAY = [14,68,33,236,13,201,240,124,164,194,43,240,51,40,32,239,60,192,108,32,79,94,110,170,23,233,20,184,116,162,68,62,105,74,232,81,123,123,86,186,216,202,1,197,200,213,4,85,234,28,158,244,40,219,101,142,9,213,182,53,155,207,144,62];
// import.meta.env.SECRET_KEY_ARRAY.split(',');
const AMOUNT_IN_TOKENS = 1;

function toUint8Array(arr) { 
  return new Uint8Array(arr);
}

export async function mintSPLToken(recipientPubKeyString, amount = 1) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const payer = Keypair.fromSecretKey(toUint8Array(SECRET_KEY_ARRAY));
  const recipient = new PublicKey(recipientPubKeyString);

  console.log("Mint Authority:", payer.publicKey.toBase58());

  // Create token instance
  const token = new Token(
    connection,
    MINT_ADDRESS,
    TOKEN_PROGRAM_ID,
    payer
  );
  
  // Get or create the associated token account
  const recipientTokenAccount = await token.getOrCreateAssociatedAccountInfo(recipient);
  
  // Get mint info to determine decimals
  const mintInfo = await token.getMintInfo();
  
  // Calculate the amount in the smallest unit (lamports)
  const amountInSmallestUnit = Math.round(amount * Math.pow(10, mintInfo.decimals));

  // Mint tokens
  const signature = await token.mintTo(
    recipientTokenAccount.address,
    payer,
    [],
    amountInSmallestUnit
  );

  console.log(`Minted ${amount} tokens to ${recipient.toBase58()}`);
  console.log(`Transaction signature: ${signature}`);
  
  return {
    signature,
    mintAddress: MINT_ADDRESS.toBase58(),
    recipient: recipient.toBase58(),
    amount: amount,
  };
}