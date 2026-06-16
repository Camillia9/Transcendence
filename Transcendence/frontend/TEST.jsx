import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core'

// Dans le composant, avant le return :
const sensors = useSensors(
  useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8, // drag s'active seulement après 8px de mouvement
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  })
)