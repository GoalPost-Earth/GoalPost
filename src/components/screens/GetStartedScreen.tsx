import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const GetStartedScreen = () => {
  return (
    <>
      <div
        className="h-screen bg-cover bg-no-repeat bg-center lg:hidden"
        style={{
          backgroundImage:
            'url(/assets/images/bottom-view-group-diverse-friends-posing.webp)',
        }}
      >
        <div className="h-[60vh] bg-linear-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 w-full h-[40%] flex flex-col justify-center px-6 gap-10 items-center bg-white/90">
          <div className="absolute top-[-100px] w-24 h-24 bg-gray-500 flex items-center justify-center text-white">
            Logo
          </div>
          <div className="w-full text-center space-y-5">
            <h1 className="text-brandIcons font-bold text-xl">
              Hello and Welcome!
            </h1>
            <p className="text-md opacity-60">
              Connect with and care for your community.
            </p>
          </div>
          <Link href="/auth/login?returnTo=/" passHref>
            <Button size="lg" className="py-6">
              Next
            </Button>
          </Link>
        </div>
      </div>
      <DesktopGetStartedScreen />
    </>
  )
}

function DesktopGetStartedScreen() {
  return (
    <div className="hidden lg:flex h-screen">
      <div className="relative flex-1 w-2/5 h-full overflow-hidden">
        <Image
          src="/assets/images/bottom-view-group-diverse-friends-posing.webp"
          fill
          className="object-cover"
          alt="get started"
        />
      </div>
      <div className="flex-1 w-3/5 flex flex-col gap-4 p-16 h-full justify-center self-start">
        <div className="self-start flex items-center gap-2">
          <div className="w-12 h-12 bg-gray-500 flex items-center justify-center text-white">
            Logo
          </div>
          <h1 className="text-4xl">GoalPost</h1>
        </div>
        <div className="container">
          <h1 className="font-bold self-start">Welcome!</h1>
          <h1 className="self-start text-4xl">
            Connect with and care for your community
          </h1>
        </div>
        <Link href="/auth/login?returnTo=/" passHref>
          <Button size="lg" className="py-6">
            Next
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default GetStartedScreen
