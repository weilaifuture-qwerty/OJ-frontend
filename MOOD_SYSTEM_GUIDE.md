# Discord-Style Mood/Status System

## Overview
The OnlineJudge platform now features a Discord-style mood/status system that allows users to express their current activity, mood, or status with emojis and custom messages.

## Features

### 1. **Status Types**
- **Online** (Green dot) - Active and available
- **Idle** (Yellow crescent) - Away or inactive
- **Do Not Disturb** (Red with line) - Busy, don't want to be disturbed
- **Invisible** (Gray outline) - Appear offline to others

### 2. **Mood Components**
- **Emoji Selection**: Quick picker with common emojis + extended emoji library
- **Status Message**: Custom text message (up to 100 characters)
- **Auto-clear Options**: Set status to clear after 30 min, 1 hour, 4 hours, today, or this week

### 3. **Display Locations**
- **Navbar**: Shows current status next to user menu
- **User Profile**: Displays mood with emoji in user home page
- **Anywhere**: Use MoodDisplay component to show user moods

## Components

### MoodStatus Component (`/src/pages/oj/components/MoodStatus.vue`)
Main component for setting and displaying status in the navbar.

**Features:**
- Click to open status modal
- Shows current status indicator (online/idle/busy/invisible)
- Displays emoji and message
- Real-time preview while editing

### MoodDisplay Component (`/src/pages/oj/components/MoodDisplay.vue`)
Lightweight component for displaying mood in other parts of the app.

```vue
<MoodDisplay 
  :mood="userProfile.mood"
  :emoji="userProfile.mood_emoji"
/>
```

## Usage Guide

### For Users

1. **Set Your Status**
   - Click on your current status in the navbar (next to your username)
   - Choose status type (Online, Idle, Do Not Disturb, Invisible)
   - Select an emoji from quick picker or browse all emojis
   - Type your status message
   - Choose when to auto-clear (optional)
   - Click Save

2. **Clear Status**
   - Open status modal
   - Click "Clear Status" button

3. **Quick Status Ideas**
   - 🎯 "Focusing on algorithms"
   - 💻 "Coding contest prep"
   - 📚 "Studying data structures"
   - ☕ "On a break"
   - 🚀 "Solving problems"
   - 😴 "Away from keyboard"

### For Developers

#### Display User Mood
```vue
<template>
  <div class="user-card">
    <img :src="user.avatar" />
    <h3>{{ user.username }}</h3>
    <MoodDisplay 
      v-if="user.mood || user.mood_emoji"
      :mood="user.mood"
      :emoji="user.mood_emoji"
    />
  </div>
</template>

<script>
import MoodDisplay from '@/pages/oj/components/MoodDisplay.vue'

export default {
  components: { MoodDisplay }
}
</script>
```

#### Access Current User's Mood
```javascript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const currentMood = computed(() => ({
  status: userStore.profile?.status || 'online',
  emoji: userStore.profile?.mood_emoji || '',
  message: userStore.profile?.mood || ''
}))
```

## API Integration

### Update Status
```javascript
await api.updateProfile({
  status: 'busy',              // online, idle, busy, invisible
  mood: 'Working on problems', // Status message
  mood_emoji: '💻',           // Emoji
  mood_clear_at: '2024-01-01T12:00:00Z' // ISO date for auto-clear
})
```

### Profile Response
```json
{
  "user": {
    "username": "john_doe"
  },
  "status": "online",
  "mood": "Solving problems",
  "mood_emoji": "🚀",
  "mood_clear_at": null
}
```

## Database Fields Required

Add these fields to the user profile model:
- `status` - CharField with choices: online, idle, busy, invisible (default: online)
- `mood` - CharField, max 100 characters (nullable)
- `mood_emoji` - CharField, max 10 characters (nullable)
- `mood_clear_at` - DateTimeField (nullable)

## Styling

### Status Indicators
- **Online**: Solid green circle (#52c41a)
- **Idle**: Yellow crescent moon (#faad14)
- **Busy**: Red circle with white line (#f5222d)
- **Invisible**: Gray outlined circle (#8c8c8c)

### Mood Display
- Rounded pill shape with gray background
- Emoji followed by text
- Truncates long messages with ellipsis
- Responsive sizing

## Future Enhancements

1. **Rich Presence**: Show what problem/contest user is working on
2. **Status History**: View previous status messages
3. **Preset Statuses**: Save frequently used status messages
4. **Team Status**: See status of team members
5. **Status Reactions**: React to other users' status messages
6. **Activity Integration**: Auto-set status based on activity (e.g., "In Contest")

## Troubleshooting

1. **Status not updating**: Ensure `getProfile()` is called after update
2. **Emoji not displaying**: Check browser emoji support
3. **Auto-clear not working**: Backend needs scheduled task to clear expired statuses

The mood system adds a social element to the platform, helping users communicate their availability and current activity to others in the community.