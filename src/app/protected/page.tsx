import { redirect } from 'next/navigation'

/**
 * `/protected` root → forward to the dashboard. The studio shell renders
 * around the route content, so this just picks the default landing surface
 * (chat alongside the dashboard canvas).
 */
export default function ProtectedHomePage() {
  redirect('/protected/dashboard')
}
