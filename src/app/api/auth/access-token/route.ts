import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const token = await getAccessToken()
    return NextResponse.json(token, {
      status: 200,
    })
  } catch (error) {
    const errorWithType = error as {
      code: string
    }
    if (errorWithType.code === 'ERR_EXPIRED_ACCESS_TOKEN') {
      return NextResponse.json(
        { error: 'Expired access token', code: errorWithType.code },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get access token', code: errorWithType.code },
      { status: 500 }
    )
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
