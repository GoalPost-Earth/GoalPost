import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Rich link-unfurl tile (Slack, Twitter/X, Facebook, iMessage). 1200×630 is
// the standard OG size. Brand mark + wordmark + tagline on the dark brand
// gradient (--gp-surface-dark). Twitter reuses this via summary_large_image.
export const runtime = 'nodejs'
export const alt =
  'GoalPost — mutual aid, collective sense-making, and relational depth'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), 'public', 'goalpost-logo.png'))
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #0d181e 0%, #13272f 55%, #0d181e 100%)',
          color: '#f6f7f8',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={300} height={271} alt="" />
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            letterSpacing: -2,
            marginTop: 8,
          }}
        >
          GoalPost
        </div>
        <div style={{ fontSize: 30, color: '#9fb2c2', marginTop: 14 }}>
          Mutual aid · collective sense-making · relational depth
        </div>
      </div>
    ),
    { ...size },
  )
}
