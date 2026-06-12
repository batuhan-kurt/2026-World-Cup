import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '2026 Dünya Kupası Dashboard',
    short_name: 'WC 2026',
    description: '2026 FIFA Dünya Kupası canlı skor, istatistik ve fikstür uygulaması',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon.jpg',
        sizes: 'any',
        type: 'image/jpeg',
      },
    ],
  }
}
