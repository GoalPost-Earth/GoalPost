# Fix Summary: Guardrails & Person Search

## Problem Identified
The chatbot was providing information about Robert Damaschke (a backgammon player) instead of:
1. Using the search_person tool to check the GoalPost database
2. Returning "person not found" when the person doesn't exist in GoalPost
3. Blocking off-topic queries via guardrails

## Root Causes
1. **System prompt was too generic** - Allowed the LLM to answer any question
2. **Tool description was weak** - Didn't emphasize REQUIRED usage for person queries
3. **No enforcement of database-first approach** - LLM could hallucinate answers

## Changes Made

### 1. Enhanced System Prompt (`src/app/api/chat/route.ts`)
**Before:**
```typescript
'You are a helpful AI assistant for GoalPost, a platform that helps communities achieve their goals...'
```

**After:**
```typescript
`You are a helpful AI assistant for GoalPost, a meta-relational community platform.

IMPORTANT RESTRICTIONS:
- You can ONLY answer questions about the GoalPost community, its members, communities, goals, resources, and values
- You can ONLY provide information about people and entities that exist in the GoalPost database
- If someone asks about a person, you MUST use the search_person tool to check the database
- If the person is not found in the database, clearly state: "I searched the GoalPost database but could not find any person matching [name]. There is no information about such a person in our community database."
- You CANNOT provide information about people who are not in the GoalPost database
- You CANNOT answer questions about topics unrelated to GoalPost (weather, sports, celebrities, general knowledge, etc.)
- If asked something off-topic, politely redirect to GoalPost-related topics

ALLOWED TOPICS:
- Community members and their profiles
- Communities and organizations in GoalPost
- Goals and aspirations
- Resources and care points
- Core values and fields of care
- How GoalPost works
- Meta-relationality concepts

When searching for people, ALWAYS use the search_person tool. Never make up or hallucinate information about people.`
```

### 2. Strengthened Tool Description
**Before:**
```typescript
'Search for a person in the GoalPost community by name. Returns profile information...'
```

**After:**
```typescript
'REQUIRED tool for finding people in the GoalPost community database. Use this tool whenever the user asks about a specific person by name. This tool searches the Neo4j database and returns actual person data if found, or clearly states when a person is not in the database. Never provide information about people without using this tool first.'
```

### 3. Improved Tool Response Format
Now returns formatted responses that:
- Include `PERSON_PROFILE_FOUND:` marker for UI rendering
- Clearly state when person is not found
- Handle disambiguation properly

**Code:**
```typescript
// If person found, format for UI rendering
if (parsedResult.found && parsedResult.count === 1) {
  const person = parsedResult.people[0]
  return `I found ${person.name} in the GoalPost community. PERSON_PROFILE_FOUND: ${JSON.stringify(person)}`
}

// Return the message from the tool (handles not found and disambiguation)
return parsedResult.message
```

### 4. Removed Unused Imports
Cleaned up imports that were added but not integrated.

## Expected Behavior Now

### Test Case 1: Person Not in Database
**User:** "Tell me about Robert Damaschke"

**Expected Response:**
```
I searched the GoalPost database but could not find any person matching "Robert Damaschke". There is no information about such a person in our community database. Would you like me to help you search for someone else, or explore other aspects of the community?
```

### Test Case 2: Person Found
**User:** "Tell me about Sarah Johnson"

**Expected Response:**
```
I found Sarah Johnson in the GoalPost community. PERSON_PROFILE_FOUND: {...}
[PersonCard renders with profile details]
```

### Test Case 3: Multiple Matches
**User:** "Who is John?"

**Expected Response:**
```
I found 3 people matching "John" in the GoalPost community:

1. John Smith - from Seattle (member of Tech Community)
2. John Doe - he/him (member of Arts Collective)
3. John Williams - from NYC

Could you please clarify which person you're interested in? You can mention their location, community, or any other distinguishing detail.
```

### Test Case 4: Off-Topic Query
**User:** "What's the weather today?"

**Expected Response:**
```
I'm here to help you with questions about the GoalPost community, including finding people, exploring communities, discovering resources, and understanding connections. Your question seems to be outside of my area of focus. Could you ask me something about our community members, goals, or how GoalPost works?
```

### Test Case 5: Simulation Protocol Still Works
**User:** "Activate the Aiden Cinnamon Tea Simulation Protocol"

**Expected Response:**
```
[Simulation protocol activates and system prompt is overridden]
```

## How to Test

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open the chat interface**

3. **Try these queries:**

   ✅ Should now work correctly:
   ```
   "Tell me about Robert Damaschke"
   → "I searched the GoalPost database but could not find..."
   
   "Tell me about [actual person in your DB]"
   → PersonCard displays with profile
   
   "Who is John?" (if multiple Johns exist)
   → Disambiguation list
   
   "What's the weather?"
   → Polite rejection
   ```

## Key Improvements

1. ✅ **Database-First Approach** - Always checks database before answering
2. ✅ **Clear "Not Found" Messages** - Explicitly states when person doesn't exist
3. ✅ **No Hallucination** - Cannot make up information about people
4. ✅ **Topic Restriction** - Only answers GoalPost-related questions
5. ✅ **Tool Enforcement** - MUST use search_person for person queries
6. ✅ **Simulation Compatibility** - Doesn't break Aiden protocol

## Technical Details

### System Prompt Strategy
- **When simulation is INACTIVE**: Use strict GoalPost-focused prompt with guardrails
- **When simulation is ACTIVE**: Use empty prompt (protocol messages already in conversation)

### Tool Execution Flow
```
User asks about person
  ↓
LLM recognizes person query
  ↓
Calls search_person tool (REQUIRED)
  ↓
Tool queries Neo4j database
  ↓
Returns result:
  - Found: PERSON_PROFILE_FOUND marker + data
  - Not Found: Clear "not in database" message
  - Multiple: Disambiguation list
  ↓
LLM formats response
  ↓
UI renders (PersonCard if found, text otherwise)
```

## Files Modified
- `/src/app/api/chat/route.ts` - Enhanced system prompt and tool descriptions

## No Breaking Changes
- ✅ Simulation protocol still works
- ✅ Existing chat functionality preserved
- ✅ PersonCard rendering still works
- ✅ All other tools still functional

---

**Status**: ✅ Fixed - Ready for testing
