# 05: Statistics Visualizations

## Gap
Ontospy generates Chart.js bar charts (entity type distribution) and polar area charts (top classes by subclass count) on the statistics page.

## Current State
Statistics tab shows plain number cards and grids. No visual charts.

## Implementation
- Add Chart.js (via `chart.js` npm package) for the statistics tab
- Bar chart: entity count by type
- Doughnut chart: ontology breakdown (isoiec80000 vs smart vs external)
- No D3.js needed — Chart.js is lighter and sufficient
