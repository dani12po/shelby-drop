export type SignedMessage = {
  message: string;
  signature: string;
  publicKey: string;
};

export async function signUploadMessage(
  wallet: any,
  fileName: string,
  address: string
): Promise<SignedMessage> {
  if (!wallet?.signMessage) {
    throw new Error("Wallet does not support signMessage");
  }

  const timestamp = Date.now();

  const message = [
    "ShelbyDrop Upload",
    `Wallet: ${address}`,
    `Filename: ${fileName}`,
    `Timestamp: ${timestamp}`,
  ].join("\n");

  const res = await wallet.signMessage({
    message,
    nonce: timestamp.toString(),
  });

  return {
    message,
    signature: res.signature.replace(/^0x/, ""),
    publicKey: res.publicKey.replace(/^0x/, ""),
  };
}
