'use client'

import { useRouter, useParams } from 'next/navigation'
import { FieldsCanvas } from '@/components/layout/fields-canvas'

export default function FieldsPage() {
  const router = useRouter()
  const params = useParams()

  const handleFieldClick = (fieldTitle: string) => {
    const fieldId = fieldTitle.toLowerCase().replace(/\s+/g, '-')
    const space = params?.space as string
    router.push(`/protected/fields/${space}/${fieldId}`)
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors">
      <FieldsCanvas onFieldClick={handleFieldClick} />
    </div>
  )
}
