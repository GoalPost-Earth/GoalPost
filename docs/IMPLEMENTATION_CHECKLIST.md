# Multi-Mode Assistant Implementation Checklist

Track your integration progress with this comprehensive checklist.

## 📋 Pre-Implementation (Read This First)

- [ ] Read [MODES_QUICK_REFERENCE.md](./MODES_QUICK_REFERENCE.md) - 3 min
- [ ] Read [ASSISTANT_MODES.md](./ASSISTANT_MODES.md) - 5 min
- [ ] Read [INTEGRATION_GUIDE_MODES.md](./INTEGRATION_GUIDE_MODES.md) - 5 min
- [ ] Review [EXAMPLE_CHAT_INTEGRATION.tsx](./EXAMPLE_CHAT_INTEGRATION.tsx) - 5 min
- [ ] Understand architecture from [MODES_ARCHITECTURE_DIAGRAMS.md](./MODES_ARCHITECTURE_DIAGRAMS.md) - 5 min

**Total time:** ~25 minutes to understand the system

---

## 🏗️ Phase 1: Verification (5 minutes)

Verify the implementation is correct before integrating into UI.

### Backend Files
- [ ] `/src/lib/simulation/system-prompts.ts` exists (contains all 3 modes)
- [ ] `/src/lib/simulation/types.ts` has `AssistantMode` type with 3 values
- [ ] `/src/lib/simulation/state.ts` has `assistantModeManager` singleton
- [ ] `/src/lib/simulation/index.ts` exports `assistantModeManager` and `SYSTEM_PROMPTS`
- [ ] `/src/app/api/chat/simulation/route.ts` imports system prompts
- [ ] API route accepts `mode` parameter in request body

### Frontend Files
- [ ] `/src/components/chat/assistant-mode-selector.tsx` exists
- [ ] Component exports `AssistantModeSelector`
- [ ] Component exports `AssistantModeIndicator`
- [ ] Component exports `AssistantModeInfo`

### Documentation
- [ ] All 6 doc files exist in `/docs`:
  - [ ] `ASSISTANT_MODES.md`
  - [ ] `INTEGRATION_GUIDE_MODES.md`
  - [ ] `MODES_IMPLEMENTATION_SUMMARY.md`
  - [ ] `MODES_QUICK_REFERENCE.md`
  - [ ] `MODES_ARCHITECTURE_DIAGRAMS.md`
  - [ ] `EXAMPLE_CHAT_INTEGRATION.tsx`

---

## 🎨 Phase 2: UI Integration (15 minutes)

Add mode selector to your existing chat UI.

### Import Components
- [ ] Import `AssistantModeSelector` in your chat page/component
- [ ] Import `AssistantModeIndicator` in your chat header/component
- [ ] Import `AssistantMode` type if needed
- [ ] All imports resolve without errors

### Add Mode State
- [ ] Create `mode` state: `const [mode, setMode] = useState<AssistantMode>('default')`
- [ ] Optionally load from localStorage on mount (see integration guide)
- [ ] Optionally save to localStorage on change (see integration guide)

### Add Components to UI
- [ ] Add `<AssistantModeSelector />` to chat UI
  - [ ] Pass `currentMode={mode}`
  - [ ] Pass `onModeChange={setMode}`
  - [ ] Position it visibly (header or control panel)

- [ ] Add `<AssistantModeIndicator />` to chat header
  - [ ] Shows current mode with icon
  - [ ] Positioned near title/heading

- [ ] Optional: Add `<AssistantModeInfo />` somewhere
  - [ ] Help panel for users to understand modes
  - [ ] Could be behind a "?" button

### Test UI Rendering
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to chat page
- [ ] See mode selector dropdown rendered
- [ ] See all 3 modes in dropdown (Standard, Aiden, Braider)
- [ ] See mode indicator showing current mode
- [ ] Dropdown opens without errors
- [ ] No console errors related to components

### Test UI Interaction
- [ ] Click dropdown, see all 3 modes
- [ ] Select different modes
- [ ] Mode indicator updates immediately
- [ ] No console errors on selection

---

## 🔌 Phase 3: API Integration (10 minutes)

Pass mode to API requests.

### Locate Message Sending Code
- [ ] Find where you send messages to `/api/chat/simulation`
- [ ] Could be in a `handleSend()` function, `useChat()` hook, or similar

### Update Request Body
- [ ] Modify request to include `mode` parameter:
  ```typescript
  fetch('/api/chat/simulation', {
    method: 'POST',
    body: JSON.stringify({
      messages: [...],
      mode: currentMode,  // ← Add this line
      config: {...}
    })
  })
  ```

- [ ] Verify `mode` is passed with correct type (string value)
- [ ] Test with browser dev tools → Network tab
  - [ ] Select mode in UI
  - [ ] Send message
  - [ ] View request in Network tab
  - [ ] Verify `"mode":"aiden"` is in request body

### Test Different Modes
- [ ] Select "Standard" mode
  - [ ] Send message like "Tell me about Alice"
  - [ ] Verify response is direct/factual
  - [ ] Check server logs for: `[AssistantMode] Current mode: default`

- [ ] Select "Aiden" mode
  - [ ] Send message
  - [ ] Verify response questions assumptions
  - [ ] Check server logs for: `[AssistantMode] Current mode: aiden`

- [ ] Select "Braider" mode
  - [ ] Send message about difficulty/burnout
  - [ ] Verify response holds space without fixing
  - [ ] Check server logs for: `[AssistantMode] Current mode: braider`

### Monitor API Response
- [ ] Check response headers contain `X-Assistant-Mode: [mode]`
- [ ] Response text reflects the selected mode's voice/tone
- [ ] No API errors (check network tab for 5xx)

---

## ✨ Phase 4: Polish & Features (15 minutes)

Add optional enhancements.

### Persistence (Recommended)
- [ ] Implement localStorage persistence (5 min)
  ```typescript
  useEffect(() => {
    const saved = localStorage.getItem('assistantMode')
    if (saved && ['default', 'aiden', 'braider'].includes(saved)) {
      setMode(saved as AssistantMode)
    }
  }, [])

  const handleModeChange = (newMode: AssistantMode) => {
    setMode(newMode)
    localStorage.setItem('assistantMode', newMode)
  }
  ```
- [ ] Test: Select mode → Refresh page → Mode is still selected ✓

### Mode Information Panel (Optional)
- [ ] Add button to show/hide `<AssistantModeInfo />`
- [ ] Users can read what each mode does
- [ ] Test: Click button, see explanation panel

### Keyboard Shortcuts (Optional)
- [ ] Add shortcuts to switch modes: Ctrl+1 (Standard), Ctrl+2 (Aiden), Ctrl+3 (Braider)
- [ ] Or: Alt+M to open mode selector
- [ ] Test shortcuts work

### Auto-Mode Suggestion (Optional)
- [ ] Implement `suggestMode()` function based on user input (see examples)
- [ ] Show suggestion when user types
- [ ] Users can accept suggestion with one click
- [ ] Test with messages like "Why do we..." → Suggests Aiden

### UI Polish
- [ ] Selector has good spacing/alignment
- [ ] Indicator is visible but not intrusive
- [ ] Colors match your app theme
- [ ] Hover states work on buttons
- [ ] Mobile responsive (if applicable)

---

## 🧪 Phase 5: Testing (10 minutes)

Verify everything works end-to-end.

### Functional Tests
- [ ] Test 1: Standard mode returns factual responses
- [ ] Test 2: Aiden mode questions assumptions
- [ ] Test 3: Braider mode validates difficulty
- [ ] Test 4: Mode persists across page refresh (if implemented)
- [ ] Test 5: Switching modes mid-conversation works
- [ ] Test 6: Tools (search_person, search_community) work in all modes

### Edge Case Tests
- [ ] Long conversation with mode switches
- [ ] Very long responses (>1000 tokens) stream correctly
- [ ] Rapid mode switching doesn't break anything
- [ ] Empty message handling
- [ ] Special characters in messages

### Browser Tests
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile (if applicable)

### Performance Tests
- [ ] Mode switching is instant (no delay)
- [ ] API requests complete in reasonable time
- [ ] Streaming responses feel smooth
- [ ] No memory leaks on repeated mode switches

---

## 📊 Phase 6: Monitoring & Analytics (Optional)

Track usage and performance.

- [ ] Log when mode is changed: timestamp + old mode + new mode
- [ ] Track which modes are most used by users
- [ ] Monitor response times per mode (are any slower?)
- [ ] Collect user satisfaction feedback per mode
- [ ] Dashboard showing mode usage statistics

---

## 🚀 Phase 7: Deployment

Get ready for production.

### Before Deploying
- [ ] All tests passing
- [ ] No console errors in production build
- [ ] Mode state migration plan documented (from singleton to session/DB)
- [ ] Database schema updated (if storing user preference)
- [ ] Environment variables documented

### Deploy Steps
- [ ] Merge code to main branch
- [ ] Run full test suite
- [ ] Build production bundle: `npm run build`
- [ ] Deploy to staging environment
- [ ] Test all modes in staging
- [ ] Deploy to production
- [ ] Monitor for errors in production logs

### Post-Deployment
- [ ] Monitor server logs for `[AssistantMode]` messages
- [ ] Check user feedback for mode issues
- [ ] Track mode usage metrics
- [ ] Be ready to rollback if issues arise

---

## 🎓 Production Readiness

Only complete this section when moving to production with multiple users.

### State Management Migration
- [ ] Decision: Where will mode be stored?
  - [ ] Session/JWT (stateless, recommended)
  - [ ] User database (persistent preference)
  - [ ] Browser localStorage (client-side)
  - [ ] Redis (distributed session)

- [ ] Implement chosen storage strategy
- [ ] Test mode persists correctly
- [ ] Test works across multiple browser tabs/devices (if applicable)

### User Preferences
- [ ] Add mode preference to user profile schema
- [ ] UI to change default mode in settings
- [ ] Export/import user preference if supporting backups

### Documentation for Users
- [ ] Add mode guide to user help/FAQ
- [ ] Create tutorial or video for each mode
- [ ] Document when to use which mode
- [ ] Add tooltips in UI explaining modes

### Operations
- [ ] Add mode to error logging context (helps debugging)
- [ ] Add mode to analytics dashboard
- [ ] Create alerts if mode-specific errors spike
- [ ] Document troubleshooting steps in runbook

---

## ✅ Final Verification Checklist

Before considering implementation "complete":

- [ ] All 3 modes accessible in UI dropdown
- [ ] Each mode produces distinctly different responses
- [ ] Mode persists or loads correctly
- [ ] No console errors or warnings
- [ ] Performance is good (no noticeable lag)
- [ ] Mobile works (if applicable)
- [ ] Documentation is accessible to users
- [ ] Team understands how to use/maintain system
- [ ] Monitoring/analytics in place
- [ ] Runbook/troubleshooting guide exists

---

## 📝 Notes & Issues

Use this section to track any issues or notes during implementation:

```
Issue #1: [Describe issue]
  - Status: [Not Started / In Progress / Resolved]
  - Resolution: [How you fixed it]
  - Date: [When resolved]

Issue #2: [Describe issue]
  - Status: [Not Started / In Progress / Resolved]
  - Resolution: [How you fixed it]
  - Date: [When resolved]
```

---

## 📞 Support Resources

If you get stuck:

1. **Error in components?**
   - Check [MODES_ARCHITECTURE_DIAGRAMS.md](./MODES_ARCHITECTURE_DIAGRAMS.md) Component Composition
   - Review [EXAMPLE_CHAT_INTEGRATION.tsx](./EXAMPLE_CHAT_INTEGRATION.tsx) for proper usage

2. **API not receiving mode?**
   - Verify mode in request body via Network tab
   - Check server logs for `[Chat API]` messages
   - See [MODES_QUICK_REFERENCE.md](./MODES_QUICK_REFERENCE.md) API section

3. **Wrong prompt appearing?**
   - Check `src/lib/simulation/system-prompts.ts` - prompts defined correctly?
   - Verify mode type matches one of: `'default'`, `'aiden'`, `'braider'`
   - Check server logs for mode selection

4. **UI not updating?**
   - Are you using `onModeChange` callback?
   - Is state being updated in parent component?
   - Check React dev tools for state

5. **Persistence not working?**
   - Did you implement localStorage code?
   - Are values being read/written correctly?
   - Check browser console for localStorage errors

---

## 🎉 Completion

When all sections above are checked:

- [ ] Mark this checklist as complete
- [ ] Document any deviations from standard implementation
- [ ] Share learnings with team
- [ ] Archive this checklist
- [ ] Celebrate! 🎉

**Implementation Status:** [Not Started / In Progress / Complete]

**Started:** [Date]
**Completed:** [Date]

**Implemented By:** [Your Name]
**Reviewed By:** [Reviewer Name]

---

**Need more help?** See the detailed guides linked at the top of this checklist.
