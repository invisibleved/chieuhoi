import sharp from 'sharp'

/** Ô màu 1200×800 có chữ "Ảnh mẫu" (PNG): ảnh tự sinh cho dữ liệu mẫu của trang hướng dẫn, không phải ảnh thật. */
export async function sampleImage(color: string, ink: string): Promise<Buffer> {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>
    <rect width='1200' height='800' fill='${color}'/>
    <text x='600' y='430' text-anchor='middle' font-family='Helvetica, Arial, sans-serif' font-size='96' font-weight='600' fill='${ink}'>Ảnh mẫu</text>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}
