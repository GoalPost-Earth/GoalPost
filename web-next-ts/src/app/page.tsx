/* eslint-disable @next/next/no-html-link-for-pages */
import Image from 'next/image'

export default async function Home() {

  return (
    <div>
      <main>
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        {/* {!user ? (
          <a href="/api/auth/login?returnTo=/dashboard">
            <Button colorPalette="yellow">Log in</Button>
          </a>
        ) : (
          <a href="/api/auth/logout?returnTo=/">
            <Button colorPalette="red">Log out</Button>
          </a>
        )} */}
      </main>
    </div>
  )
}
