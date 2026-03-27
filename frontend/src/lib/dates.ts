// ALWAYS use this when sending dates to the backend
// Never send a JS Date object directly
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

// Format date for display
export const displayDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

// Check if a date is overdue
export const isOverdue = (dueDateStr: string): boolean => {
  return new Date(dueDateStr) < new Date()
}