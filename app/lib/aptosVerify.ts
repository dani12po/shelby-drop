import { Ed25519PublicKey, Ed25519Signature } from "@aptos-labs/ts-sdk";

/**
 * Verifies an Aptos message signature.
 * 
 * @param message The original message string
 * @param signature The hex signature (without 0x)
 * @param publicKey The hex public key (without 0x)
 * @returns boolean indicating if the signature is valid
 */
export function verifyAptosSignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    // Ensure hex strings are clean
    const cleanPublicKey = publicKey.startsWith("0x") ? publicKey.substring(2) : publicKey;
    const cleanSignature = signature.startsWith("0x") ? signature.substring(2) : signature;

    const pk = new Ed25519PublicKey(cleanPublicKey);
    const sig = new Ed25519Signature(cleanSignature);
    
    // Aptos signMessage usually prefixes the message or uses a specific format
    // but for simple verification of a raw string:
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(message);

    return pk.verifySignature({
      message: messageBytes,
      signature: sig,
    });
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}
