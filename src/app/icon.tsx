import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Browser tab / generic favicon. The earth-in-hands mark on a transparent
// square so it reads on light and dark tabs alike.
export const runtime = 'nodejs'
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default async function Icon() {
  const logo = await readFile(join(process.cwd(), 'public', 'goalpost-logo.png'))
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={62} height={56} alt="" />
      </div>
    ),
    { ...size },
  )
}
