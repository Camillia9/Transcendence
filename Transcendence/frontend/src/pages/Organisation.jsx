import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import OrgaCard from "../components/ui/OrgaCard";
import Button from "../components/ui/Button"
import Modal from "../components/ui/Modal"
import Input from "../components/ui/Input";
import { createOrganisation, getMyOrganisations, getOrganisationById, getMembers,updateOrganisation, updateMemberRole, deleteOrganisation, deleteMember, sendInvitation, deleteInvitation, searchUser, getMyInvitations, declineInvitation, acceptInvitation, leaveOrganisation} from "../api/organisations";
import { useSocket, useWorkspaceSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

function Organisations() {
  const { t } = useTranslation()
  const { user } = useAuth()
	const [organisations, setOrganisations] = useState([])
  const [invitations, setInvitations] = useState([])
  const [organisationToDelete, setOrganisationToDelete] = useState(null)
  const [showNewOrganisation, setShowNewOrganisation] = useState(false)
  const [OrganisationToEdit, setOrganisationToEdit] = useState(null)
  
  const [memberToEdit, setMemberToEdit] = useState(null)
  const [memberToDelete, setMemberToDelete] = useState(null)
  const [showNewRole, setShowNewRole] = useState(false)
  const [memberToInvite, setMemberToInvite] = useState(null);
  const [invitationToDelete, setInvitationToDelete] = useState(null)

  const [newName, setNewName]       = useState('')
  const [newMembers, setNewMembers] = useState('')
  const [newErrors, setNewErrors]   = useState({})

  const [newRole, setNewRole]       = useState('')
  const [invitePseudo, setInvitePseudo] = useState("");

  const navigate = useNavigate()
  
  const handleEdit = (organisation) => {
    setNewErrors({})
    setOrganisationToEdit(organisation)
    setNewName(organisation.name)
    setShowNewOrganisation(true)
  }
  const handleDelete = (organisation) => {
    setOrganisationToDelete(organisation)
  }
  const confirmDelete = async () => {
    try {
      await deleteOrganisation(organisationToDelete.id)
      setOrganisations(organisations.filter(org => org.id !== organisationToDelete.id))
      setOrganisationToDelete(null)
    } catch (error) {
      console.error("Impossible de supprimer l'organisation", error)
    }
  }

  const handleEditMember = (organisationId, member, newRole) => {
    const organisation = organisations.find(org => org.id === organisationId);
    const adminCount = organisation.members.filter(m => m.role === "Admin").length;

    if (member.role === "Admin" && adminCount === 1) {
      alert(t('organisation.alerts.lastAdminRole'));
      return;
    }
    setNewErrors({})
    setMemberToEdit({organisationId, member});
    setNewRole(member.role);
  }

  const handleDeleteMember = async (organisationId, member) => {
    const organisation = organisations.find(org => org.id === organisationId);
    const adminCount = organisation.members.filter(m =>m.role === "Admin").length;

    if (member.role === "Admin" && adminCount === 1) {
      alert(t('organisation.alerts.needAtLeastOneAdmin'));
      return;
    }
      
    setMemberToDelete({organisationId, member});
  }

  const confirmDeleteMember = async () => {
    try {
      await deleteMember(
        memberToDelete.organisationId,
        memberToDelete.member.userId
      )
      const data = await getMyOrganisations()
      setOrganisations(data)
      setMemberToDelete(null)
    } catch (error) {
      console.error("Impossible de supprimer l'organisation", error)
    }
  }

  const handleCloseNewOrganisation = () => {
    setNewName('')
    setNewMembers('')
    setNewErrors({})
    setOrganisationToEdit(null)
    setShowNewOrganisation(false)
  }

  const validateNewOrganisation = () => {
    const errors = {}

    if (!newName.trim())
      errors.name = t('organisation.errors.nameRequired')
    else if (newName.trim().length > 20)
      errors.name = t('organisation.errors.nameTooLong')

    return errors
  }

  const handleSubmitOrganisation = async () => {
    const errors = validateNewOrganisation()
    if (Object.keys(errors).length > 0) {
      setNewErrors(errors)
      return
    }
    if (OrganisationToEdit) {
      try {
        const updated = await updateOrganisation(OrganisationToEdit.id, {
          orgName: newName.trim(),
        })
        setOrganisations(organisations.map(org =>
          org.id === OrganisationToEdit.id ? { ...org, ...updated } : org
        ))
        handleCloseNewOrganisation()
      } catch (error) {
        setNewErrors({ global: t('organisation.errors.editFailed') })
        return
      }
    } else {
      try {
        const newOrganisation = await createOrganisation({
          orgName: newName.trim()
        })
        const data = await getMyOrganisations()
        setOrganisations(data)
        handleCloseNewOrganisation()
      } catch (error) {
        setNewErrors({ global: t('organisation.errors.createFailed')})
      }
    }

  }

  const saveRole = async() => {
    try {
      await updateMemberRole(
        memberToEdit.organisationId,
        memberToEdit.member.userId,
        newRole
      );

      const data = await getMyOrganisations();
      setOrganisations(data);

      setMemberToEdit(null);
      setNewRole("");
    } catch (error) {
      setNewErrors({ global: t('organisation.errors.roleUpdateFailed')})
    }
  }

  const handleInvite = (organisation) => {
    setNewErrors({})
    setInvitePseudo('')
    setMemberToInvite(organisation);
  }

  const handleSendInvitation = async () => {
    const alreadyMember = memberToInvite.members.some(
      member => member.pseudo.toLowerCase() === invitePseudo.toLowerCase()
    );

    if (alreadyMember){
      setNewErrors({ global: t('organisation.errors.alreadyMember') });
      return;
    }

    const alreadyInvited = memberToInvite.pendingInvitations.some(
      invitation => invitation.pseudo.toLowerCase() === invitePseudo.toLowerCase()
    );

    if (alreadyInvited) {
      setNewErrors({ global: t('organisation.errors.alreadyInvited') });
      return;
    }
      
    try {
      const user = await searchUser(invitePseudo);

      await sendInvitation(memberToInvite.id, user.id);

      const data = await getMyOrganisations();
      setOrganisations(data);

      handleCloseInvite()
    } catch (error) {
      if (error.status === 404) {
        setNewErrors({ global: t('organisation.errors.userNotFound') })
      } else {
        setNewErrors({ global: t('organisation.errors.inviteFailed')})
      }
    }
  }

  const handleDeleteInvitation = async (organisationId, invitationId) => {
    setInvitationToDelete({organisationId, invitationId});
  }

  const confirmDeleteInvitation = async () => {
    try {
      await deleteInvitation(
        invitationToDelete.organisationId,
        invitationToDelete.invitationId
      )
      const data = await getMyOrganisations()
      setOrganisations(data)
      setInvitationToDelete(null)
    } catch (error) {
      console.error("Impossible de supprimer l'invitation", error)
    }
  }

  async function handleDecline(id) {
    try {
      await declineInvitation(id)
      await loadInvitations()
    } catch (error) {
      console.error('Impossible de refuser l\'invitation', error)
    }
  }

  async function handleAccept(id) {
    try {
      await acceptInvitation(id)
      await loadInvitations()
      await loadOrganisations()
    } catch (error) {
      console.error('Impossible d\'accepter l\'invitation', error)
    }
  }

  const handleCloseInvite = () => {
    setMemberToInvite(null)
    setInvitePseudo('')
    setNewErrors({})
  }

  async function loadOrganisations() {
    try {
      const data = await getMyOrganisations()
      setOrganisations(data)
    } catch(error) {
      console.error('Impossible de charger les organisations', error)
    }
  }

  async function loadInvitations() {
    try {
      const data = await getMyInvitations()
      setInvitations(data)
    } catch (error) {
      console.log('Impossible de charger les invitations', error)
    }
  }

  useEffect(() => {
    loadOrganisations()
    loadInvitations()
  }, [])

  const handleLeaveOrga = async (orgId) => {
    if (!window.confirm(t('organisation.confirmLeave'))) return
    try {
      await leaveOrganisation(orgId)
      const data = await getMyOrganisations()
      setOrganisations(data)
    } catch (error) {
      if (error.status === 400) {
        window.alert(t('organisation.alerts.lastAdminCannotLeave'))
      } else {
        window.alert(t('organisation.alerts.leaveFailed'))
      }
    }
  }

  const workspaceSocket = useWorkspaceSocket()
  useEffect(() => {
    if (!workspaceSocket) return
    const handleMemberRemoved = ({ orgId, removedUserId }) => {
      if (removedUserId === user?.id) {
        setOrganisations(prev => prev.filter(org => org.id !== orgId))
      } else {
        loadOrganisations()
      }
    }
    const handleMemberAdded = () => {
      loadOrganisations()
    }
    const handleInvitationChanged = () => {
      loadOrganisations()
      loadInvitations()
    }
    workspaceSocket.on('organisation:member-removed', handleMemberRemoved)
    workspaceSocket.on('organisation:member-added', handleMemberAdded)
    workspaceSocket.on('organisation:invitation-added', handleInvitationChanged)
    workspaceSocket.on('organisation:invitation-removed', handleInvitationChanged)
    return () => {
      workspaceSocket.off('organisation:member-removed', handleMemberRemoved)
      workspaceSocket.off('organisation:member-added', handleMemberAdded)
      workspaceSocket.off('organisation:invitation-added', handleInvitationChanged)
      workspaceSocket.off('organisation:invitation-removed', handleInvitationChanged)
    }
  }, [workspaceSocket, user?.id])

  const ORGA_NOTIF_TYPES = ['OrgaUpdated', 'OrgaDeleted', 'MemberLeftOrga', 'RoleChanged', 'RemovedFromOrga', 'MemberRemoved', 'InvitationAccepted', 'InvitationDeclined', 'InvitationSent', 'InvitationCancelled']
  const INVITATION_NOTIF_TYPES = ['InvitationSent', 'InvitationCancelled']

  const socket = useSocket()
  useEffect(() => {
    if (!socket) return
    const handleNotification = (notif) => {
      if (ORGA_NOTIF_TYPES.includes(notif.type)) loadOrganisations()
      if (INVITATION_NOTIF_TYPES.includes(notif.type)) loadInvitations()
    }
    socket.on('notification:new', handleNotification)
    return () => socket.off('notification:new', handleNotification)
  }, [socket])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-primary-900"> {t('organisation.title')} </h1>
        <Button onClick={() => setShowNewOrganisation(true)}>
          + {t('organisation.newOrganisation')}
        </Button>
      </div>

      {invitations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('organisation.myInvitations')}</h2>
          <div className="flex flex-col gap-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-3">
                <span className="text-sm text-gray-700">
                  <Trans
                    i18nKey="organisation.invitationText"
                    values={{ inviter: inv.inviter.pseudo, orgName: inv.organisation.name }}
                    components={{ b: <span className="font-medium" /> }}
                  />
                </span>
            
                <div className="flex gap-2">
                  <Button onClick={() => handleAccept(inv.id)}>{t('organisation.accept')}</Button>
                  <Button variant="outline" onClick={() => handleDecline(inv.id)}>{t('organisation.decline')}</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {organisations.length === 0 ? (
        <p className="text-sm text-gray-400">{t('organisation.emptyState')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {organisations.map(organisation => (
            <OrgaCard
            orga={organisation}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
            onInvite={handleInvite}
            onDeleteInvitation={handleDeleteInvitation}
            onLeave={handleLeaveOrga}
            key={organisation.id}
            />
          ))}
        </div>

      )}
      {organisationToDelete && (
        <Modal
          isOpen={!!organisationToDelete}
          onClose={() => setOrganisationToDelete(null)}
          title={t('organisation.deleteModal.title')}
        >
          <p>{t('organisation.deleteModal.confirm', { name: organisationToDelete.name })}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOrganisationToDelete(null)}> {t('common.cancel')} </Button>
            <Button variant="danger" onClick={confirmDelete}> {t('common.delete')} </Button>
          </div>
        </Modal>
      )}
      <Modal
        isOpen={showNewOrganisation}
        onClose={handleCloseNewOrganisation}
        title={OrganisationToEdit ? t('organisation.editModal.title') : t('organisation.newOrganisation')}
      >
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-sm text-gray-500"> 
            {t('organisation.nameLabel')} *
          </label>
          <Input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('organisation.nameLabel')}
            light
          />
          {newErrors.name && (
            <p className="text-red-400 text-sm mt-1">{newErrors.name}</p>
          )}
        </div>
        {newErrors.global && (
          <p className="text-red-400 text-sm mb-2">{newErrors.global}</p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCloseNewOrganisation}> {t('common.cancel')} </Button>
          <Button variant="primary" onClick={handleSubmitOrganisation}>
            {OrganisationToEdit ? t('common.save') : t('organisation.createSubmit')}
          </Button>
        </div>
      </Modal>
      
      {memberToDelete && (
        <Modal
          isOpen={!!memberToDelete}
          onClose={() => setMemberToDelete(null)}
          title={t('organisation.removeMemberModal.title')}
        >
          <p>{t('organisation.removeMemberModal.confirm', { pseudo: memberToDelete.member.pseudo })}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setMemberToDelete(null)}> {t('common.cancel')} </Button>
            <Button variant="danger" onClick={confirmDeleteMember}> {t('organisation.removeMemberModal.confirmButton')} </Button>
          </div>
        </Modal>
      )}
      {memberToEdit && (
        <Modal
          isOpen={!!memberToEdit}
          onClose={() => setMemberToEdit(null)}
          title={t('organisation.editRoleModal.title')}
        >
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="Admin">{t('organisation.roles.admin')}</option>
            <option value="Member">{t('organisation.roles.member')}</option>
          </select>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setMemberToEdit(null)}> {t('common.cancel')} </Button>
            <Button variant="primary" onClick={saveRole}> {t('common.save')} </Button>
          </div>
        </Modal>
      )}
        {invitationToDelete && (
        <Modal
          isOpen={!!invitationToDelete}
          onClose={() => setInvitationToDelete(null)}
          title={t('organisation.cancelInvitationModal.title')}
        >
          <p>{t('organisation.cancelInvitationModal.confirm')}</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setInvitationToDelete(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={confirmDeleteInvitation}>{t('common.confirm')}</Button>
          </div>
        </Modal>
      )}
      <Modal
        isOpen={!!memberToInvite}
        onClose={handleCloseInvite}
        title={t('organisation.inviteModal.title')}
      >
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-sm text-gray-500">
            {t('organisation.pseudoLabel')}
          </label>
          <Input
            type="text"
            value={invitePseudo}
            onChange={(e) => setInvitePseudo(e.target.value)}
            placeholder={t('organisation.invitePlaceholder')}
            light
          />
            {newErrors.global && (
            <p className="text-red-400 text-sm mt-1">{newErrors.global}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCloseInvite}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSendInvitation}
          >
            {t('organisation.inviteSubmit')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default Organisations
