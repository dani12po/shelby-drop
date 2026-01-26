export type ObjectAccessMode =
  | "public"
  | "signed"
  | "preview"
  | "download";

export type ObjectUrlOptions = {
  wallet: string;
  mode: ObjectAccessMode;

  /**
   * Optional expiry (seconds)
   * Only for signed URLs
   */
  expiresIn?: number;
};
