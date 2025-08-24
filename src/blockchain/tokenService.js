import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const MINT_ADDRESS = new PublicKey(process.env.ADDRESS_TOKEN);


const SECRET_KEY_ARRAY = process.env.SECRET_KEY_ARRAY.split(',');
const AMOUNT_IN_TOKENS = 1;

function toUint8Array(arr) { 
  return new Uint8Array(arr);
}

export async function mintSPLToken(recipientPubKeyString, amount = 1) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const payer = Keypair.fromSecretKey(toUint8Array(SECRET_KEY_ARRAY));
  const recipient = new PublicKey(recipientPubKeyString);

  const token = new Token(
    connection,
    MINT_ADDRESS,
    TOKEN_PROGRAM_ID,
    payer
  );
  
  const recipientTokenAccount = await token.getOrCreateAssociatedAccountInfo(recipient);
  
  const mintInfo = await token.getMintInfo();
  
  const amountInSmallestUnit = Math.round(amount * Math.pow(10, mintInfo.decimals));

  const signature = await token.mintTo(
    recipientTokenAccount.address,
    payer,
    [],
    amountInSmallestUnit
  );
  
  return {
    signature,
    mintAddress: MINT_ADDRESS.toBase58(),
    recipient: recipient.toBase58(),
    amount: amount,
  };
}