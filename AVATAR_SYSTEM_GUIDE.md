# Avatar System Implementation Guide

## Overview
The OnlineJudge platform now has a complete avatar management system with automatic image processing, drag-and-drop upload, and reset functionality.

## Features

### Backend Features (as provided)
1. **Automatic Image Processing**
   - Auto-crop to square aspect ratio
   - Resize to 200x200 pixels
   - Convert transparent PNGs to JPG with white background
   - Optimize file size

2. **API Endpoints**
   - `POST /api/upload_avatar/` - Upload new avatar
   - `DELETE /api/upload_avatar/` - Reset to default avatar
   - Returns absolute URLs for immediate display

3. **Security & Validation**
   - Authentication required
   - File type validation (JPG, PNG, GIF, BMP)
   - 2MB file size limit
   - Safe file naming with random strings

### Frontend Implementation

#### 1. Avatar Upload Component (`/src/pages/oj/components/AvatarUpload.vue`)
- **Current Avatar Display**: Shows user's current avatar with option to reset
- **Drag & Drop Upload**: Intuitive drag-and-drop interface
- **File Validation**: Client-side validation for file type and size
- **Preview**: Shows preview before uploading
- **Progress Indicators**: Loading states during upload/reset
- **Auto-refresh**: Automatically updates avatar after successful upload

#### 2. API Integration (`/src/pages/oj/api.js`)
```javascript
// Upload avatar
uploadAvatar (formData) {
  return ajax('upload_avatar', 'post', {
    data: formData,
    headers: {'content-type': 'multipart/form-data'}
  })
}

// Delete/reset avatar
deleteAvatar () {
  return ajax('upload_avatar', 'delete')
}
```

#### 3. Avatar Display Locations

##### Navbar (`/src/pages/oj/components/NavBar.vue`)
- Shows 32x32px circular avatar next to username
- Fallback to default avatar if none set
- Hover effect with blue border

##### Settings Page (`/src/pages/oj/views/setting/children/ProfileSetting.vue`)
- Integrated AvatarUpload component
- Located under "Avatar Setting" section

##### Other Locations
The avatar URL is available through:
- `userStore.profile.avatar` - Current user's avatar
- Any API using `UsernameSerializer` includes avatar field

## Usage Instructions

### For Users

1. **Upload Avatar**
   - Navigate to Settings → Profile
   - In the Avatar Setting section:
     - Drag and drop an image OR click to select
     - Preview your image
     - Click "Upload Avatar"

2. **Reset to Default**
   - Click "Reset to Default" button next to current avatar
   - Confirms and reverts to default avatar

### For Developers

1. **Display Avatar in Components**
```vue
<template>
  <img 
    :src="userProfile?.avatar || '/default.png'" 
    alt="User avatar"
    class="user-avatar"
  />
</template>

<script>
import { useUserStore } from '@/stores/user'

export default {
  setup() {
    const userStore = useUserStore()
    return {
      userProfile: computed(() => userStore.profile)
    }
  }
}
</script>
```

2. **Upload Avatar Programmatically**
```javascript
const file = // File object from input
const formData = new FormData()
formData.append('image', file)

try {
  await api.uploadAvatar(formData)
  await userStore.getProfile() // Refresh profile
  // Success
} catch (error) {
  // Handle error
}
```

## File Structure
```
/src/
├── pages/oj/
│   ├── components/
│   │   ├── AvatarUpload.vue    # Avatar upload component
│   │   └── NavBar.vue          # Updated with avatar display
│   ├── views/setting/children/
│   │   └── ProfileSetting.vue  # Integrated avatar upload
│   └── api.js                  # Avatar API methods
└── stores/
    └── user.js                 # User store with profile data
```

## Styling
- Avatar images are displayed as circles using `border-radius: 50%`
- Consistent 1px border with hover effects
- Responsive sizing based on context (32px in navbar, 100px in settings)

## Error Handling
- Client-side validation for file type and size
- Server-side validation with meaningful error messages
- Graceful fallback to default avatar if custom avatar fails to load

## Performance
- Images automatically optimized to 200x200px
- File size reduced through backend processing
- Immediate display using absolute URLs
- Profile refresh after upload ensures consistency

## Future Enhancements
- Re-enable advanced cropping when Vue 3 compatible cropper is available
- Add avatar preview in more locations (comments, submissions, etc.)
- Consider CDN integration for faster avatar delivery