'use client'

import { ReactNode, useState, useEffect } from 'react'
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-primary text-[20px]">
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

function SettingCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl p-4 transition-all duration-300 border bg-gp-glass-bg border-gp-glass-border shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
      {children}
    </div>
  )
}

function SettingToggle({
  label,
  description,
  active = true,
  onToggle,
}: SettingToggleProps) {
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
    <SettingCard>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-slate-800 dark:text-white">
            {label}
          </h4>
          <p className="text-[11px] text-text-muted dark:text-gp-ink-soft mt-0.5 leading-snug">
            {description}
          </p>
        </div>
        <Switch checked={isActive} onCheckedChange={handleToggle} />
      </div>
    </SettingCard>
  )
}

function SettingSwatch({
  color,
  ring,
  themeColor,
  onClick,
}: SettingSwatchProps) {
  return (
    <div
      className={`w-8 h-8 rounded-full border-2 shadow-sm cursor-pointer transition-transform hover:scale-110 ${
        ring
          ? 'ring-2 ring-[color-mix(in_srgb,var(--gp-primary)_85%,white_15%)] ring-offset-4 ring-offset-white dark:ring-offset-gray-900'
          : ''
      }`}
      style={{ backgroundColor: color, borderColor: 'rgba(255,255,255,0.2)' }}
      aria-label={`Theme color ${themeColor}`}
      onClick={onClick}
    />
  )
}

export default function SettingsPage() {
  const { themeColor, setThemeColor } = useTheme()
  const { animationsEnabled, setAnimationsEnabled } = useAnimations()
  const {
    aiMode,
    setAiMode,
    resonanceLinkageEnabled,
    setResonanceLinkageEnabled,
  } = usePreferences()

  const themeColors: Array<{ color: string; themeColor: ThemeColor }> = [
    { color: '#0A84FF', themeColor: 'default' },
    { color: '#FFD60A', themeColor: 'warm' },
    { color: '#30D158', themeColor: 'forest' },
    { color: '#BF5AF2', themeColor: 'purple' },
    { color: '#10b981', themeColor: 'emerald' },
  ]

  return (
    <div
      className="relative min-h-screen overflow-y-auto overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors pt-20"
      style={{
        backgroundImage: `
        radial-gradient(at 18% 18%, color-mix(in srgb, var(--gp-primary) 12%, transparent) 0, transparent 55%),
        radial-gradient(at 82% 16%, color-mix(in srgb, var(--gp-accent-glow) 12%, transparent) 0, transparent 55%),
        radial-gradient(at 80% 85%, color-mix(in srgb, var(--gp-goal) 10%, transparent) 0, transparent 60%),
        radial-gradient(at 16% 86%, color-mix(in srgb, var(--gp-resource) 12%, transparent) 0, transparent 60%)
      `,
      }}
    >
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -top-40 -left-40 w-[320px] h-80 rounded-full bg-gp-primary/12 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[320px] h-80 rounded-full bg-gp-accent-glow/12 blur-[120px]" />
      </div>

      <main className="relative w-full max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-14 bg-gp-glass-bg border border-gp-glass-border shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
          <div className="relative z-10 flex flex-col gap-10">
            <div className="text-center mb-2">
              <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2">
                User Settings
              </h1>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gp-ink-muted dark:text-gp-ink-soft">
                Personalize your Field experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SettingSection icon="palette" title="Appearance">
                <SettingCard>
                  <label className="text-[10px] font-bold text-gp-ink-muted dark:text-gp-ink-soft block mb-4 uppercase tracking-[0.18em]">
                    Theme Color Selector
                  </label>
                  <div className="flex items-center gap-4">
                    {themeColors.map(({ color, themeColor: theme }) => (
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
                <SettingCard>
                  <AssistantModeSelector
                    currentMode={aiMode}
                    onModeChange={setAiMode}
                  />
                </SettingCard>
              </SettingSection>

              <SettingSection icon="hub" title="Coherence">
                <SettingToggle
                  label="Resonance Linkage"
                  description="Show patterns within fields"
                  active={resonanceLinkageEnabled}
                  onToggle={setResonanceLinkageEnabled}
                />
              </SettingSection>
            </div>
          </div>

          <div className="absolute top-10 right-10 size-16 rounded-full bg-gp-primary/12 border border-gp-glass-border backdrop-blur-sm pointer-events-none" />
          <div className="absolute bottom-16 left-10 size-12 rounded-full bg-gp-accent-glow/12 border border-gp-glass-border backdrop-blur-sm pointer-events-none" />
        </div>
      </main>
    </div>
  )
}
