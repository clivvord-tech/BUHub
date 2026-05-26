# BinghamHub Logo & Branding

## Logo Design

### Concept: Modern Monogram
- **Style**: Bold "BH" lettermark with circular gradient background
- **Colors**: Gold/Amber gradient (#F59E0B → #D97706)
- **Design Philosophy**: 
  - Premium and professional
  - Academic prestige (gold represents excellence)
  - Youthful and modern
  - Scalable at any size
  - Dark mode optimized

### Logo Variations

1. **Icon Only** - Used in:
   - Left sidebar (desktop)
   - Mobile top header
   - Favicon/Browser tab
   - App icons

2. **Icon + Text** - Used in:
   - Marketing materials
   - Email headers
   - Landing pages

## Implementation

### Components Created

1. **`src/components/BHLogo.tsx`**
   - Reusable logo component
   - Props: `size`, `className`, `showText`
   - SVG-based for crisp rendering at any size

2. **`src/app/icon.tsx`**
   - Generates 32x32 favicon
   - Uses Next.js ImageResponse API
   - Automatically served at `/icon.png`

3. **`src/app/apple-icon.tsx`**
   - Generates 180x180 iOS home screen icon
   - Rounded corners for iOS style
   - Automatically served at `/apple-icon.png`

### Updated Components

- **LeftSidebar.tsx**: Now uses `<BHLogo size={36} showText={false} />`
- **MobileTopHeader.tsx**: Now uses `<BHLogo size={32} showText={false} />`
- **layout.tsx**: Updated metadata to reference new icons

## Usage

### In Components
```tsx
import BHLogo from '@/components/BHLogo';

// Icon only
<BHLogo size={40} showText={false} />

// Icon with text
<BHLogo size={40} showText={true} />

// Custom styling
<BHLogo size={50} className="opacity-80" showText={false} />
```

### Browser Icons
Next.js automatically serves:
- `/icon.png` - 32x32 favicon
- `/apple-icon.png` - 180x180 iOS icon

These are generated dynamically from the icon.tsx and apple-icon.tsx files.

## Color Palette

### Primary Brand Colors
- **Gold**: `#F59E0B` (Tailwind: `amber-500`)
- **Dark Gold**: `#D97706` (Tailwind: `amber-600`)

### Usage Guidelines
- Use gold gradient for logo backgrounds
- Use solid gold for accents and highlights
- Maintain contrast with dark background (#000000)
- Never use logo on light backgrounds without adjustment

## File Locations

```
src/
├── components/
│   └── BHLogo.tsx          # Main logo component
└── app/
    ├── icon.tsx            # Favicon generator
    ├── apple-icon.tsx      # iOS icon generator
    └── layout.tsx          # Metadata with icon references
```

## Future Enhancements

- [ ] Add animated logo variant for loading states
- [ ] Create logo variations for light mode (when implemented)
- [ ] Design social media cover images
- [ ] Create email signature template
- [ ] Design merchandise mockups

---

**Brand Identity**: Premium • Academic • Connected • Modern
