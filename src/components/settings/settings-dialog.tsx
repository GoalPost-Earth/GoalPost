'use client'

import { ReactNode, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useTheme, ThemeColor } from '@/contexts/theme-context'
import { useAnimations } from '@/contexts/animation-context'
import { usePreferences } from '@/contexts/preferences-context'
import { AssistantModeSelector } from '@/components/chat/assistant-mode-selector'

type SettingSectionProps = {
  icon: string
  title: string
  children: ReactNode
}

type SettingToggleProps = {
  label: string
  description: string
  active?: boolean
  onToggle?: (active: boolean) => void
}

type SettingSwatchProps = {
  color: string
  ring?: boolean
  themeColor: ThemeColor
  onClick: () => void
}

function SettingSection({ icon, title, children }: SettingSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-gp-primary text-[20px]">
          {icon}
        </span>
        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-gp-ink-muted dark:text-gp-ink-soft">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

function SettingCard({
  children,
  ...props
}: {
  children: ReactNode
  [key: string]: unknown
}) {
  return (
    <div
      className="rounded-2xl p-4 border bg-gp-glass-bg border-gp-glass-border backdrop-blur-2xl transition-all duration-300"
      {...props}
    >
      {children}
    </div>
  )
}

function SettingToggle({
  label,
  description,
  active = true,
  onToggle,
  ...props
}: SettingToggleProps & { [key: string]: unknown }) {
  const [isActive, setIsActive] = useState(active)

  // Sync local state with prop when it changes (e.g., after context rehydration)
  useEffect(() => {
    setIsActive(active)
  }, [active])

  const handleToggle = (newState: boolean) => {
    setIsActive(newState)
    onToggle?.(newState)
  }

  return (
    <SettingCard {...props}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-medium text-gp-ink-strong dark:text-white">
            {label}
          </h4>
          <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft mt-0.5 leading-snug">
            {description}
          </p>
        </div>
        <Switch checked={isActive} onCheckedChange={handleToggle} />
      </div>
    </SettingCard>
  )
}

function SettingSwatch({ color, ring, themeColor, onClick }: SettingSwatchProps) {
  return (
    <button
      type="button"
      className={`size-8 rounded-full border-2 shadow-sm cursor-pointer transition-transform hover:scale-110 ${
        ring
          ? 'ring-2 ring-[color-mix(in_srgb,var(--gp-primary)_85%,white_15%)] ring-offset-4 ring-offset-gp-surface dark:ring-offset-gp-surface-dark'
          : ''
      }`}
      style={{ backgroundColor: color, borderColor: 'rgba(255,255,255,0.2)' }}
      aria-label={`Theme color ${themeColor}`}
      onClick={onClick}
    />
  )
}

const THEME_COLORS: Array<{ color: string; themeColor: ThemeColor }> = [
  { color: '#0A84FF', themeColor: 'default' },
  { color: '#FFD60A', themeColor: 'warm' },
  { color: '#30D158', themeColor: 'forest' },
  { color: '#BF5AF2', themeColor: 'purple' },
  { color: '#10b981', themeColor: 'emerald' },
]

export interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { themeColor, setThemeColor } = useTheme()
  const { animationsEnabled, setAnimationsEnabled } = useAnimations()
  const {
    aiMode,
    setAiMode,
    resonanceLinkageEnabled,
    setResonanceLinkageEnabled,
  } = usePreferences()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto gp-glass border-gp-glass-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong">
            User Settings
          </DialogTitle>
          <DialogDescription className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gp-ink-muted dark:text-gp-ink-soft">
            Personalize your Field experience
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <SettingSection icon="palette" title="Appearance">
            <SettingCard data-tour="settings-appearance">
              <label className="text-[10px] font-bold text-gp-ink-muted dark:text-gp-ink-soft block mb-4 uppercase tracking-[0.18em]">
                Theme Color Selector
              </label>
              <div className="flex items-center gap-4">
                {THEME_COLORS.map(({ color, themeColor: theme }) => (
                  <SettingSwatch
                    key={theme}
                    color={color}
                    themeColor={theme}
                    ring={themeColor === theme}
                    onClick={() => setThemeColor(theme)}
                  />
                ))}
              </div>
              <p className="mt-4 text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
                Choose a primary essence for your atmosphere.
              </p>
            </SettingCard>
          </SettingSection>

          <SettingSection icon="motion_blur" title="Dynamics">
            <SettingToggle
              label="Animations"
              description="Fluid UI transitions and field drifts"
              active={animationsEnabled}
              onToggle={setAnimationsEnabled}
              data-tour="settings-animations"
            />
            <SettingToggle
              label="Haptic Echo"
              description="Subtle feedback on gesture interaction"
              active={false}
            />
          </SettingSection>

          <SettingSection icon="sensors" title="Presence">
            <SettingToggle
              label="Field Notifications"
              description="Real-time alerts for community activity"
              active
            />
          </SettingSection>

          <SettingSection icon="smart_toy" title="AI Assistant">
            <SettingCard data-tour="settings-ai-mode">
              <AssistantModeSelector
                currentMode={aiMode}
                onModeChange={setAiMode}
              />
            </SettingCard>
          </SettingSection>

          <SettingSection icon="hub" title="Coherence">
            <SettingCard data-tour="settings-resonance">
              <SettingToggle
                label="Resonance Linkage"
                description="Show patterns within fields"
                active={resonanceLinkageEnabled}
                onToggle={setResonanceLinkageEnabled}
              />
            </SettingCard>
          </SettingSection>
        </div>
      </DialogContent>
    </Dialog>
  )
}
