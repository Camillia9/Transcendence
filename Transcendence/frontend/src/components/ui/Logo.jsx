import { IconLayoutKanban } from '@tabler/icons-react'

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <IconLayoutKanban size={28} className='text-primary-500' />
      <span className='font-medium text-lg text-primary-600'>
        TaskBoard
      </span>
    </div>
  )
}