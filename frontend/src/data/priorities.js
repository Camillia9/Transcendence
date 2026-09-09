export function getPriorities(t) {
  return [
    { value: 'Urgent', label: t('kanban.priority.urgent'), bg: 'bg-red-100', text: 'text-red-600' },
    { value: 'Normal', label: t('kanban.priority.normal'), bg: 'bg-orange-100', text: 'text-orange-500' },
    { value: 'Low', label: t('kanban.priority.low'), bg: 'bg-gray-100', text: 'text-gray-500' },
  ]
}