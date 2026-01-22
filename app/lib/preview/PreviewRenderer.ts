import { FileItemData } from "@/lib/data";

export type PreviewContext = {
  file: FileItemData;
  wallet: string;
  fileUrl: string;
};

export type PreviewRenderer = {
  /**
   * Unique renderer id
   */
  id: string;

  /**
   * Extensions handled by this renderer
   * example: ["json"], ["md"], ["png","jpg"]
   */
  extensions: string[];

  /**
   * Render preview UI
   */
  render(ctx: PreviewContext): JSX.Element;
};
