'use client'

import { FieldsCanvas } from '@/components/layout/fields-canvas'

export default function FieldsPage() {
  const handleFieldClick = (fieldTitle: string) => {
    console.log(`Clicked field: ${fieldTitle}`)
    // Navigate to field details or open field modal
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors">
      <FieldsCanvas onFieldClick={handleFieldClick} />
    </div>
  )
}
