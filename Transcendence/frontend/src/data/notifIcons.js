import {
  IconUserPlus, IconArrowRight, IconMail,
  IconPlus, IconPencil, IconTrash, 
} from '@tabler/icons-react'

export const NOTIF_ICONS = {
  task_assigned:  { icon: IconUserPlus,   color: 'text-primary-400'   },
  task_created:   { icon: IconPlus,       color: 'text-green-400'  },
  task_moved:     { icon: IconArrowRight, color: 'text-amber-400'  },
  task_updated:   { icon: IconPencil,     color: 'text-amber-400'  },
  task_deleted:   { icon: IconTrash,      color: 'text-red-400'    },
  project_invite: { icon: IconMail,       color: 'text-purple-400' },
  member_removed: { icon: IconTrash,      color: 'text-red-400'    },
}