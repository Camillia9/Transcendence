import { useDroppable } from "@dnd-kit/core";

function KanbanColumn({col, colTasks, children, onAddTask }) {
	const { setNodeRef, isOver } = useDroppable({id: col.id })

	return (
		<div
			className={`rounded-2xl p-4 flex flex-col gap-3 min-w-70 w-70 transition-colors ${
				isOver ? 'bg-blue-50' : 'bg-gray-100'
			}`}
		>

			{/*En tete colonne */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="font-medium text-gray-700 text-sm">{col.label}</span>
					<span className="bg-gray-200 text-gray-500 text-xs rounded-full px-2 py-0.5">
						{colTasks.lenght}
					</span>
				</div>
				<button 
				onClick={onAddTask}
				className="text-gray-400 hover:text-gray-600 text-lg leading-none"
				> 
					+
				</button>
			</div>
			
			{/*Zone de depot */}
			<div ref={setNodeRef} className="flex flex-col gap-2 flex-1 min-h-25">
				{children}
			</div>
		</div>
	)
}


export default KanbanColumn