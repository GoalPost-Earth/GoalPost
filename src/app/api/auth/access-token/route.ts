import { getAccessToken } from '@auth0/nextjs-auth0'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const token = await getAccessToken()
    return NextResponse.json(token, {
      status: 200,
    })
  } catch (error) {
    console.error(error)
    if (error.code === 'ERR_EXPIRED_ACCESS_TOKEN') {
      return NextResponse.json(
        { error: 'Expired access token', code: error.code },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get access token' },
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
