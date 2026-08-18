import { IconPencil, IconTrash, IconUserPlus } from "@tabler/icons-react"
import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { getProgressColor } from "../../utils/progressColor"
// useState permet de creer une variable qui peut changer pendant que le composant est afficher (par ex savoir si la souris est au dessus de la carte)
// useAuth permet de recuperer l'utilisateur connecter


export default function OrgaCard({ orga, onEdit, onDelete, onDeleteMember, onEditMember, onInvite, onDeleteInvitation, onLeave }) {
  // DEBUG
  //console.log("ORGA =", orga);
  //console.log("MEMBERS =", JSON.stringify(orga.members, null, 2));
  //console.log("INVIT =", JSON.stringify(orga.pendingInvitations, null, 2));
  //{console.log("CARD INVITATIONS", orga.pendingInvitations)}
  const { user } = useAuth()
  const [hovered, setHovered] = useState(false) // Gere le survol
  const [expanded, setExpanded] = useState(false)

  // const orgaMembres = orga.members ?? []
  // const total = orgaMembres.length
  // const total = orga.memberCount;

  // const accent = "#3b82f6";
  // const tint = "#ffffff";
  // const soft = "#e5e7eb";
  // const text = "#1f2937";
  const total = 0;
  const done  = 0;
  const { accent, tint, soft, text } = getProgressColor(done, total)
  const pct = total === 0 ? 0 : Math.round(done / total * 100)

  // Les membres: ils ont comme entree : { role, user: { id, pseudo, avatar }}
  // const memberships = project.projectMembers ?? []
  const members = orga.members ?? []

  // Mon role 
  const myRole = orga.myRole;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 min-h-40 relative border-l-4 shadow-sm hover:shadow-md transition-shadow"
      style={{ backgroundColor: tint, borderLeftColor: accent }}   /* l'accent latéral = couleur d'avancement */
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/*Icones au survol pour le manager*/}
      {/* stopPropagation: s'arrête au bouton edit, ne remonte pas aux parents en ouvrant une page */}
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
        

      {/*En-tete: Nom de l'orga */}
      <div className="flex items-start justify-between pr-1">
        <h3
        onClick={() => setExpanded(!expanded)}
          className="font-medium text-base leading-snug cursor-pointer hover:underline"
          style={{ color: text }}
        >
          {expanded ? "▼" : "▶"} {orga.name}
        </h3>
        {/* Transition au survol*/}
        <span
          className={`text-xs rounded-full px-2 py-0.5 whitespace-nowrap transition-all duration-200 ${hovered && myRole === 'Admin' ? 'mr-12' : ''}`}
          style={{ backgroundColor: soft, color: text }}
        >
          {myRole}
        </span>
      </div>

      {/* nombre de membres */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex -space-x-2">
          {members.length > 0 && (
            <div
              className="px-3 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs"
              style={{ backgroundColor: soft, color: text }}
            >
              {members.length} {members.length > 1 ? "membres" : "membre"}
            </div>
          )}

          {orga.pendingInvitationsCount > 0 && (
            <div
              className="px-3 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs"
              style={{ backgroundColor: soft, color: text }}
            >
              {orga.pendingInvitationsCount} invite{orga.pendingInvitationsCount > 1 ? "s" : ""}
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

        {/* Bouton quitter — visible pour tout membre */}
        <button
          onClick={(e) => { e.stopPropagation(); onLeave(orga.id) }}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-auto"
        >
          Quitter
        </button>
      </div>


      {/* Membres visibles seulement quand la carte est ouverte */}
      {expanded && (
        <div className="flex flex-col gap-2 mt-3">
          {members.map((member) => (
            <div
            key={member.pseudo}
            className="flex items-center justify-between group"
            >
              {/* Avatar + pseudo */}
              <div className="flex items-center gap-2">
                <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border"
                style={{ backgroundColor: soft, color: text }}
                >
                  {member.avatar ? (
                    <img
                    src={member.avatar}
                    alt={member.pseudo}
                    className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    member.pseudo[0].toUpperCase()
                  )}
                </div>

                <span className="text-xs" style={{ color: text }}>
                  {member.pseudo}
                </span>
              </div>

              {/* Role */}
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
              {/* Avatar + pseudo */}
              <div className="flex items-center gap-2">
                <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border"
                style={{ backgroundColor: soft, color: text }}
                >
                  {inv.avatar ? (
                    <img
                    src={inv.avatar}
                    alt={inv.pseudo}
                    className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    inv.pseudo[0].toUpperCase()
                  )}
                </div>
                <span className="text-xs" style={{ color: text }}>
                  {inv.pseudo}
                </span>
              </div>
            {/* Role */}
            <span
            className="text-[10px] rounded-full px-2 py-0.5"
            style={{
              backgroundColor: soft,
              color: text
            }}
            >
              Invite
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
