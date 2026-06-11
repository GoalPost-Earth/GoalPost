'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])
const MAX_BYTES = 5 * 1024 * 1024

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  )
}

interface AvatarUploaderProps {
  name: string
  /** Current stored photo value (app path or external URL); '' when unset. */
  photo: string
  editing: boolean
  onChange: (photoPath: string) => void
  /** Lets the parent disable Save while an upload is in flight. */
  onUploadingChange?: (uploading: boolean) => void
}

/**
 * Profile photo control. In view mode it renders the member's photo (or their
 * initials). In edit mode the avatar becomes a drop target / file picker with a
 * camera affordance: selecting an image uploads it directly to S3 via a
 * presigned URL and reports the resulting stable photo path back to the parent
 * draft. The bytes never round-trip through the GraphQL layer.
 */
export function AvatarUploader({
  name,
  photo,
  editing,
  onChange,
  onUploadingChange,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  // Instant local preview of the just-picked file, so the new photo shows
  // before the round-trip to S3 + the avatar GET route completes.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Leaving edit mode (save or cancel) drops the transient preview so the
  // displayed image falls back to the prop — which is the saved value on save
  // and the reverted value on cancel.
  useEffect(() => {
    if (!editing && previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [editing, previewUrl])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const displaySrc = previewUrl || photo || null

  async function uploadFile(file: File) {
    if (!ALLOWED_TYPES.has(file.type)) {
      toast.error('Please choose a JPG, PNG, WebP, or GIF image.')
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error('That image is too large. The limit is 5 MB.')
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return localPreview
    })
    setUploading(true)
    onUploadingChange?.(true)

    try {
      const presign = await fetch('/api/user/avatar/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        }),
      })
      if (!presign.ok) {
        const err = await presign.json().catch(() => ({}))
        throw new Error(err.error || 'Could not start the upload.')
      }
      const { uploadUrl, photoPath, contentType } = await presign.json()

      const put = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': contentType },
      })
      if (!put.ok) throw new Error('The upload did not complete. Please retry.')

      onChange(photoPath)
      toast.success('Photo updated — save to keep it.')
    } catch (err) {
      console.error('Avatar upload failed', err)
      toast.error(
        err instanceof Error ? err.message : 'Could not upload your photo.'
      )
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
    }
  }

  const onPick = () => {
    if (!editing || uploading) return
    inputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative"
        onDragOver={(e) => {
          if (!editing) return
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          if (!editing || uploading) return
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files?.[0]
          if (file) void uploadFile(file)
        }}
      >
        <button
          type="button"
          onClick={onPick}
          disabled={!editing}
          aria-label={editing ? 'Change profile photo' : 'Profile photo'}
          className={`group relative flex size-16 sm:size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-all ${
            dragging
              ? 'border-gp-primary ring-4 ring-gp-primary/30'
              : 'border-gp-primary/30'
          } ${editing ? 'cursor-pointer hover:border-gp-primary' : 'cursor-default'} bg-[color-mix(in_srgb,var(--gp-primary)_18%,transparent)]`}
        >
          {displaySrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displaySrc}
              alt={name}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-gp-primary">
              {initialsOf(name)}
            </span>
          )}

          {editing && (
            <span
              className={`absolute inset-0 flex items-center justify-center bg-black/45 text-white transition-opacity ${
                uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${uploading ? 'animate-spin' : ''}`}
              >
                {uploading ? 'progress_activity' : 'photo_camera'}
              </span>
            </span>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void uploadFile(file)
            // Allow re-picking the same file.
            e.target.value = ''
          }}
        />
      </div>

      {editing && (
        <button
          type="button"
          onClick={onPick}
          disabled={uploading}
          className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gp-primary hover:underline disabled:opacity-50 cursor-pointer"
        >
          {uploading ? 'Uploading…' : photo ? 'Change photo' : 'Add photo'}
        </button>
      )}
    </div>
  )
}
