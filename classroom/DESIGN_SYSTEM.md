# Sarthi Classroom Design System

## Overview
The Sarthi Classroom frontend has been redesigned with a modern, distinctive aesthetic featuring a bold purple gradient theme, split-screen layouts, and smooth animations.

## Design Principles

### Typography
- **Display Font**: Outfit - Used for headings and prominent text
- **Body Font**: DM Sans - Used for body text and UI elements
- **Code Font**: Fira Code - Used for code snippets

### Color Palette
- **Primary Purple**: `sarthi-purple-600` (#7c3aed)
- **Purple Variants**: 50-900 scale for different use cases
- **Accent**: Purple gradients for backgrounds and highlights
- **Neutrals**: Gray scale for text and borders

### Components Styling

#### Authentication Pages
- Split-screen layout with branded left panel
- Floating gradient orbs for visual interest
- Clean, minimal form design on the right
- Smooth entrance animations

#### Buttons
- Primary: Purple gradient with shadow effects
- Secondary: Gray background with hover states
- All buttons include smooth transitions and hover effects

#### Cards
- Rounded corners (2xl)
- Subtle shadows with hover elevation
- Purple accent bars
- Clean typography hierarchy

#### Modals
- Backdrop blur effect
- Slide-up entrance animation
- Rounded corners and generous padding
- Clear visual hierarchy

#### Form Inputs
- Clean borders with focus states
- Purple ring on focus
- Proper spacing and labels
- Icon integration where appropriate

### Animations
- `fade-in`: Smooth opacity transition
- `slide-up`: Upward slide with fade
- `slide-in-left`: Left to right entrance
- `slide-in-right`: Right to left entrance
- `float`: Gentle floating motion for decorative elements

## Usage

### Applying Brand Colors
```jsx
// Primary button
className="bg-sarthi-purple-600 hover:bg-sarthi-purple-700"

// Text
className="text-sarthi-purple-600"

// Background
className="bg-sarthi-purple-50"
```

### Using Typography
```jsx
// Headings
className="font-display font-bold"

// Body text
className="font-body"
```

### Adding Animations
```jsx
// Fade in
className="animate-fade-in"

// Slide up
className="animate-slide-up"

// With delay
style={{ animationDelay: '0.2s' }}
```

## Key Features
- Consistent spacing using Tailwind's spacing scale
- Accessible color contrasts
- Smooth transitions on all interactive elements
- Responsive design patterns
- Modern glassmorphism effects with backdrop blur
