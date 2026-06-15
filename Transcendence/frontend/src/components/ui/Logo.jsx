import { IconLayoutKanban } from '@tabler/icons-react'

export default function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <IconLayoutKanban size={28} color="#7193b8" />
      <span style={{ fontWeight: 500, fontSize: '18px', color: '#6793c2' }}>
        TaskBoard
      </span>
    </div>
  )
}