import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://shelby-drop.vercel.app', lastModified: new Date(), priority: 1 },
    { url: 'https://shelby-drop.vercel.app/explorer', lastModified: new Date(), priority: 0.9 },
    { url: 'https://shelby-drop.vercel.app/about', lastModified: new Date(), priority: 0.8 },
    { url: 'https://shelby-drop.vercel.app/faq', lastModified: new Date(), priority: 0.8 },
    { url: 'https://shelby-drop.vercel.app/guide', lastModified: new Date(), priority: 0.8 },
    { url: 'https://shelby-drop.vercel.app/vision', lastModified: new Date(), priority: 0.7 },
  ]
}