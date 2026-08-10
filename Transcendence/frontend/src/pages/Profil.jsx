import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { changePassword, deleteAccount, getProfile, updateProfile } from '../api/users'
import { useNavigate } from 'react-router-dom'

function Profil() {
  const { user, login, logout } = useAuth()
  const [profile, setProfile] = useState(null) // Cree un profile vide. null au cas ou le profil n'a pas fini de charger(voir plus bas)
  const navigate = useNavigate()

  // Les etats des champs du profil
  const [pseudo, setPseudo] = useState('')
  const [statut, setStatut] = useState('')
  const [language, setLanguage] = useState('')
  const [avatar, setAvatar] = useState('')
  // Save les erreurs des champs du profile
  const [error, setError] = useState('')

  // Les etats pour changer le MDP
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Champs RGPD: Suppression profil 
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('') // save l'erreur si le mdp pour confirmer le mdp du compte a sa suppresion est pas ok
  const [confirmDelete, setConfirmDelete] = useState(false) 

  async function handleSave () {
    try {
      setError('') // vide le precendent message d'erreur
      const data = await updateProfile({pseudo, statut, langue: language, avatar})
      login(data) // accessible via useAuth()
      setProfile(data) // met a jour instantannement apres les chnagement la carte profile
    } catch (err) {
      setError(err.message) // le back a ecrit l'erreur. On l'affiche
    }
  }

  async function loadProfile() {
    try {
      const data = await getProfile()
      setProfile(data) // On remplit le tableau 
    } catch (error) {
      console.error('Impossible de charger le profile', error)
    }
  }

  // charge mon profile au montage
  useEffect(() => {
    loadProfile()
  }, [])


  // ce bloc s'exécute à chaque fois que profile change
  useEffect(() => {
   if (profile) {
    // On recup donnes du back. On save les nouvelles valeurs mais on ne les echange pas direct. 
    // Au cas ou on annule il faut se rapler des anciennes valeurs
    setPseudo(profile.pseudo)
    setStatut(profile.statut)
    setLanguage(profile.langue)
    setAvatar(profile.avatar ?? '') // un Avatar peut etre null
   }
  }, [profile])   // le tableau de dépendances : "surveille profile"

  function handleCancel() {
    setPseudo(profile.pseudo)
    setStatut(profile.statut)
    setLanguage(profile.langue)
    setError('')
  }

  // Gestion du MDP 
    async function handleChangePassword () {
    try {
      setPasswordError('') // vide le precendent message d'erreur
      await changePassword(oldPassword, newPassword)
      setOldPassword('') // vide l'ancien state
      setNewPassword('') // vide l'ancien satate
      setPasswordSuccess('Mot de passe change')
    } catch (err) {
      setPasswordError(err.message) // le back a ecrit l'erreur. On l'affiche
    }
  }

  // Gestion suppression profil (RGPD)
  async function handleDeleteAccount() {
    try {
      setDeleteError('')
      await deleteAccount(deletePassword)
      logout() // vide user + storage (accessible via useAuth())
      navigate('/')
    } catch (error) {
      setDeleteError(error.message) // le back ecrit l'erreur
    }
  }

  function cancelDelete() {
    setConfirmDelete(false)
    setDeletePassword('')
    setDeleteError('')
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0] // le fichier choisis
    if (!file) return // Au cas ou le user annule sa selection
    setError('') // on vide le state error des precedents essai

    if (!file.type.startsWith('image/')) { // startWith : fonction qui test si un texte commence par un prefix donnee
      setError('Le fichier doit etre une image')
      return
    }

    if (file.size > 2 * 1024 * 1024) { // file.size est un nombre en octets. Pour poser une limite à 2 Mo, tu dois exprimer 2 Mo en octets : 2 × 1024 Ko × 1024 octets = ~2 097 152
      setError('Image trop lourde (max 2 Mo)')
      return
    }

    const reader = new FileReader() // Explication dans xplain

    // Bloc executee QUE QUAND la lecture est fini. C'est une promesse pour plus tard, pas une action immediate. Elle range juste une fonction dans un tirroir "unload"
    reader.onload = () => {
      console.log('onload OK', reader.result.slice(0, 30))
      setAvatar(reader.result) // reader.result contient la chaine en base 64 complete
    }
    reader.readAsDataURL(file) // lance la lecture. Elle prend quelques ms. et ensuite le navigateur va regarder dans le tirroir onload et declanchera la fonction
  }

  // Tant que le GET n'a pas repondu on attend. Ensuite profile devient l'objet et le vrai ccontenu s'affcihe
  if (!profile) return <p>Chargement...</p>

  console.log('avatar dans le render', avatar)

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6 py-10">

      {/*Choix de style : */}
      <Card className="flex flex-col items-center gap-3 text-center">
      {/*<Card className="flex items-center justify-center gap-4">*/}
        <Avatar
          src={avatar} // state, pour avoir la Maj direct. 
          username={profile.pseudo}
          size="lg"
        />
        <input
          type='file'
          accept='image/*' // ne propose que des images dans le selecteurs
          onChange={handleAvatarChange}
        />
        <div>
          <h1 className="text-xl font-bold text-gray-900">{profile.pseudo}</h1>
          <p className="text-gray-500 text-sm">{profile.email}</p>
        </div>
      </Card>

      <Card className='flex flex-col gap-4'>
        {/*PSeudo */}
        <div className='flex items-center justify-between'>
          <label className='text-sm text-gray-500'>Pseudo</label>
            <Input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Nouveau pseudo"
              className="w-48"
          />
        </div>

        {/*Statut */}
        <div className='flex items-center justify-between'>
          <label className='text-sm text-gray-500'>Statut</label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)} // e.target.value contient la value de l'option selectionne
              className='text-sm text-gray-700 border border-gray-200 rounded-lg px-2 py-1'
            >
              <option value="Available">Disponible</option>
              <option value="Busy">Occupe</option>
              <option value="Away">Absent</option>
            </select>
        </div>

         {/*Langue */}
        <div className='flex items-center justify-between'>
          <label className='text-sm text-gray-500'>Langue</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)} // e.target.value contient la value de l'option selectionne
              className='text-sm text-gray-700 border border-gray-200 rounded-lg px-2 py-1'
            >
              <option value="fr">Francais</option>
              <option value="en">Anglais</option>
              <option value="cn">Chinois</option>

            </select>
        </div>

        {error && <p className='text-sm text-red-400'>{error}</p>}
        
        {/*Les boutons */}
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleCancel}>Reinitialiser</Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </div>
      </Card>

      {/*Modifier le MDP */}
      <Card className='flex flex-col gap-4'>
        <h2 className='text-sm font-medium text-gray-700'>Modifier le mot de passe</h2>
        {/*Ancien MDP */}
        <div className='flex items-center justify-between'>
          <label className='text-sm text-gray-500'>Mot de passe actuel</label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Mot de passe actuel"
              className="w-48"
          />
        </div>
        {/*Nouveau mot de passe */}
        <div className='flex items-center justify-between'>
          <label className='text-sm text-gray-500'>Nouveau mot de passe</label>
          <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              className="w-48"
          />
        </div>
          {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
          <div className='flex justify-end mt-2'>
            <Button onClick={handleChangePassword}>Changer</Button>
          </div>

          {passwordSuccess && <p className="text-sm text-green-500">{passwordSuccess}</p>}
      </Card>

      {/*Suppression du compte (RGPD)*/}
      <Card className='flex flex-col gap-4'>
        <h2 className='text-sm font-medium text-red-800'>Suppression du compte</h2>
        {/*1er temps: Juste le bouton "suppression du compte"*/}
        {!confirmDelete ? (
          <Button variant='danger' onClick={() => setConfirmDelete(true)}>
            Supprimer mon compte
          </Button>
        ) : (
          //2nd temps: Champs mdp releves 
          <div className='flec flex-col gap-3'>
            <p className='text-sm text-gray-500'>
              Cette action est irreversible.</p>
            <p className='text-sm text-gray-500'>
              Entre ton mot de passe pour supprimer ton compte</p>
            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Mot de passe"
            />
            {deletePassword && <p className='text-sm text-red-400'>{deleteError}</p>}
            <div className='flex justify-end gap-2'>
              <Button onClick={cancelDelete}>Annuler</Button>
              <Button variant='danger' onClick={handleDeleteAccount}>
                Confirmer la suppression
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Profil