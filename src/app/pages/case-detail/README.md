# Case Detail Component

A comprehensive Angular 17 standalone component for displaying detailed case information with real-time data management using Angular signals.

## Features

### 1. **State Management with Signals**
- `querySignal`: Manages case query filters (date range, care model, DX/TX tags)
- `activeTabSignal`: Tracks the currently active tab (Cure View, LOP, Liable Party, Patient Details)
- `expandedProviderSignal`: Manages which provider card is expanded
- `isLiveSignal`: Tracks live data connection status
- `lastActionSignal`: Stores the last performed quick action

### 2. **Computed Signals**
- `hasActiveFiltersComputed`: Computed value indicating if any DX/TX tags are selected
- `dateRangeDisplayComputed`: Formatted date range for display

### 3. **Key Sections**

#### Case Header
- Case number, type, and status badge
- Patient information (name, age, gender)
- Date of injury
- Total billed amount
- Export buttons for billing summary and case file

#### Since Query Panel
- Date range filters (start and end date)
- Care model selector
- Quick preset buttons (7D, 30D, 90D, YTD)
- DX/TX tag filters with visual distinction
  - DX tags (Diagnosis) - green styling
  - TX tags (Treatment) - blue styling

#### Tabs Panel
- **Cure View**: Active provider recommendations with real-time indicators
- **LOP**: Letter of Protection (placeholder)
- **Liable Party**: Liable party information (placeholder)
- **Patient Details**: Patient details (placeholder)

#### Provider Recommendation Cards
- Provider name, specialty, and organization
- Live indicator with pulsing animation
- Active recommendation section
- Care model and encounter count
- Action buttons: View Data, Request Update, Expand
- Expandable treatment plan section with DX codes

#### GatherMed Panel
- Real-time RPM (Remote Patient Monitoring) data
- Connection status indicator
- Time metrics display (TCM, CCM, RTM, Total)
- Health metrics grid with trend indicators
- 30-day trend visualization
- Import to summary button

#### Quick Actions Panel
- 6 action buttons with color-coded backgrounds:
  - Generate LMN (Letter of Medical Necessity)
  - New Encounter
  - Schedule Request
  - Request Update
  - Generate Summary (AI-powered)
  - Export Case File

#### Encounter Timeline
- Scrollable list of encounters
- Color-coded encounter types (Impression: purple, RPM Report: blue)
- Date information for each encounter
- View button for individual encounters

#### Case Parties Section
- List of involved parties (attorneys, medical providers)
- Icon and color distinction between legal and medical parties
- Contact messaging capability

## Component Architecture

### Interfaces Defined

```typescript
interface CaseQuery {
  startDate: string;
  endDate: string;
  careModel: string;
  preset: string;
  tags: string[];
}

interface Provider {
  name: string;
  specialty: string;
  organization: string;
  type: 'medical' | 'legal';
  lastUpdate: string;
  recommendation: string;
  careModel: string;
  encounterCount: number;
  treatmentPlan: string;
  dxCodes: string[];
}

// Additional interfaces available for Encounter, CaseParty, RPMMetric, etc.
```

### Signal-Based Methods

#### Query Management
- `updateQuery(query: Partial<CaseQuery>)`: Updates query parameters
- `resetQuery()`: Resets query to default values
- `setPreset(preset: string)`: Sets quick preset (7D, 30D, 90D, YTD)
- `toggleTag(code: string)`: Toggles DX/TX tag selection
- `isTagSelected(code: string)`: Checks if tag is selected

#### Tab Navigation
- `setActiveTab(tabId: string)`: Changes active tab
- `toggleProviderExpanded(index: number)`: Expands/collapses provider card

#### Action Handlers
- `handleQuickAction(actionId: string)`: Routes quick action handlers
- `generateLMN()`: Generate Letter of Medical Necessity
- `newEncounter()`: Create new care encounter
- `scheduleRequest()`: Request appointment scheduling
- `requestUpdate()`: Request provider status update
- `generateSummary()`: Generate AI-powered case summary
- `exportCaseFile()`: Download complete case file

### Utility Methods

- `getColorClass()`: Returns Tailwind color classes for different elements
- `getColorLightClass()`: Returns light variant color classes
- `getTrendIcon()`: Returns trend direction indicator
- `getTrendColor()`: Returns color for trend indicator
- `getProviderIcon()`: Returns icon for provider type
- `getEncounterTypeBg()`: Returns background color for encounter type
- `getActionColorClass()`: Returns color styling for quick action buttons

## Modern Angular 17 Syntax

The component uses Angular 17's latest features:

### Control Flow Syntax
- `@if`: Conditional rendering
- `@for`: Loop rendering with track function
- `@switch/@case`: Switch/case conditionals

Example:
```html
@if (activeTabSignal() === 'cure') {
  <div>Cure View content</div>
}

@for (provider of providers; track provider.name; let idx = $index) {
  <div>{{ provider.name }}</div>
}

@switch (tab.icon) {
  @case ('heart') { ❤️ }
  @case ('shield') { 🛡️ }
}
```

### Signals for Reactivity
```typescript
// Reading signal value
this.querySignal()

// Creating computed signal
dateRangeDisplayComputed = computed(() => {
  return `${this.querySignal().startDate}`;
});

// Updating signal
this.querySignal.update(current => ({
  ...current,
  startDate: newDate
}));
```

## Tailwind CSS Styling

The component uses Tailwind CSS utility classes for styling:

- **Colors**: blue, green, purple, amber, pink, red, emerald, teal, slate, gray
- **Responsive**: `md:grid-cols-4`, `lg:col-span-2`, `lg:grid-cols-3`
- **Animations**: `pulse-live` for live indicators
- **Spacing**: Consistent use of Tailwind spacing scale
- **Shadows**: `shadow-lg`, `shadow-lg.shadow-green-100`

## Mock Data

All data is provided as mock data in the component:

- **Providers**: 2 providers (medical neurologist and legal paralegal)
- **Encounters**: 6 sample encounters with dates and types
- **Case Parties**: 2 parties (attorney and neurologist)
- **RPM Metrics**: 5 health metrics with trend data
- **RPM Data Points**: 4 data points for trend visualization
- **Quick Actions**: 6 action buttons
- **DX/TX Tags**: 6 sample diagnosis and treatment codes
- **Care Models**: 5 care model options

## Integration Points

To integrate this component with your application:

1. **Import in routing module**:
```typescript
import { CaseDetailComponent } from './pages/case-detail/case-detail.component';

const routes = [
  { path: 'cases/:id', component: CaseDetailComponent }
];
```

2. **Replace mock data** with actual service calls:
```typescript
constructor(private caseService: CaseService) {}

ngOnInit() {
  this.caseService.getCaseDetails(caseId).subscribe(data => {
    this.providers = data.providers;
    this.encounters = data.encounters;
    // etc.
  });
}
```

3. **Implement action handlers** with actual business logic:
```typescript
generateLMN(): void {
  this.caseService.generateLMN(this.caseInfo.caseNumber).subscribe(
    result => this.handleLMNGeneration(result)
  );
}
```

4. **Connect real-time data** from WebSocket or polling service:
```typescript
this.realtimeService.connectRPMData().subscribe(data => {
  this.rpmMetrics = data.metrics;
  this.isLiveSignal.set(true);
});
```

## Styling Notes

- **Custom animations**: `pulse-live` animation in CSS for live indicators
- **Emoji icons**: Uses emoji for icons to avoid external dependencies
- **Responsive design**: Grid layout adapts to mobile, tablet, and desktop
- **Color coding**: Consistent color usage for different card types and statuses
- **Hover states**: All interactive elements have appropriate hover effects

## Performance Considerations

1. **Signals**: Automatically track dependencies and re-render only affected sections
2. **TrackBy function**: Uses track identifiers in `@for` loops to improve change detection
3. **Lazy evaluation**: Computed signals only update when dependencies change
4. **Memoization**: Heavy filtering/transformation should use computed signals

## Files Structure

```
case-detail/
├── case-detail.component.ts    # Component logic with signals
├── case-detail.component.html  # Template with Angular 17 syntax
├── case-detail.component.css   # Tailwind-based styling and animations
└── README.md                    # This file
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- All modern browsers with ES2020+ support

## Dependencies

- Angular 17+
- Tailwind CSS 3.x
- TypeScript 5.0+

## Future Enhancements

1. Add real data integration with RxJS services
2. Implement modal dialogs for actions
3. Add pagination for encounter timeline
4. Export functionality for case data
5. Real-time updates via WebSocket
6. Analytics and reporting features
7. Search and filtering capabilities
8. User role-based access control
9. Notification system integration
10. Dark mode support
