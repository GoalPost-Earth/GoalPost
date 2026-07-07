import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Apple touch icon — also what iMessage / iOS Safari use for link unfurls.
// iOS masks to a rounded rect and shows black behind transparency, so the
// mark sits on an opaque light surface.
export const runtime = 'nodejs'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default async function AppleIcon() {
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
          background: '#f6f7f8',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={140} height={126} alt="" />
      </div>
    ),
    { ...size },
  )
}
