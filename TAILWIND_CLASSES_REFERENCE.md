# Tailwind CSS Classes Reference - Blue Glassmorphism Theme

Complete reference of all Tailwind classes used in the blue glassmorphism theme implementation.

---

## Colors

### Background Colors
```
bg-blue-25     #f8fafc  - Lightest background
bg-blue-50     #f0f9ff  - Light background
bg-blue-100    #e0f2fe  - Light blue tint
bg-blue-200    #bae6fd  - Medium light
bg-blue-500    #0ea5e9  - Interactive element
bg-blue-600    #0284c7  - Primary actions
bg-blue-700    #0369a1  - Active/Dark
bg-blue-800    #075985  - Very dark
bg-blue-900    #0c4a6e  - Darkest
bg-white/70    rgba(255,255,255,0.7)  - Glass effect
bg-white/80    rgba(255,255,255,0.8)  - Stronger glass
bg-white/95    rgba(255,255,255,0.95) - Nearly opaque
bg-white/50    rgba(255,255,255,0.5)  - Light glass
bg-white/40    rgba(255,255,255,0.4)  - Very light glass
bg-white/90    rgba(255,255,255,0.9)  - Hover state
bg-green-50    rgba(16,185,129,0.05)  - Success background
bg-red-50      rgba(220,38,38,0.05)   - Error background
bg-amber-50    rgba(245,158,11,0.05)  - Warning background
bg-blue-50/70  rgba(240,249,255,0.7)  - Alert background
```

### Border Colors
```
border-blue-200/30     Semi-transparent blue (glass)
border-blue-200/40     More visible blue
border-blue-200/20     Very subtle blue
border-blue-300        Medium blue
border-blue-700        Dark blue
border-blue-700/40     Semi-transparent dark blue
border-green-200       Green (success)
border-red-200         Red (error)
border-amber-200       Amber (warning)
```

### Text Colors
```
text-blue-50          #f0f9ff  - Very light
text-blue-100         #e0f2fe  - Light
text-blue-200/60      With opacity
text-blue-600         #0284c7  - Primary text
text-blue-700         #0369a1  - Dark blue text
text-blue-800         #075985  - Very dark
text-blue-900         #0c4a6e  - Darkest
text-white            Pure white
text-gray-600         Default text
text-gray-700         Darker text
text-gray-900         Darkest text
text-green-600        Success text
text-red-600          Error text
text-amber-600        Warning text
```

---

## Spacing & Layout

### Padding
```
p-2     0.5rem - Small
p-3     0.75rem
p-4     1rem   - Standard
p-5     1.25rem
p-6     1.5rem - Large (cards)
px-3    Horizontal
py-2    Vertical
```

### Margin
```
m-0     0
m-1     0.25rem
m-2     0.5rem
m-3     0.75rem
m-4     1rem
mb-1    Bottom margin
mt-0.5  Top margin
ml-2    Left margin
mr-3    Right margin
```

### Gap (Grid/Flex)
```
gap-2   0.5rem
gap-4   1rem
gap-6   1.5rem - Standard
```

### Space Between (Flex/Stack)
```
space-y-1   0.25rem between items
space-y-2   0.5rem between items
space-y-3   0.75rem between items
space-y-4   1rem between items
space-x-2   Horizontal spacing
```

---

## Sizing

### Width
```
w-full      100%
w-auto      auto
max-w-md    28rem (336px)
max-w-2xl   42rem (672px)
max-w-4xl   56rem (896px)
min-w-[200px] Custom minimum
flex-1      Flex grow
```

### Height
```
h-full      100%
h-auto      auto
h-16        64px (icon containers)
h-64        256px (chart containers)
min-h-full  Minimum 100vh
min-h-screen 100vh
```

### Responsive Widths
```
grid-cols-1     1 column (mobile)
sm:grid-cols-2  2 columns (tablet)
lg:grid-cols-3  3 columns (desktop)
lg:grid-cols-4  4 columns (large)
```

---

## Borders & Rounded

### Border Radius
```
rounded-lg  0.5rem (8px)
rounded-xl  1rem (16px) - Standard for glass
rounded-full 9999px - Circle
```

### Border Width
```
border       1px (default)
border-2     2px (active indicator)
border-b     Bottom only
border-r     Right only
border-l-2   Left 2px (active nav)
border-t     Top only
```

### Border Opacity
```
border-opacity-30   30% opacity
border-opacity-40   40% opacity
border-blue-200/30  Blue with 30% opacity
border-blue-200/40  Blue with 40% opacity
border-blue-700/40  Dark blue with opacity
```

---

## Typography

### Font Size
```
text-xs    0.75rem (12px) - Small labels
text-sm    0.875rem (14px) - Body text
text-base  1rem (16px) - Standard
text-lg    1.125rem (18px) - Headings
text-xl    1.25rem (20px) - Large headings
text-2xl   1.5rem (24px) - Dashboard titles
```

### Font Weight
```
font-normal      400 - Regular
font-medium      500 - Bold buttons/labels
font-semibold    600 - Card titles
font-bold        700 - Page headings
```

### Text Styling
```
truncate             Overflow ellipsis
text-center          Center aligned
text-left            Left aligned
line-clamp-2         Max 2 lines
bg-clip-text         For gradient text
text-transparent     For gradient text
```

---

## Backgrounds & Effects

### Backdrop Blur
```
backdrop-blur-sm    4px blur (standard)
backdrop-blur-md    12px blur
backdrop-blur-lg    16px blur (modals)
```

### Gradients
```
bg-gradient-to-r     Left to right
bg-gradient-to-b     Top to bottom
bg-gradient-to-br    Top-left to bottom-right

from-blue-600       Start color
to-blue-500         End color
via-blue-25         Middle color (3-color gradient)
```

### Shadows
```
shadow-sm           Small shadow (cards)
shadow-md           Medium shadow (hover)
shadow-lg           Large shadow
shadow-xl           Extra large
shadow-2xl          Huge (modals)
drop-shadow         Filter drop shadow
```

---

## Interactive States

### Hover States
```
hover:bg-blue-700        Hover background
hover:shadow-lg          Hover shadow
hover:shadow-md          Lighter hover shadow
hover:border-blue-400    Hover border color
hover:text-blue-700      Hover text color
hover:bg-white/80        Hover glass opacity
hover:bg-blue-700/40     Hover with opacity
```

### Focus States
```
focus:outline-none          No default outline
focus:ring-2                2px focus ring
focus:ring-blue-500         Blue focus ring
focus:ring-offset-2         Ring offset
focus:border-transparent    Remove border during focus
```

### Disabled States
```
disabled:opacity-50            50% opacity
disabled:cursor-not-allowed    Not-allowed cursor
```

### Active States
```
bg-blue-500/20         20% opacity blue (active nav)
border-l-2             Left border indicator
text-blue-100          Light blue text (active)
```

---

## Layout Utilities

### Display
```
flex              Flexbox display
grid              CSS Grid display
hidden            display: none (lg:flex for mobile menu)
block             display: block
inline-flex       Inline flexbox
inline-block      Inline block
```

### Flex Direction & Align
```
flex-col           Column direction
flex-row           Row direction (default)
items-center       Vertical center
items-start        Top align
items-end          Bottom align
justify-between    Space between
justify-center     Center aligned
justify-end        Right aligned
```

### Positioning
```
fixed              Fixed position
absolute           Absolute position
relative           Relative position
inset-0            Top/Right/Bottom/Left = 0 (full cover)
```

### Overflow
```
overflow-y-auto    Vertical scroll
overflow-hidden    Hide overflow
truncate           Single line truncate
```

---

## Animation & Transitions

### Transitions
```
transition-all           All properties
transition-colors        Color changes
transition-shadow        Shadow changes
duration-200             200ms duration
duration-300             300ms duration
ease-in-out              Easing function
```

### Animations
```
animate-spin             Rotation (loading)
animate-pulse            Pulsing effect
```

---

## Responsive Prefixes

### Breakpoints
```
Base classes apply mobile-first
sm:  640px and up (tablets)
md:  768px and up
lg:  1024px and up (desktops)
xl:  1280px and up (large screens)
2xl: 1536px and up
```

### Examples
```
hidden lg:flex         Hidden on mobile, flex on desktop
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
text-sm md:text-base lg:text-lg
```

---

## Custom Utilities

### Glass Effect (Index.css)
```
.btn-primary
.btn-secondary
.btn-danger
.input-field
.card
```

### App.css Custom
```
.glass              Glassmorphic effect
.glass-dark         Dark glassmorphic effect
```

---

## Common Combinations

### Glass Card
```
backdrop-blur-sm bg-white/70 border border-blue-200/30 rounded-xl shadow-sm hover:shadow-md transition-all p-6
```

### Primary Button
```
bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-medium shadow-md hover:shadow-lg
```

### Active Nav Item
```
bg-blue-500/20 text-blue-100 border-l-2 border-blue-300 transition-all
```

### Glass Input
```
w-full px-4 py-2 border border-blue-200/40 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/80 backdrop-blur-sm transition-all
```

### Modal Backdrop
```
fixed inset-0 bg-black/30 backdrop-blur-sm
```

### Loading Spinner
```
animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600
```

### Status Badge
```
bg-green-50/50 text-green-600 px-3 py-1 rounded-lg
```

---

## Color Opacity Reference

```
/5   - 5% opacity    (very transparent)
/10  - 10% opacity
/20  - 20% opacity   (very light)
/30  - 30% opacity   (borders)
/40  - 40% opacity   (stronger)
/50  - 50% opacity   (medium)
/60  - 60% opacity
/70  - 70% opacity   (standard glass)
/80  - 80% opacity   (nearly opaque)
/90  - 90% opacity
/95  - 95% opacity   (almost solid)
```

---

## Performance Notes

### Hardware Accelerated
- `backdrop-filter` (blur)
- `transform` (gradients)
- `opacity` (transparency)

### Use Sparingly
- Multiple shadows
- Complex gradients
- Very high blur values

### Avoid
- `box-shadow` for blur (use backdrop-filter)
- `filter` for blur (use backdrop-filter)
- Excessive animations

---

## Browser Support

### Tailwind v3 Classes
- All listed classes: Modern browsers (Chrome 88+, Firefox 88+, Safari 14+)

### Backdrop Filter
- Chrome 76+
- Firefox 103+
- Safari 9+
- Edge 79+

### CSS Grid
- All modern browsers

### CSS Gradients
- All modern browsers

---

## Quick Copy-Paste Templates

### Glass Card
```jsx
<div className="backdrop-blur-sm bg-white/70 border border-blue-200/30 rounded-xl shadow-sm hover:shadow-md transition-all p-6">
  {/* Content */}
</div>
```

### Gradient Button
```jsx
<button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg transition-all">
  Action
</button>
```

### Dashboard Header
```jsx
<div className="backdrop-blur-sm bg-white/40 border border-blue-200/30 rounded-xl p-6">
  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
    Title
  </h1>
</div>
```

### Sidebar Navigation Item
```jsx
<Link className="flex items-center px-3 py-2 rounded-lg bg-blue-500/20 text-blue-100 border-l-2 border-blue-300 transition-all">
  <Icon />
  {name}
</Link>
```

---

**Reference Complete! 📚**

For more information, see:
- BLUE_GLASSMORPHISM_THEME.md
- GLASSMORPHISM_VISUAL_GUIDE.md
- tailwind.config.js
