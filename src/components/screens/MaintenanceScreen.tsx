// filepath: /Users/jd/Documents/dev/upwork/GoalPost/src/components/screens/MaintenanceScreen.tsx
import React from 'react'
import { Settings } from 'lucide-react'

const MaintenanceScreen = () => {
  return (
    <div className="container mx-auto flex justify-center items-center h-screen">
      <div className="flex flex-col gap-6 text-center">
        <Settings className="w-24 h-24 text-orange-500 mx-auto" />
        <h1 className="text-xl font-bold text-heading">Under Maintenance</h1>
        <p className="text-lg text-text">
          We&apos;re currently performing some scheduled maintenance.
          <br />
          Please check back in a little while.
        </p>
        <p className="text-md text-gray-500">
          {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}

export default MaintenanceScreen
