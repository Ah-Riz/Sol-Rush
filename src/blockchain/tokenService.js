import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Token } from "@solana/spl_governance";
import { TOKEN_PROGRAM_ID } from "@solana/spl_governance";

const MINT_ADDRESS = new PublicKey("5ttQ3kYx23HdaYhjK7w5a24vFQM27vfNZmini3N8XaN7");
const SECRET_KEY_ARRAY = JSON.parse(import.meta.env.SECRET_KEY_ARRAY);
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

  // Get the token account, creating it if it doesn't exist
  const recipientTokenAccount = await token.getOrCreateAssociatedAccountInfo(recipient);

  // Mint tokens
  const mintAmount = Math.round(amount * (10 ** (await token.getMintInfo()).decimals));
  const transaction = new Transaction().add(
    token.mintTo(
      recipientTokenAccount.address,
      payer.publicKey,
      [],
      mintAmount
    )
  );
  const signature = await connection.sendTransaction(transaction, [payer]);

  console.log(`Minted ${amount} tokens to ${recipient.toBase58()}`);
  console.log(`Transaction signature: ${signature}`);
  
  return signature;
}
