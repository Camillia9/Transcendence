import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import OrgaCard from "../components/ui/OrgaCard";
import Button from "../components/ui/Button"
import Modal from "../components/ui/Modal"
import Input from "../components/ui/Input";
import { createOrganisation, getMyOrganisations, getOrganisationById, getMembers,updateOrganisation, updateMemberRole, deleteOrganisation, deleteMember, sendInvitation, deleteInvitation, searchUser, getMyInvitations, declineInvitation, acceptInvitation, leaveOrganisation} from "../api/organisations";
import { useSocket, useWorkspaceSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

function Organisations() {
  const { user } = useAuth()
	// etat pour lire le tableau et pouvoir le modifier
	const [organisations, setOrganisations] = useState([])
  const [invitations, setInvitations] = useState([])
  // L'etat:l'orga qu'on veut supp
  const [organisationToDelete, setOrganisationToDelete] = useState(null)
  // L'etat: L'orga qu'on veut add ou edit
  const [showNewOrganisation, setShowNewOrganisation] = useState(false)
  const [OrganisationToEdit, setOrganisationToEdit] = useState(null)
  
  const [memberToEdit, setMemberToEdit] = useState(null)
  const [memberToDelete, setMemberToDelete] = useState(null)
  const [showNewRole, setShowNewRole] = useState(false)
  const [memberToInvite, setMemberToInvite] = useState(null);
  const [invitationToDelete, setInvitationToDelete] = useState(null)

  // Touts les etats utile pour le bouton "nouvelle orga"
  const [newName, setNewName]       = useState('') // string
  const [newMembers, setNewMembers] = useState('') // string
  const [newErrors, setNewErrors]   = useState({}) // Objet

  const [newRole, setNewRole]       = useState('') // string
  const [invitePseudo, setInvitePseudo] = useState("");

  // Provisoire
  const navigate = useNavigate()
  
  // Lorsqu'on appuie sur le crayon. A modifier
  const handleEdit = (organisation) => {
    setNewErrors({})
    setOrganisationToEdit(organisation)
    setNewName(organisation.name)
    setShowNewOrganisation(true)
  }
  // Lorsqu'on appuie sur la benne. Elle ne supprime pas l'orga, la memorise juste pour afficher le modal de confirmation
  const handleDelete = (organisation) => {
    setOrganisationToDelete(organisation)
  }
  // Lorsqu'on confirme vouloir supp l'orga sur le modal
  const confirmDelete = async () => {
    try {
      await deleteOrganisation(organisationToDelete.id)
      setOrganisations(organisations.filter(org => org.id !== organisationToDelete.id)) // garde toutes les orga (le tableau) sauf celui-ci
      setOrganisationToDelete(null)
    } catch (error) {
      console.error("Impossible de supprimer l'organisation", error)
    }
  }

  // Lorsqu'on appuie sur le crayon. A modifier
  const handleEditMember = (organisationId, member, newRole) => {
    const organisation = organisations.find(org => org.id === organisationId);
    const adminCount = organisation.members.filter(m => m.role === "Admin").length;

    if (member.role === "Admin" && adminCount === 1) {
      alert("Impossible de modifier le role du dernier administrateur. Il faut toujours au moins un admnistrateur dans l'organisation.");
      return;
    }
    setNewErrors({})
    setMemberToEdit({organisationId, member});
    setNewRole(member.role);
  }

  // Lorsqu'on appuie sur la benne. Elle ne supprime pas l'orga, la memorise juste pour afficher le modal de confirmation
  const handleDeleteMember = async (organisationId, member) => {
    const organisation = organisations.find(org => org.id === organisationId);
    const adminCount = organisation.members.filter(m =>m.role === "Admin").length;

    if (member.role === "Admin" && adminCount === 1) {
      alert("Une organisation doit toujours avoir au moins un administrateur.");
      return;
    }
      
    setMemberToDelete({organisationId, member});
  }

  // Lorsqu'on confirme vouloir supp l'orga sur le modal
  const confirmDeleteMember = async () => {
    try {
      await deleteMember(
        memberToDelete.organisationId,
        memberToDelete.member.userId
      )
      const data = await getMyOrganisations()
      setOrganisations(data) // garde toutes les orga (le tableau) sauf celui-ci
      setMemberToDelete(null)
    } catch (error) {
      console.error("Impossible de supprimer l'organisation", error)
    }
  }

  const handleCloseNewOrganisation = () => {
    // Reinitialise tout les etats lorsque l'orga est cree ou qu'on ferme avant
    setNewName('')
    setNewMembers('')
    setNewErrors({})
    setOrganisationToEdit(null) // remet le mode edition a null
    setShowNewOrganisation(false) // ferme la modal
  }

  // vérifier les champs et retourner un objet avec les erreurs trouvées.
  const validateNewOrganisation = () => {
    // errors est un objet ({}). Il peut stocker plusieurs strings.
    // ici il stockera les strings si les champs de newOrga sont invalides
    const errors = {}

    // Si le nameOrga ne contient rien ou que des espaces on stock l'erreur dans errors
    if (!newName.trim()) 
      errors.name = "Le nom de l'organisation est obligatoire"

    // return l'objet complet
    return errors
  }

  // Fonction appelle lorsqu'on soumet le formulaire du new Orga
  const handleSubmitOrganisation = async () => {
    /*Object.keys prend un objet et renvoie un tableau contenant les noms de ses proprietes
    // ex:  const errors = {
      name: "Le nom est obligatoire",
      email: "Email invalide",
      } 
      Object.keys(errors) = ["name", "email"]
      // */
    const errors = validateNewOrganisation()
    if (Object.keys(errors).length > 0) {
      setNewErrors(errors)
      return
    }
    if (OrganisationToEdit) {
      // MODE EDITION (remplace orga existant)
      // Updated : recopie tout l'orga d'origine en modifiant seulement :
      try {
        const updated = await updateOrganisation(OrganisationToEdit.id, {
          orgName: newName.trim(),
        })
        setOrganisations(organisations.map(org =>
          org.id === OrganisationToEdit.id ? { ...org, ...updated } : org // « pars de l'ancien orga complet, puis les écrase avec les champs revenus du back ».
        ))
        handleCloseNewOrganisation()
      } catch (error) {
        setNewErrors({ global: "Impossible de modifier l'organisation" })
        return
      }
      // Sert a parcourir toutes les orga pour modifier celui qu'on veut. 
    } else {
      try {
        // On envoie uniquement ce que la route accepte
        const newOrganisation = await createOrganisation({
          orgName: newName.trim()
        })
        // le back renvoie l'orga complete
        const data = await getMyOrganisations()
        setOrganisations(data)// creation newTableau sans toucher aux autres
        handleCloseNewOrganisation()
      } catch (error) {
        setNewErrors({ global: "Impossible de creer l'organisation"})
      }
    }

  }

  const saveRole = async() => {
    try {
      console.log(memberToEdit.organisationId, memberToEdit.member.userId, newRole);
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
      setNewErrors({ global: "Impossible de modifier le role"})
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
      setNewErrors({ global: "Cet utilisateur est deja membre de l'organisation" });
      return;
    }

    const alreadyInvited = memberToInvite.pendingInvitations.some(
      invitation => invitation.pseudo.toLowerCase() === invitePseudo.toLowerCase()
    );

    if (alreadyInvited) {
      setNewErrors({ global: "Une invitation est deja en attente pour cet utilisateur" });
      return;
    }
      
    try {
      const user = await searchUser(invitePseudo);

      await sendInvitation(memberToInvite.id, user.id);

      const data = await getMyOrganisations();
      setOrganisations(data);

      handleCloseInvite()
    } catch (error) {
      console.log('STATUS REÇU →', error.status)
      if (error.status === 404) {
        setNewErrors({ global: "Auccun utilisateur avec ce pseudo" })
      } else {
        setNewErrors({ global: "Impossible d'envoyer l'invitation"})
      }
    }
  }

  // Lorsqu'on appuie sur la benne. Elle ne supprime pas l'invit, la memorise juste pour afficher le modal de confirmation
  const handleDeleteInvitation = async (organisationId, invitationId) => {
    console.log('clic suppression invit:', organisationId, invitationId)
    const organisation = organisations.find(org => org.id === organisationId);
    setInvitationToDelete({organisationId, invitationId});
  }

  // Lorsqu'on confirme vouloir supp l'invit sur le modal
  const confirmDeleteInvitation = async () => {
    try {
      await deleteInvitation(
        invitationToDelete.organisationId,
        invitationToDelete.invitationId
      )
      const data = await getMyOrganisations()
      setOrganisations(data) // garde toutes les orga (le tableau) sauf celui-ci
      setInvitationToDelete(null)
    } catch (error) {
      console.error("Impossible de supprimer l'invitation", error)
    }
  }

  // Refuser une invit : Disparait de la liste
  async function handleDecline(id) {
    try {
      await declineInvitation(id)
      await loadInvitations()
    } catch (error) {
      console.error('Impossible de refuser l\'invitation', error)
    }
  }

  // Acceter une invit : membres de l'orga
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


  // BRANCHEMENT BACK/FRONT:
  // état local pour stocker ce que le back nous répond.
  // TEST de depart. A supp des qu'on aurra remplace les mock par de vraie donnees
//   const [health, setHealth] = useState('...')

  // useEffect avec [] : s'execute une fois au montage.
//   useEffect(() => {
//     // fction asynchrone : "Fonction qui contient des attentes"
//     async function checkBackend() {
//       try {
//         const data = await getHealth()
//         setHealth(data.status)
//       } catch (error) {
//         // Si le back ne repond pas on le note plutot que de planter 
//         setHealth('injoignable')
//       }
//     }
//     checkBackend()
//   }, [])

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
    if (!window.confirm("Quitter cette organisation ?")) return
    try {
      await leaveOrganisation(orgId)
      const data = await getMyOrganisations()
      setOrganisations(data)
    } catch (error) {
      if (error.status === 400) {
        window.alert("Vous êtes le dernier admin, vous ne pouvez pas quitter l'organisation.")
      } else {
        window.alert("Impossible de quitter l'organisation.")
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

  //console.log("test inv", invitations)

  return (
    <div className="flex flex-col gap-6">
      {/* <p>État du backend : {health}</p> */}
        {/*Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-primary-900"> Mes organisations </h1>
        <Button onClick={() => setShowNewOrganisation(true)}>
          + Nouvelle organisation
        </Button>
      </div>

      {invitations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Mes invitations</h2>
          <div className="flex flex-col gap-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-3">
                {/* Texte : qui t'invite, à quelle orga */}
                <span className="text-sm text-gray-700">
                  <span className="font-medium">{inv.inviter.pseudo}</span> t'invite à rejoindre <span className="font-medium">{inv.organisation.name}</span>
                </span>
            
                {/* Les deux actions */}
                <div className="flex gap-2">
                  <Button onClick={() => handleAccept(inv.id)}>Accepter</Button>
                  <Button variant="outline" onClick={() => handleDecline(inv.id)}>Refuser</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/*Grille responsive*/}
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
      {/*Modal supprimer une orga */}
      {organisationToDelete && (
        <Modal
          isOpen={!!organisationToDelete}
          onClose={() => setOrganisationToDelete(null)}
          title="Supprimer cette organisation ?"
        >
          <p> {organisationToDelete.name} sera supprime definitivement </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOrganisationToDelete(null)}> Annuler </Button>
            <Button variant="danger" onClick={confirmDelete}> Supprimer </Button>
          </div>
        </Modal>
      )}
      {/*Modal Cree une nouvelle orga OU edit une orga (utilisations de la meme modal)*/}
      <Modal
        isOpen={showNewOrganisation}
        onClose={handleCloseNewOrganisation}
        title={OrganisationToEdit ? "Modifier l'organisation" : "Nouvelle organisation"}
      >
        {/*Entree du NameOrganisation */}
        <div className="flex flex-col gap-1 mb-4">
          {/*Label = tire du champs*/}
          <label className="text-sm text-gray-500"> 
            Nom de l'organisation *
          </label>
          {/*Input = zone saisie */}
          <Input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom de l'organisation"
            light
          />
          {newErrors.name && (
            <p className="text-red-400 text-sm mt-1">{newErrors.name}</p>
          )}
        </div>
        {/*Entree des membres */}
        {/*Masquer en mode edition */}
        {/* {!OrganisationToEdit && (
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-sm text-gray-500">
              Ajout de membres (separation par virgule !)
            </label>
            <Input
              type="text"
              value={newMembers}
              onChange={(e) => setNewMembers(e.target.value)}
              placeholder="Clara, Vincent, Remy"
              light
            />
          </div>
        )} */}
        {newErrors.global && (
          <p className="text-red-400 text-sm mb-2">{newErrors.global}</p>
        )}
        {/*Boutons Annuler/Cree l'orga */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCloseNewOrganisation}> Annuler </Button>
          <Button variant="primary" onClick={handleSubmitOrganisation}>
            {OrganisationToEdit ? "Enregistrer" : "Creer l'organisation"}
          </Button>
        </div>
      </Modal>
      
      {memberToDelete && (
        <Modal
          isOpen={!!memberToDelete}
          onClose={() => setMemberToDelete(null)}
          title="Retirer ce membre ?"
        >
          <p> {memberToDelete.member.pseudo} sera retirer definitivement de cette organisation</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setMemberToDelete(null)}> Annuler </Button>
            <Button variant="danger" onClick={confirmDeleteMember}> Retirer </Button>
          </div>
        </Modal>
      )}
      {memberToEdit && (
        <Modal
          isOpen={!!memberToEdit}
          onClose={() => setMemberToEdit(null)}
          title="Modifier le role"
        >
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="Admin">Admin</option>
            <option value="Member">Member</option>
          </select>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setMemberToEdit(null)}> Annuler </Button>
            <Button variant="primary" onClick={saveRole}> Enregistrer </Button>
          </div>
        </Modal>
      )}
        {invitationToDelete && (
        <Modal
          isOpen={!!invitationToDelete}
          onClose={() => setInvitationToDelete(null)}
          title="Annuler cette invitation ?"
        >
          <p>L'invitation sera annulée.</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setInvitationToDelete(null)}>Annuler</Button>
            <Button variant="danger" onClick={confirmDeleteInvitation}>Confirmer</Button>
          </div>
        </Modal>
      )}
      <Modal
        isOpen={!!memberToInvite}
        onClose={handleCloseInvite}
        title="Inviter un membre"
      >
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-sm text-gray-500">
            Pseudo
          </label>
          <Input
            type="text"
            value={invitePseudo}
            onChange={(e) => setInvitePseudo(e.target.value)}
            placeholder="Membre a ajouter"
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
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSendInvitation}
          >
            Inviter
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default Organisations