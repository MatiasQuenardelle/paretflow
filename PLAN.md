# Paretflow - App Plan

A minimalist productivity app combining Pareto principles with focused work sessions.

---

## Core Features

### 1. Paretto Timer
A beautiful, distraction-free timer for focused work sessions.

- **Modes**: 25/5 (classic), 50/10 (deep work), custom
- **Visual**: Clean circular progress with subtle animations
- **Audio**: Gentle notification sounds
- **Session tracking**: Count completed sessions per day

### 2. Task Breakdown Notebook
Two-column layout for organizing work into actionable steps.

```
┌─────────────────┬────────────────────────────────────────┐
│  TASK           │  STEPS                                 │
├─────────────────┼────────────────────────────────────────┤
│ Build landing   │ ☐ 9:00  Sketch wireframe               │
│ page            │ ☐ 10:00 Set up component structure     │
│                 │ ☑ 11:00 Write hero section copy        │
│                 │ ☐ 14:00 Style responsive layout        │
│                 │ ☐ 15:30 Add animations                 │
└─────────────────┴────────────────────────────────────────┘
```

- **Left column**: Task name/goal (what you want to accomplish)
- **Right column**: Ordered steps (3, 5, 10+ items)
  - Checkbox to mark complete
  - Optional time assignment
  - Drag to reorder
- **Step presets**: Quick buttons for 3, 5, or 10 step templates

### 3. Calendar View
Daily timeline showing scheduled steps.

- **Day view**: Vertical timeline with time blocks
- **Week view**: Overview of task distribution
- **Visual**: Steps appear as colored blocks at assigned times
- **Quick edit**: Click to reschedule or mark complete

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 (App Router) | Server components, file routing |
| Styling | Tailwind CSS | Fast, utility-first, beautiful defaults |
| State | Zustand | Simple, lightweight, persists to localStorage |
| Storage | localStorage | No backend needed, data stays local |
| Icons | Lucide React | Clean, consistent icon set |
| Date/Time | date-fns | Lightweight date manipulation |

---

## File Structure

```
paretflow/
├── app/
│   ├── layout.tsx          # Root layout with nav
│   ├── page.tsx            # Home/dashboard
│   ├── timer/
│   │   └── page.tsx        # Paretto timer
│   ├── tasks/
│   │   └── page.tsx        # Task breakdown notebook
│   └── calendar/
│       └── page.tsx        # Calendar view
├── components/
│   ├── ui/                 # Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── timer/
│   │   ├── TimerDisplay.tsx
│   │   ├── TimerControls.tsx
│   │   └── SessionCounter.tsx
│   ├── tasks/
│   │   ├── TaskColumn.tsx
│   │   ├── StepsColumn.tsx
│   │   ├── StepItem.tsx
│   │   └── TimeInput.tsx
│   └── calendar/
│       ├── DayView.tsx
│       ├── WeekView.tsx
│       └── TimeBlock.tsx
├── stores/
│   ├── timerStore.ts       # Timer state
│   └── taskStore.ts        # Tasks & steps state
├── lib/
│   └── utils.ts            # Helper functions
└── public/
    └── sounds/
        └── bell.mp3        # Timer notification
```

---

## Data Models

```typescript
interface Task {
  id: string;
  title: string;
  createdAt: Date;
  steps: Step[];
}

interface Step {
  id: string;
  text: string;
  completed: boolean;
  scheduledTime?: string;  // "09:00" format
  scheduledDate?: string;  // "2024-01-15" format
  order: number;
}

interface TimerSession {
  id: string;
  duration: number;        // minutes
  completedAt: Date;
  taskId?: string;         // optional link to task
}
```

---

## Pages

### Home `/`
- Quick stats (sessions today, tasks completed)
- Start timer button
- Recent tasks preview

### Timer `/timer`
- Large circular timer display
- Play/pause/reset controls
- Session mode selector
- Current session count

### Tasks `/tasks`
- Two-column notebook layout
- Add new task button
- Select task to view/edit steps
- Step presets (3/5/10)
- Time picker for each step

### Calendar `/calendar`
- Toggle between day/week view
- Scheduled steps shown as blocks
- Click step to mark complete or edit

---

## Design Principles

1. **Minimal**: Only essential features, no clutter
2. **Fast**: Instant interactions, no loading states
3. **Beautiful**: Clean typography, subtle shadows, smooth animations
4. **Offline-first**: Works without internet, data persists locally
5. **Keyboard-friendly**: Shortcuts for power users

---

## Color Palette

```
Background:     #FAFAFA (light) / #0A0A0A (dark)
Surface:        #FFFFFF / #141414
Primary:        #2563EB (blue-600)
Success:        #16A34A (green-600)
Text:           #171717 / #FAFAFA
Text Muted:     #737373
Border:         #E5E5E5 / #262626
```

---

## Implementation Order

1. **Phase 1: Foundation**
   - [ ] Initialize Next.js project with Tailwind
   - [ ] Set up file structure
   - [ ] Create base UI components
   - [ ] Implement navigation layout

2. **Phase 2: Timer**
   - [ ] Build timer display component
   - [ ] Add timer controls
   - [ ] Implement timer logic with Zustand
   - [ ] Add notification sound
   - [ ] Session tracking

3. **Phase 3: Tasks**
   - [ ] Create two-column layout
   - [ ] Task list with add/delete
   - [ ] Steps with checkboxes
   - [ ] Time assignment input
   - [ ] Drag-to-reorder steps
   - [ ] Persist to localStorage

4. **Phase 4: Calendar**
   - [ ] Day view timeline
   - [ ] Week view grid
   - [ ] Display scheduled steps
   - [ ] Quick complete/edit actions

5. **Phase 5: Polish**
   - [ ] Dark mode toggle
   - [ ] Keyboard shortcuts
   - [ ] Animations and transitions
   - [ ] Mobile responsiveness

---

## Verification

After implementation:
1. `npm run dev` - app runs without errors
2. Timer counts down and plays sound
3. Tasks can be created with steps
4. Steps can be checked, timed, reordered
5. Calendar shows scheduled steps correctly
6. Data persists after page refresh
7. Responsive on mobile viewports
