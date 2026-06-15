<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
  <div className="flex gap-4 overflow-x-auto pb-4">
    {COLUMNS.map((col) => {
      const colTasks = tasks.filter((t) => t.column === col.id)
      return (
        <KanbanColumn key={col.id} col={col} colTasks={colTasks}>
          {colTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => console.log('click', task.title)}
            />
          ))}
        </KanbanColumn>
      )
    })}
  </div>

  {/* Copie flottante qui suit la souris */}
  <DragOverlay>
    {activeTask && (
      <div className="opacity-90 rotate-1 scale-105">
        <TaskCard task={activeTask} onClick={() => {}} />
      </div>
    )}
  </DragOverlay>

</DndContext>