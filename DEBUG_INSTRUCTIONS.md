# Problem Description Debug Instructions

I've added comprehensive debugging to help identify whether the problem description issue is a frontend or backend problem.

## Debug Features Added:

### 1. Console Logging
- Open your browser's Developer Console (F12)
- Navigate to a problem page
- Look for console logs marked with:
  - `[API]` - API layer debugging
  - `[AJAX]` - Network request debugging
  - `=== Problem Init Debug ===` - Component initialization
  - `=== API Response Debug ===` - Response data

### 2. Debug Panel
- A debug panel appears on the right side of the problem page
- Shows:
  - Complete problem data as received from API
  - Route information
  - Test buttons to manually trigger API calls
- Click "Close" to hide it

### 3. Key Things to Check:

#### Backend Issues (if these are true):
- API returns `null` or empty description
- Console shows: `Problem description: null` or `Problem description: undefined`
- Response data shows description field is missing or empty
- Network tab shows 404 or 500 errors

#### Frontend Issues (if these are true):
- API returns valid description data but it doesn't display
- Console shows description with content but page shows blank
- HTML parsing errors in console
- Vue warnings about v-html directive

### 4. Test Steps:

1. **Open Developer Console** (F12)
2. **Navigate to a problem** (e.g., /problem/001)
3. **Check Console Output**:
   ```
   === Problem Init Debug Start ===
   Route name: problem-details
   Problem ID: 001
   [API] getProblem called with problemID: 001
   [AJAX] Request: {url: "problem", method: "get", ...}
   [AJAX] Response: {status: 200, data: {...}}
   ```

4. **Check Debug Panel** on the right side for full problem data

5. **Use Test Buttons**:
   - Click "Test API Call" to manually test the API
   - Click "Reload Problem" to re-fetch data

### 5. Common Issues to Look For:

- **Empty Description**: Check if `problem.description` is null/empty in the debug panel
- **HTML Encoding**: Description might contain encoded HTML that's not rendering
- **CORS/Network**: Check Network tab for failed requests
- **Authentication**: API might return "Please login" message

### 6. To Disable Debug Mode:

Edit `/src/pages/oj/views/problem/Problem.vue` and change:
```javascript
debug: true, // Enable debug mode
```
to:
```javascript
debug: false, // Enable debug mode
```

## Next Steps:

Based on what you find:
- If backend returns empty data → Backend issue
- If backend returns data but frontend doesn't show it → Frontend rendering issue
- Share the console output and debug panel screenshot for further assistance