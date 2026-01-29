# Case Detail Component - Quick Reference Guide

## File Locations

```
/sessions/cool-adoring-allen/mnt/cure.deploy.care/care-plan-angular/src/app/pages/case-detail/
├── case-detail.component.ts      (443 lines) - Component logic
├── case-detail.component.html    (442 lines) - Template
├── case-detail.component.css     (371 lines) - Styling
├── README.md                      (8.7 KB)   - Full documentation
└── QUICK_REFERENCE.md            (this file)
```

## Quick Start - Using the Component

### 1. Import in Module/Routes
```typescript
import { CaseDetailComponent } from './pages/case-detail/case-detail.component';

// In routing
const routes = [
  { path: 'cases/:id', component: CaseDetailComponent }
];
```

### 2. Use in Template
```html
<app-case-detail></app-case-detail>
```

## Component Signals

### Read Signal Values
```typescript
// In component
this.querySignal()
this.activeTabSignal()
this.expandedProviderSignal()

// In template
{{ querySignal().startDate }}
{{ activeTabSignal() }}
{{ dateRangeDisplayComputed() }}
```

### Update Signals
```typescript
// Update single property
this.updateQuery({ startDate: '2024-12-01' });

// Reset to defaults
this.resetQuery();

// Set preset
this.setPreset('30D');

// Toggle tag
this.toggleTag('S06.0X0A');

// Set active tab
this.setActiveTab('lop');

// Toggle provider expansion
this.toggleProviderExpanded(0);
```

## Computed Signals

```typescript
// Check if filters are active
@if (hasActiveFiltersComputed()) {
  <p>Showing filtered results</p>
}

// Get formatted date range
{{ dateRangeDisplayComputed() }}
```

## Template Syntax Examples

### Conditionals
```html
@if (activeTabSignal() === 'cure') {
  <div>Cure View Content</div>
}

@if (expandedProviderSignal() === idx) {
  <div>Expanded Content</div>
}
```

### Loops
```html
@for (provider of providers; track provider.name; let idx = $index) {
  <div>{{ idx }}: {{ provider.name }}</div>
}

@for (tag of dxTxTags; track tag.code) {
  <button (click)="toggleTag(tag.code)">
    {{ tag.code }}
  </button>
}
```

### Switch
```html
@switch (provider.type) {
  @case ('medical') {
    <span>Medical Provider</span>
  }
  @case ('legal') {
    <span>Legal Provider</span>
  }
}
```

## Event Binding Examples

### Input Changes
```html
<input
  type="date"
  [value]="querySignal().startDate"
  (change)="updateQuery({ startDate: $any($event.target).value })"
/>

<select
  [value]="querySignal().careModel"
  (change)="updateQuery({ careModel: $any($event.target).value })"
>
  @for (model of careModels; track model) {
    <option [value]="model">{{ model }}</option>
  }
</select>
```

### Button Clicks
```html
<button (click)="resetQuery()">Reset</button>
<button (click)="setActiveTab('cure')">Cure View</button>
<button (click)="toggleProviderExpanded(0)">Expand</button>
<button (click)="handleQuickAction('lmn')">Generate LMN</button>
```

### Toggle Actions
```html
<button
  @for (tag of dxTxTags; track tag.code)
  (click)="toggleTag(tag.code)"
>
  @if (isTagSelected(tag.code)) {
    Selected: {{ tag.code }}
  } @else {
    {{ tag.code }}
  }
</button>
```

## Data Access Examples

### Case Information
```typescript
// Access case data
this.caseInfo.caseNumber      // '#104088'
this.caseInfo.patientName     // 'Adam S.'
this.caseInfo.totalBilled     // '$154,260.96'
this.caseInfo.status          // 'In Progress'
```

### Provider Data
```typescript
// First provider (neurologist)
providers[0].name             // 'Dr. Corey Conn'
providers[0].specialty        // 'Neurologist'
providers[0].type             // 'medical'
providers[0].lastUpdate       // '2 hours ago'

// Check if live
if (idx === 0) {
  // First provider is live
}
```

### Encounter Data
```typescript
encounters[0].id              // 'MC24-001623'
encounters[0].type            // 'Impression'
encounters[0].date            // '12/11/2024'

// Loop through
@for (enc of encounters; track enc.id) {
  {{ enc.id }} - {{ enc.type }} - {{ enc.date }}
}
```

### Query Filter Data
```typescript
const query = this.querySignal();
query.startDate               // '2024-11-01'
query.endDate                 // '2024-12-11'
query.careModel              // 'All Care Models'
query.preset                 // '30D'
query.tags                   // ['S06.0X0A']
```

## Utility Methods

### Color Helpers
```typescript
// Get main color class
this.getColorClass('red', 'bg')         // 'bg-red-600'
this.getColorClass('red', 'text')       // 'text-red-600'
this.getColorClass('red', 'border')     // 'border-red-200'

// Get light color class
this.getColorLightClass('red', 'bg')    // 'bg-red-50'
this.getColorLightClass('red', 'text')  // 'text-red-700'
```

### Icon and Type Helpers
```typescript
this.getTrendIcon('up')                 // '↑'
this.getTrendColor('up')                // 'text-red-500'

this.getProviderIcon('medical')         // 'heart'
this.getProviderIconBg('medical')       // 'bg-blue-100'
this.getProviderIconColor('medical')    // 'text-blue-600'

this.getEncounterTypeBg('Impression')   // 'bg-purple-100'
this.getEncounterTypeText('Impression') // 'text-purple-700'
this.getEncounterTypeDot('Impression')  // 'bg-purple-500'
```

### Action Button Styling
```typescript
this.getActionColorClass('blue')        // 'bg-blue-50 hover:bg-blue-100...'
this.getActionIconBg('blue')            // 'bg-blue-100 text-blue-600'

this.getCasePartyIconBg('legal')        // 'bg-amber-50 border-amber-200'
this.getCasePartyIcon('legal')          // 'scale'
this.getCasePartyIconBox('legal')       // 'bg-amber-100'
this.getCasePartyIconColor('legal')     // 'text-amber-600'
```

## Action Handlers

### Quick Action Routing
```typescript
handleQuickAction(actionId: string) {
  switch (actionId) {
    case 'lmn':
      this.generateLMN();
      break;
    case 'encounter':
      this.newEncounter();
      break;
    case 'schedule':
      this.scheduleRequest();
      break;
    case 'update':
      this.requestUpdate();
      break;
    case 'summary':
      this.generateSummary();
      break;
    case 'export':
      this.exportCaseFile();
      break;
  }
}
```

### View/Edit Actions
```typescript
viewData(provider: Provider)          // Opens provider data view
requestProviderUpdate(provider)       // Requests update from provider
viewEncounter(encounter: Encounter)   // Views specific encounter
```

## Mock Data Quick Reference

### Available Mock Data Collections

```typescript
// Providers (2 items)
providers[0]  // Dr. Corey Conn (Neurologist, Medical)
providers[1]  // Gabby Peltier (Paralegal, Legal)

// DX/TX Tags (6 items)
dxTxTags[0]   // S06.0X0A (DX: Concussion)
dxTxTags[3]   // 99453 (TX: RPM Setup)

// Care Models (5 items)
careModels[0] // 'All Care Models'
careModels[1] // 'New Patient TeleNeurology'

// Encounters (6 items)
encounters[0] // MC24-001623 (Impression, 12/11/2024)

// Case Parties (2 items)
caseParties[0] // Gabby Peltier (Attorney, Legal)
caseParties[1] // Dr. Corey Conn (Neurologist, Medical)

// RPM Metrics (5 items)
rpmMetrics[0]  // Stress Score: 0.896 (up, red)
rpmMetrics[1]  // Concussion (RPQ-13): 47.2 (up, amber)

// RPM Data Points (4 items)
rpmData[0]    // 12/1: stress=0.82, concussion=45
```

## Styling Classes

### Responsive Grid
```html
<div class="grid lg:grid-cols-3 gap-4">
  <div class="lg:col-span-2">Left Column</div>
  <div>Sidebar</div>
</div>
```

### Color Utilities
```html
<!-- Backgrounds -->
<div class="bg-blue-50">Light Blue</div>
<div class="bg-blue-100">Lighter Blue</div>
<div class="bg-blue-600">Blue</div>

<!-- Text -->
<span class="text-red-600">Red Text</span>
<span class="text-emerald-700">Emerald Text</span>

<!-- Borders -->
<div class="border-2 border-green-300">Green Border</div>
```

### Spacing
```html
<div class="p-4">Padding 1rem</div>
<div class="px-3 py-2">Horizontal 0.75rem, Vertical 0.5rem</div>
<div class="mb-4">Margin Bottom 1rem</div>
<div class="gap-3">Gap 0.75rem (flex/grid)</div>
```

### Typography
```html
<h1 class="text-xl font-bold">Title</h1>
<p class="text-sm font-semibold">Subtitle</p>
<span class="text-xs text-gray-500">Small Gray Text</span>
```

## Animation Classes

### Live Pulse
```html
<span class="w-2 h-2 bg-green-500 rounded-full pulse-live"></span>
```

## Integration Checklist

- [ ] Import component in routes
- [ ] Replace mock providers data with service call
- [ ] Replace mock encounters with service call
- [ ] Replace mock case parties with service call
- [ ] Implement `generateLMN()` action
- [ ] Implement `newEncounter()` action
- [ ] Implement `scheduleRequest()` action
- [ ] Implement `requestUpdate()` action
- [ ] Implement `generateSummary()` action
- [ ] Implement `exportCaseFile()` action
- [ ] Connect WebSocket for real-time RPM data
- [ ] Add error handling for failed actions
- [ ] Add loading states for async operations
- [ ] Configure chart library for trend visualization
- [ ] Add export button functionality
- [ ] Test responsive design on mobile/tablet
- [ ] Implement unit tests
- [ ] Implement E2E tests
- [ ] Add accessibility features
- [ ] Performance testing and optimization

## Common Customizations

### Change Default Query
```typescript
querySignal = signal<CaseQuery>({
  startDate: '2024-01-01',  // Change this
  endDate: '2024-12-31',    // Change this
  careModel: 'Your Model',  // Change this
  preset: 'YTD',            // Change this
  tags: ['YOUR_CODE']       // Change this
});
```

### Add New Tab
```typescript
tabs = [
  // ... existing tabs
  { id: 'newTab', label: 'New Tab', icon: 'star' }
];

// Add condition in template
@if (activeTabSignal() === 'newTab') {
  <div>New Tab Content</div>
}
```

### Add New Quick Action
```typescript
quickActions: QuickAction[] = [
  // ... existing actions
  {
    id: 'newAction',
    icon: 'star',
    label: 'New Action',
    desc: 'New action description',
    color: 'pink'
  }
];

// Add handler
case 'newAction':
  this.handleNewAction();
  break;
```

### Modify Colors
```typescript
// Change provider card live border
// In HTML: change 'border-green-300' to your color
// Update in component methods if using getColorClass()
```

## Performance Tips

1. Use `track` function in @for loops to prevent unnecessary renders
2. Keep signals small and focused
3. Use computed signals for derived values
4. Lazy load charts/visualizations
5. Implement virtual scrolling for long encounter lists
6. Use OnPush change detection strategy if needed
7. Unsubscribe from observables in ngOnDestroy
8. Avoid complex calculations in templates

## Debugging Tips

### Log Signal Values
```typescript
console.log(this.querySignal());
console.log(this.activeTabSignal());
console.log(this.hasActiveFiltersComputed());
```

### Check Template Binding
```html
<!-- Display signal value for debugging -->
{{ querySignal() | json }}
{{ providers | json }}
```

### Monitor Change Detection
```typescript
ngOnInit() {
  console.log('Component initialized');
  this.activeTabSignal$.subscribe(value => {
    console.log('Active tab changed to:', value);
  });
}
```

## Browser DevTools Tips

1. Angular DevTools extension to inspect signals
2. Performance tab to monitor rendering performance
3. Network tab to check API calls (when connected)
4. Console for component logs
5. Elements inspector for CSS debugging
