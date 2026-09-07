import { IconPencil, IconTrash, IconUserPlus } from "@tabler/icons-react"
import { useState } from "react"
import { useTranslation } from 'react-i18next'
import { useAuth } from "../../context/AuthContext"
import { getProgressColor } from "../../utils/progressColor"
import Avatar from "../ui/Avatar"

export default function OrgaCard({ orga, onEdit, onDelete, onDeleteMember, onEditMember, onInvite, onDeleteInvitation, onLeave }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const total = 0;
  const done  = 0;
  const { accent, tint, soft, text } = getProgressColor(done, total)
  const pct = total === 0 ? 0 : Math.round(done / total * 100)

  const members = orga.members ?? []

  const myRole = orga.myRole;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 min-h-40 relative border-l-4 shadow-sm hover:shadow-md transition-shadow"
      style={{ backgroundColor: tint, borderLeftColor: accent }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && myRole === 'Admin' && (
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(orga)}}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
            <IconPencil size={14}/>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(orga) }}
            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors">
            <IconTrash size={14} />
          </button>
        </div>
      )}
        

      <div className="flex items-start justify-between pr-1">
        <h3
        onClick={() => setExpanded(!expanded)}
          className="font-medium text-base leading-snug cursor-pointer hover:underline"
          style={{ color: text }}
        >
          {expanded ? "▼" : "▶"} {orga.name}
        </h3>
        <span
          className={`text-xs rounded-full px-2 py-0.5 whitespace-nowrap transition-all duration-200 ${hovered && myRole === 'Admin' ? 'mr-12' : ''}`}
          style={{ backgroundColor: soft, color: text }}
        >
          {myRole}
        </span>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex -space-x-2">
          {members.length > 0 && (
            <div
              className="px-3 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs"
              style={{ backgroundColor: soft, color: text }}
            >
              {t('organisation.memberCount', { count: members.length })}
            </div>
          )}

          {orga.pendingInvitationsCount > 0 && (
            <div
              className="px-3 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs"
              style={{ backgroundColor: soft, color: text }}
            >
              {t('organisation.pendingInviteCount', { count: orga.pendingInvitationsCount })}
            </div>
          )}

          {myRole === "Admin" && (
            <button
              onClick={() => onInvite(orga)}
              className="p-1 rounded hover:bg-blue-100 text-blue-500"
            >
              <IconUserPlus size={18} />
            </button>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onLeave(orga.id) }}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-auto"
        >
          {t('organisation.leave')}
        </button>
      </div>


      {expanded && (
        <div className="flex flex-col gap-2 mt-3">
          {members.map((member) => (
            <div
            key={member.pseudo}
            className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <Avatar src={member.avatar} username={member.pseudo} size="sm" />
                <span className="text-xs" style={{ color: text }}>
                  {member.pseudo}
                </span>
              </div>

              <span
              className="text-[10px] rounded-full px-2 py-0.5"
              style={{
                backgroundColor: soft,
                color: text
              }}
              >
                {member.role}
              </span>

              {myRole === "Admin" && (
                <div className="hidden group-hover:flex gap-1">
                  <button onClick={() => onEditMember(orga.id, member)}
                    className="p-1 rounded hover:bg-gray-100 text-gray-500"
                    >
                    <IconPencil size={14} />
                  </button>

                  <button 
                    type="button"
                    onClick={() => onDeleteMember(orga.id, member)}
                    className="p-1 rounded hover:bg-red-100 text-red-500"
                    >
                    <IconTrash size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {orga.pendingInvitations.map(inv => (
            <div key={inv.id}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <Avatar src={inv.avatar} username={inv.pseudo} size="sm" />
                <span className="text-xs" style={{ color: text }}>
                  {inv.pseudo}
                </span>
              </div>
            <span
            className="text-[10px] rounded-full px-2 py-0.5"
            style={{
              backgroundColor: soft,
              color: text
            }}
            >
              {t('organisation.pendingInviteLabel')}
            </span>

            {myRole === "Admin" && (
                <div className="hidden group-hover:flex gap-1">
                  <button onClick={() => onDeleteInvitation(orga.id, inv.id)}
                    className="p-1 rounded hover:bg-red-100 text-red-500"
                    >
                    <IconTrash size={14} />
                  </button>
                </div>
              )}
          </div>
          ))}
    </div>
    )}
  </div>
  )
}