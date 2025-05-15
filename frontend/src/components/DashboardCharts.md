# Dashboard Charts Documentation

The Dashboard page now includes two visualization charts to help users better understand their expense patterns:

## 1. Expense Category Distribution (Pie Chart)

This chart visualizes how expenses are distributed across different categories, showing the proportion of spending in each category.

**Features:**
- Color-coded segments for each expense category
- Interactive tooltips showing:
  - Category name
  - Total amount spent in that category
  - Percentage of total expenses
- Responsive design that adapts to container size
- Legend positioned at the bottom for easy identification
- Empty state handling when no expense data is available

**Implementation:**
- Uses Chart.js and react-chartjs-2 libraries
- Data is aggregated by summing expenses for each category
- Includes custom tooltip formatting to display monetary values and percentages

## 2. Monthly Expense Trend (Line Chart)

This chart shows expense patterns over time with a line graph tracking monthly spending over the past year.

**Features:**
- Tracks expenses for the past 12 months
- Shows trends and patterns in spending habits over time
- Interactive tooltips displaying the exact amount for each month
- Y-axis formatted with dollar signs for currency values
- Responsive design with proper aspect ratio handling
- Empty state handling when no expense data is available

**Implementation:**
- Uses Chart.js and react-chartjs-2 libraries
- Data is grouped by month and aggregated
- Handles months with no expenses by displaying zero values
- Custom styling with proper color scheme
- Includes axis labels and formatting

## Technical Notes

- Both charts are implemented in the DashboardPage.js component
- They rely on the same API data fetched for the dashboard summary
- Charts follow responsive design principles and will resize based on the container
- Empty states are handled appropriately to guide users when no data is available
- The implementation uses React hooks for state management and data processing
- The chart configurations follow Chart.js best practices for performance and usability