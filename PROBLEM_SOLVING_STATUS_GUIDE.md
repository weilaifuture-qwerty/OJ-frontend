# Problem-Solving Status System Guide

## Overview
The OnlineJudge platform features a unique problem-solving focused status system that allows users to share their current coding activities and moods with the community.

## Status Types

### 🎯 **Practicing** (Green Hexagon)
- For when you're actively solving problems
- Suggested messages: "Solving daily problems", "Working on algorithms", "Practicing for contest"

### 📚 **Learning** (Blue Book Shape)
- For when you're studying new concepts
- Suggested messages: "Studying data structures", "Learning new concepts", "Reading algorithm books"

### 🏆 **In Contest** (Red Star)
- For when you're participating in a competition
- Suggested messages: "Live in contest!", "Fighting for the leaderboard", "Racing against time"

### 🐛 **Debugging** (Orange Gear)
- For when you're fixing issues in your code
- Suggested messages: "Fixing edge cases", "Hunting down bugs", "Working on TLE"

### 📝 **Reviewing** (Purple Circle)
- For when you're analyzing solutions
- Suggested messages: "Reviewing solutions", "Analyzing approaches", "Studying editorials"

### ☕ **Taking Break** (Cyan Square)
- For when you need to rest
- Suggested messages: "Taking a break", "Recharging my brain", "Coffee time"

## Features

### 1. **Status Components**
- **Shape Indicator**: Each status has a unique shape (hexagon, book, star, gear, circle, square)
- **Custom Colors**: Choose from preset colors or use a custom color picker
- **Emoji Selection**: Quick picker with problem-solving emojis + extended library
- **Status Message**: Custom text message (up to 100 characters) with smart suggestions
- **Auto-clear Options**: Set status to clear after 30 min, 1 hour, 4 hours, today, or this week

### 2. **Smart Suggestions**
When you select a status type, the system automatically suggests relevant messages:
- Click on any suggestion to use it
- Modify suggestions to personalize them
- Create your own custom messages

### 3. **Display Locations**
- **Navbar**: Shows current status with shape indicator
- **User Profile**: Displays full status with emoji and message
- **Future**: Contest pages, submission lists, leaderboards

## Usage Guide

### Setting Your Status
1. Click on your status indicator in the navbar (next to your username)
2. Choose your current activity type
3. Pick a custom color (optional)
4. Select an emoji that represents your mood
5. Write a status message or use a suggestion
6. Set auto-clear time if desired
7. Preview your status and click Save

### Quick Emoji Guide for Problem Solving
- 💡 New idea or breakthrough
- 🎯 Focused on a specific goal
- 💻 Deep in coding
- 📚 Studying resources
- 🧠 Thinking hard
- ⚡ Fast progress
- 🔥 On fire/doing great
- 💪 Pushing through difficulty
- 🚀 Making rapid progress
- ✅ Just solved something
- 🏆 Achievement unlocked
- 📈 Improving skills

## Future Enhancements

### Auto-Status Integration
- Automatically set "In Contest" when joining a competition
- Show "Practicing" when submitting solutions
- Display problem difficulty being worked on

### Activity Tracking
- Show current problem being solved
- Display submission streak
- Track time spent on problems

### Community Features
- React to others' problem-solving moods
- See team members' current activities
- Share achievements with status updates

## API Integration

### Update Status
```javascript
await api.updateProfile({
  status: 'practicing',           // Status type
  mood: 'Working on DP problems', // Status message
  mood_emoji: '🧠',              // Emoji
  mood_clear_at: '2024-01-01T12:00:00Z', // Auto-clear time
  status_color: '#52c41a'        // Custom color
})
```

### Status in Profile Response
```json
{
  "status": "practicing",
  "mood": "Working on DP problems",
  "mood_emoji": "🧠",
  "mood_clear_at": null,
  "status_color": "#52c41a"
}
```

## Styling Details

### Shape Indicators
- **Hexagon**: Dynamic problem solving
- **Book**: Knowledge acquisition
- **Star**: Competition excellence
- **Gear**: Technical debugging
- **Circle**: Thoughtful review
- **Square**: Structured break

### Color Psychology
- **Green (#52c41a)**: Growth and progress
- **Blue (#1890ff)**: Learning and understanding
- **Red (#f5222d)**: Competition intensity
- **Orange (#fa8c16)**: Problem solving energy
- **Purple (#722ed1)**: Deep thinking
- **Cyan (#13c2c2)**: Refreshment and rest

## Best Practices

1. **Be Specific**: Instead of "coding", say "implementing segment tree"
2. **Update Regularly**: Keep your status current to help teammates
3. **Use Auto-clear**: Set appropriate clear times for temporary statuses
4. **Express Progress**: Share your achievements and struggles
5. **Stay Positive**: Encourage others with your status messages

The problem-solving status system helps build a supportive coding community where everyone can share their journey and inspire others!