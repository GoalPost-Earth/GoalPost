# Pulse Type Suggestion Feature

## Overview

When a user enters text into the offering input, the system now shows an AI-powered pulse type suggestion interface. This interface allows users to:

1. **See AI Classification** - The AI analyzes the input and suggests a pulse type (Goal, Resource, or Story)
2. **Edit the Pulse Name** - Modify the suggested name generated from the input
3. **Refine the Type** - Click the "Refine Type" button to cycle through different pulse types if the AI classification isn't right
4. **Confirm & Create** - Click "Create Pulse" to finalize the pulse with the selected type and name

## Components

### `PulseTypeSuggestion` Component
**Location**: `src/components/ui/pulse-type-suggestion.tsx`

This is the main suggestion modal component that:
- Uses dummy AI inference (keyword-based heuristics) to classify input
- Displays the appropriate icon for the pulse type (flag=goal, diamond=resource, auto_stories=story)
- Allows users to edit the suggested name
- Provides interpretation of why the AI made that classification
- Supports dark and light modes

**Key Features**:
- Automatic name generation from user input
- Type cycling via "Refine Type" button
- Animated entrance/exit with GSAP
- Glass-panel styling with gradient overlays
- Responsive feedback to user interactions

### `OfferingInput` Component Updates
**Location**: `src/components/ui/offering-input.tsx`

Updates to integrate the suggestion flow:
- Now opens the suggestion modal on input submission
- Passes the input text to the suggestion component
- Updated `onSubmit` callback signature to include `(value, type, name)`

## Dummy AI Inference Logic

The system uses keyword-based heuristics to classify input:

### Goal Indicators
Keywords like: "achieve", "complete", "target", "improve", "grow", "build", "develop", "learn"

### Resource Indicators
Keywords like: "tool", "resource", "material", "data", "file", "library", "framework", "code", "api"

### Story Indicators
Keywords like: "journey", "experience", "story", "narrative", "lesson", "insight", "discovered", "realized"

The component scores each category and returns the highest scoring type.

## Icon Mapping

- **Goal**: `flag` icon (cyan/blue - `gp-goal`)
- **Resource**: `diamond` icon (green - `gp-resource`)
- **Story**: `auto_stories` icon (purple - `gp-story`)

## Flow

```
User Input
    ↓
Submit Button Clicked
    ↓
OfferingInput → setShowSuggestion(true)
    ↓
PulseTypeSuggestion Modal Opens
    ↓
Dummy AI Infers Type & Generates Name
    ↓
User Can:
  a) Edit the name
  b) Refine/cycle the type
  c) Confirm and create pulse
    ↓
onSelect Callback Triggered
    ↓
Modal Closes, Input Clears
```

## Styling

The component uses:
- **Glass Panel Effect**: Semi-transparent background with backdrop blur
- **Gradient Overlays**: Animated gradient blobs for visual interest
- **Type-Specific Colors**: Different accent colors based on pulse type
- **Dark/Light Mode**: Full support via Tailwind dark mode classes
- **Smooth Animations**: GSAP animations for entrance/exit and interactions

## Future Enhancements

When AI is integrated:
1. Replace `inferPulseType()` function with actual LLM call
2. Add loading state during AI processing
3. Enhance interpretation explanation with more context
4. Support for multiple type suggestions with confidence scores
5. Learn from user corrections to improve inference

## Integration Points

The feature is currently integrated with:
- Page: `src/app/protected/fields/[space]/[id]/page.tsx`
- The page receives `(value, type, name)` in the submission handler
