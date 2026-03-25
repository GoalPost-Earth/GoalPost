'use client'

import Link from 'next/link'
import * as XLSX from 'xlsx'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useApp, usePageContext } from '@/contexts'

type UploadType = 'we-space' | 'field-context' | 'pulse'

interface ImportPreview {
  fileName: string
  headers: string[]
  rowCount: number
}

interface ImportError {
  row: number
  message: string
  data: Record<string, string>
}

interface ImportResult {
  success: boolean
  message: string
  importedRows: number
  failedRows: number
  warnings: string[]
  errors: ImportError[]
  summary: {
    createdWeSpaces: number
    reusedWeSpaces: number
    createdFieldContexts: number
    reusedFieldContexts: number
    createdPulses: number
  }
}

interface ImportHistoryItem {
  id: string
  attemptedAt: string
  uploadType: UploadType
  fileName: string
  success: boolean
  importedRows: number
  failedRows: number
  message: string
}

interface TemplateHeaderRule {
  label: string
  aliases: string[]
}

const conflictingTemplateHeaders: Record<UploadType, TemplateHeaderRule[]> = {
  'we-space': [
    {
      label: 'Space scope',
      aliases: ['space_scope', 'space_type', 'scope'],
    },
    {
      label: 'FieldContext target',
      aliases: ['field_context_name', 'context_name'],
    },
    {
      label: 'Pulse type',
      aliases: ['pulse_type'],
    },
  ],
  'field-context': [
    {
      label: 'Pulse type',
      aliases: ['pulse_type'],
    },
    {
      label: 'Pulse metadata',
      aliases: ['status', 'horizon', 'resource_type'],
    },
  ],
  pulse: [],
}

const uploadDescriptions: Record<UploadType, string> = {
  'we-space':
    'Create or reuse collaborative WeSpaces by lowercase name matching.',
  'field-context':
    "Create FieldContexts in an existing or newly created WeSpace, or place them inside the user's MeSpace.",
  pulse:
    'Create pulses in a FieldContext. Missing WeSpaces or FieldContexts are created first when allowed.',
}

const sampleTemplates: Record<
  UploadType,
  {
    fileName: string
    description: string
    rows: Array<Record<string, string>>
  }
> = {
  'we-space': {
    fileName: 'we-space-template.xlsx',
    description: 'Creates or matches WeSpaces by lowercase name.',
    rows: [
      {
        name: 'collective-growth',
        visibility: 'public',
        description: 'Community collaboration hub',
      },
      {
        name: 'research-lab',
        visibility: 'private',
        description: 'Private coordination space',
      },
    ],
  },
  'field-context': {
    fileName: 'field-context-template.xlsx',
    description:
      'Use space_scope to target me-space or we-space. Include we_space_name for we-space rows.',
    rows: [
      {
        name: 'habit-reflection',
        space_scope: 'me-space',
        we_space_name: '',
        description: 'Personal reflection context',
      },
      {
        name: 'project-planning',
        space_scope: 'we-space',
        we_space_name: 'collective-growth',
        description: 'Planning context for team projects',
      },
    ],
  },
  pulse: {
    fileName: 'pulse-template.xlsx',
    description:
      'Requires title, content, space_scope, and field_context_name. pulse_type only accepts goal, story, or resource. we_space_name is required for we-space rows.',
    rows: [
      {
        title: 'weekly-standup',
        content: 'Shared blockers and wins',
        space_scope: 'we-space',
        we_space_name: 'collective-growth',
        field_context_name: 'project-planning',
        pulse_type: 'story',
        status: 'active',
        horizon: 'short-term',
        resource_type: '',
        intensity: '',
        availability: '',
        source_type: '',
      },
      {
        title: 'journal-entry',
        content: 'Today I felt centered',
        space_scope: 'me-space',
        we_space_name: '',
        field_context_name: 'habit-reflection',
        pulse_type: 'story',
        status: '',
        horizon: '',
        resource_type: '',
        intensity: 'high',
        availability: 'private',
        source_type: 'reflection',
      },
    ],
  },
}

const promiseLabels: Record<UploadType, string> = {
  'we-space': 'WeSpaces',
  'field-context': 'Field Contexts',
  pulse: 'Pulses',
}

const requiredTemplateHeaders: Record<UploadType, TemplateHeaderRule[]> = {
  'we-space': [
    {
      label: 'WeSpace name',
      aliases: ['name', 'we_space_name', 'space_name'],
    },
  ],
  'field-context': [
    {
      label: 'FieldContext name',
      aliases: ['name', 'title', 'field_context_name', 'context_name'],
    },
    {
      label: 'Space scope',
      aliases: ['space_scope', 'space_type', 'scope'],
    },
  ],
  pulse: [
    {
      label: 'Pulse title',
      aliases: ['title', 'name'],
    },
    {
      label: 'Pulse content',
      aliases: ['content', 'description', 'details'],
    },
    {
      label: 'FieldContext name',
      aliases: ['field_context_name', 'context_name'],
    },
    {
      label: 'Space scope',
      aliases: ['space_scope', 'space_type', 'scope'],
    },
  ],
}

const IMPORT_HISTORY_STORAGE_KEY = 'gp-xlsx-import-history'

function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function validateTemplateHeaders(
  uploadType: UploadType,
  headers: string[]
): string[] {
  const normalizedHeaders = new Set(
    headers.map((header) => normalizeHeader(header))
  )

  const missingRules = requiredTemplateHeaders[uploadType].filter((rule) => {
    return !rule.aliases.some((alias) =>
      normalizedHeaders.has(normalizeHeader(alias))
    )
  })

  const conflictingRules = conflictingTemplateHeaders[uploadType].filter(
    (rule) => {
      return rule.aliases.some((alias) =>
        normalizedHeaders.has(normalizeHeader(alias))
      )
    }
  )

  if (missingRules.length === 0 && conflictingRules.length === 0) {
    return []
  }

  return [`This file does not match the ${uploadType} template.`]
}

function buildTemplateMismatchResult(
  uploadType: UploadType,
  errors: string[]
): ImportResult {
  return {
    success: false,
    message: `Template mismatch: the uploaded XLSX file is not a valid ${uploadType} template.`,
    importedRows: 0,
    failedRows: errors.length,
    warnings: [],
    errors: errors.map((message, index) => ({
      row: index + 1,
      message,
      data: {},
    })),
    summary: {
      createdWeSpaces: 0,
      reusedWeSpaces: 0,
      createdFieldContexts: 0,
      reusedFieldContexts: 0,
      createdPulses: 0,
    },
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize)
    binary += String.fromCharCode(...Array.from(chunk))
  }

  return btoa(binary)
}

export default function DashboardImportPage() {
  const { user } = useApp()
  const { setPageTitle } = usePageContext()
  const [uploadType, setUploadType] = useState<UploadType>('we-space')
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [workbookBase64, setWorkbookBase64] = useState('')
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [history, setHistory] = useState<ImportHistoryItem[]>([])

  useEffect(() => {
    setPageTitle('Entity Upload')
  }, [setPageTitle])

  useEffect(() => {
    try {
      const persisted = window.localStorage.getItem(IMPORT_HISTORY_STORAGE_KEY)
      if (!persisted) {
        return
      }

      const parsed = JSON.parse(persisted) as ImportHistoryItem[]
      if (Array.isArray(parsed)) {
        setHistory(parsed)
      }
    } catch {
      setHistory([])
    }
  }, [])

  const summaryItems = useMemo(() => {
    if (!result) {
      return []
    }

    return [
      { label: 'Created WeSpaces', value: result.summary.createdWeSpaces },
      { label: 'Matched WeSpaces', value: result.summary.reusedWeSpaces },
      {
        label: 'Created Field Contexts',
        value: result.summary.createdFieldContexts,
      },
      {
        label: 'Matched Field Contexts',
        value: result.summary.reusedFieldContexts,
      },
      { label: 'Created Pulses', value: result.summary.createdPulses },
    ]
  }, [result])

  function saveHistoryEntry(entry: ImportHistoryItem) {
    setHistory((previous) => {
      const next = [entry, ...previous].slice(0, 6)
      window.localStorage.setItem(
        IMPORT_HISTORY_STORAGE_KEY,
        JSON.stringify(next)
      )
      return next
    })
  }

  function downloadTemplate(type: UploadType) {
    const template = sampleTemplates[type]
    const worksheet = XLSX.utils.json_to_sheet(template.rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
    const workbookArray = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([workbookArray], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = objectUrl
    link.setAttribute('download', template.fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(objectUrl)

    toast.success(`${template.fileName} downloaded.`)
  }

  async function readFile(file: File): Promise<{
    base64: string
    preview: ImportPreview
  }> {
    const fileBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(fileBuffer, { type: 'array', raw: false })
    const firstSheetName = workbook.SheetNames[0]

    if (!firstSheetName) {
      throw new Error('This XLSX file has no worksheet. Add a sheet and retry.')
    }

    const worksheet = workbook.Sheets[firstSheetName]
    const headerRows = XLSX.utils.sheet_to_json<(string | number)[]>(
      worksheet,
      {
        header: 1,
        blankrows: false,
        raw: false,
      }
    )

    const parsedRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      {
        defval: '',
        raw: false,
      }
    )

    const firstRow = headerRows[0] || []
    const headers = firstRow
      .map((value) => normalizeHeader(String(value ?? '')))
      .filter((value) => value.length > 0)

    return {
      base64: arrayBufferToBase64(fileBuffer),
      preview: {
        fileName: file.name,
        headers,
        rowCount: parsedRows.length,
      },
    }
  }

  async function handleFileSelection(file?: File | null) {
    if (!file) {
      return
    }

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      toast.error('Only XLSX files are supported on this page.')
      return
    }

    if (!user?.id) {
      toast.error('You must be logged in to import data.')
      return
    }

    setIsSubmitting(true)

    try {
      const { base64, preview } = await readFile(file)
      const templateErrors = validateTemplateHeaders(
        uploadType,
        preview.headers
      )

      if (templateErrors.length > 0) {
        setPreview(preview)
        setWorkbookBase64('')
        setResult(buildTemplateMismatchResult(uploadType, templateErrors))
        toast.error(
          `Template mismatch: please upload a ${uploadType} template for this import mode.`
        )
        return
      }

      setWorkbookBase64(base64)
      setResult(null)
      setPreview(preview)

      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null

      const response = await fetch('/api/import/xlsx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: user.id,
          uploadType,
          workbookBase64: base64,
        }),
      })

      const payload = (await response.json()) as ImportResult & {
        error?: string
      }

      if (!response.ok && !payload.errors) {
        throw new Error(
          payload.error || 'The import failed before any rows were processed.'
        )
      }

      setResult(payload)
      saveHistoryEntry({
        id: crypto.randomUUID(),
        attemptedAt: new Date().toISOString(),
        uploadType,
        fileName: preview.fileName,
        success: payload.success,
        importedRows: payload.importedRows,
        failedRows: payload.failedRows,
        message: payload.message,
      })

      if (payload.success) {
        toast.success(payload.message)
      } else if (payload.importedRows > 0) {
        toast.warning(payload.message)
      } else {
        toast.error(payload.message || payload.error || 'Import failed.')
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not import XLSX file.'
      setPreview(null)
      setWorkbookBase64('')
      setResult(null)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex flex-1 overflow-y-auto pt-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-0 h-96 w-96 rounded-full bg-gp-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-8%] right-[-8%] h-128 aspect-square rounded-full bg-gp-accent-glow/10 blur-[140px]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-12 lg:px-10 py-8">
        <section className="grid gap-10 lg:grid-cols-[minmax(280px,360px),1fr]">
          <div className="space-y-6 rounded-4xl border border-white/40 bg-white/55 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-[0.35em] text-gp-primary">
                Transmutation Portal
              </span>
              <h1 className="max-w-sm text-4xl font-black tracking-tight text-gp-ink-strong dark:text-white">
                Expand your community
              </h1>
              <p className="text-sm leading-6 text-gp-ink-muted dark:text-white/65">
                {uploadDescriptions[uploadType]}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gp-ink-muted dark:text-white/45">
                Download XLSX Templates
              </p>
              <div className="space-y-2">
                {(['we-space', 'field-context', 'pulse'] as UploadType[]).map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => downloadTemplate(type)}
                      className="flex w-full cursor-pointer items-start justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3 text-left text-sm text-gp-ink-strong transition hover:bg-white dark:bg-white/6 dark:text-white/85 dark:hover:bg-white/10"
                    >
                      <div>
                        <p className="font-bold">
                          {promiseLabels[type]} template
                        </p>
                        <p className="mt-1 text-xs text-gp-ink-muted dark:text-white/60">
                          {sampleTemplates[type].description}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-base text-gp-primary self-center">
                        download
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-950 px-5 py-4 text-sm text-white shadow-2xl dark:bg-slate-100 dark:text-slate-900">
              <p className="font-bold uppercase tracking-[0.24em] text-white/60 dark:text-slate-600">
                Import Rules
              </p>
              <p className="mt-3 leading-6 text-white/80 dark:text-slate-700">
                Existing names are matched in lowercase. If a pulse or
                field-context row points to a missing WeSpace or FieldContext,
                the importer creates it first when you have access.
              </p>
            </div>
          </div>

          <div className="space-y-6 rounded-4xl border border-white/40 bg-white/60 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-gp-ink-muted dark:text-white/45">
                  Import Type
                </p>
                <p className="mt-2 text-sm text-gp-ink-muted dark:text-white/65">
                  Switch the importer mode before uploading a file.
                </p>
              </div>
              <Link
                href="/protected/dashboard"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/50 bg-white/75 px-4 py-2 text-sm font-semibold text-gp-ink-strong transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <span className="material-symbols-outlined text-base">
                  arrow_back
                </span>
                Back to Dashboard
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {(['we-space', 'field-context', 'pulse'] as UploadType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUploadType(type)}
                    className={`cursor-pointer rounded-3xl px-4 py-4 text-left transition ${
                      uploadType === type
                        ? 'bg-slate-950 text-white shadow-2xl dark:bg-white dark:text-slate-900'
                        : 'bg-white/75 text-gp-ink-strong hover:bg-white dark:bg-white/6 dark:text-white/80 dark:hover:bg-white/10'
                    }`}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.24em]">
                      {promiseLabels[type]}
                    </p>
                    <p className="mt-2 text-sm leading-6 opacity-80">
                      {uploadDescriptions[type]}
                    </p>
                  </button>
                )
              )}
            </div>

            <label
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDrop={(event) => {
                event.preventDefault()
                setIsDragging(false)
                void handleFileSelection(event.dataTransfer.files?.[0])
              }}
              className={`group relative flex min-h-80 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-4xl border-2 border-dashed p-8 text-center transition ${
                isDragging
                  ? 'border-gp-primary bg-gp-primary/10 dark:bg-gp-primary/15'
                  : 'border-slate-200/90 bg-white dark:border-white/15 dark:bg-slate-900/80'
              }`}
            >
              <div className="absolute inset-0 bg-transparent" />
              <div className="relative z-10 flex flex-col items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gp-primary text-white">
                  <span className="material-symbols-outlined text-4xl">
                    cloud_upload
                  </span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight text-gp-ink-strong dark:text-white">
                    Onboard entities
                  </h2>
                  <p className="mx-auto max-w-md text-sm leading-6 text-gp-ink-muted dark:text-white/65">
                    Drag and drop an XLSX file or browse locally. The importer
                    validates membership, creates missing records when allowed,
                    and returns row-level failure details.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-xl dark:bg-white dark:text-slate-900">
                  <span className="material-symbols-outlined text-base">
                    folder_open
                  </span>
                  Browse Local Files
                </div>
              </div>
              <input
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(event) => {
                  void handleFileSelection(event.target.files?.[0])
                }}
              />
            </label>

            {preview && (
              <div className="rounded-3xl bg-white/80 p-5 shadow-sm dark:bg-white/6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-gp-ink-muted dark:text-white/45">
                      Loaded File
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-gp-ink-strong dark:text-white">
                      {preview.fileName}
                    </h3>
                    <p className="mt-1 text-sm text-gp-ink-muted dark:text-white/65">
                      {preview.rowCount} rows detected
                    </p>
                  </div>
                  {isSubmitting && (
                    <div className="inline-flex cursor-wait items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-bold text-white shadow-xl">
                      <span className="material-symbols-outlined animate-spin text-base">
                        sync
                      </span>
                      Importing...
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => downloadTemplate(uploadType)}
                    disabled={isSubmitting}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-white/10 dark:text-white/85 dark:hover:bg-white/15"
                  >
                    <span className="material-symbols-outlined text-sm">
                      download
                    </span>
                    Download {promiseLabels[uploadType]} Template
                  </button>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {preview.headers.map((header) => (
                    <span
                      key={header}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-white/70"
                    >
                      {header}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {result && (
          <section className="space-y-5 rounded-4xl border border-white/40 bg-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-gp-ink-muted dark:text-white/45">
                  Import Outcome
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-gp-ink-strong dark:text-white">
                  {result.message}
                </h2>
              </div>
              <div
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  result.success
                    ? 'bg-emerald-100 text-emerald-700'
                    : result.importedRows > 0
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                }`}
              >
                {result.importedRows} imported, {result.failedRows} failed
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-5">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl bg-slate-950/95 px-4 py-4 text-white"
                >
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-white/60">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-black">{item.value}</p>
                </div>
              ))}
            </div>

            {result.warnings.length > 0 && (
              <div className="rounded-3xl bg-amber-50 p-5 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
                <p className="font-bold uppercase tracking-[0.22em]">
                  Warnings
                </p>
                <div className="mt-3 space-y-2">
                  {result.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-gp-ink-muted dark:text-white/45">
                  Row Errors
                </p>
                <div className="space-y-3">
                  {result.errors.map((error) => (
                    <div
                      key={`${error.row}-${error.message}`}
                      className="rounded-3xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-400/20 dark:bg-rose-500/10"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-black uppercase tracking-[0.22em] text-rose-700 dark:text-rose-200">
                          Row {error.row}
                        </p>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-white/10 dark:text-rose-200">
                          Failed
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-rose-900 dark:text-rose-100">
                        {error.message}
                      </p>
                      {Object.keys(error.data).length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {Object.entries(error.data).map(([key, value]) => (
                            <span
                              key={`${error.row}-${key}`}
                              className="rounded-full bg-white px-3 py-1 text-xs text-slate-700 dark:bg-white/10 dark:text-white/70"
                            >
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="rounded-4xl border border-white/40 bg-white/65 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-gp-ink-muted dark:text-white/45">
                Recent Attempts
              </p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-gp-ink-strong dark:text-white">
                Import history
              </h2>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setHistory([])
                  window.localStorage.removeItem(IMPORT_HISTORY_STORAGE_KEY)
                }}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-50 dark:border-white/20 dark:bg-white/10 dark:text-white/85 dark:hover:bg-white/15"
              >
                <span className="material-symbols-outlined text-sm">
                  delete
                </span>
                Clear
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="mt-4 text-sm text-gp-ink-muted dark:text-white/65">
              No import attempts yet. Your next run will appear here.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/40 bg-white/75 px-4 py-3 dark:border-white/10 dark:bg-white/6"
                >
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gp-ink-muted dark:text-white/50">
                      {promiseLabels[item.uploadType]} -{' '}
                      {new Date(item.attemptedAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gp-ink-strong dark:text-white/90">
                      {item.fileName}
                    </p>
                    <p className="mt-1 text-xs text-gp-ink-muted dark:text-white/65">
                      {item.message}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        item.success
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100'
                          : item.importedRows > 0
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-100'
                      }`}
                    >
                      {item.success
                        ? 'Success'
                        : item.importedRows > 0
                          ? 'Partial'
                          : 'Failed'}
                    </span>
                    <p className="mt-2 text-xs font-semibold text-gp-ink-muted dark:text-white/60">
                      {item.importedRows} imported - {item.failedRows} failed
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
