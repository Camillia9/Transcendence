import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

import { changePassword, deleteAccount, getProfile, updateProfile } from '../api/users'
import { useNavigate } from 'react-router-dom'
import { setup2FA, verify2FA } from '../api/auth'
import formatStatus, { STATUS_VALUES } from '../utils/status'

function Profil() {
  const { user, login, logout } = useAuth()
  const [profile, setProfile] = useState(null) // Cree un profile vide. null au cas ou le profil n'a pas fini de charger(voir plus bas)
  const navigate = useNavigate()
  const fileInputRef = useRef(null) // Servira a cacher le "Browse... No file selected" en dessous de l'avatar

  // Les etats des champs du profil
  const [pseudo, setPseudo] = useState('')
  const [statut, setStatut] = useState('')
  const [language, setLanguage] = useState('')
  const [avatar, setAvatar] = useState('')
  // Save les erreurs des champs du profile et l'avatar
  const [error, setError] = useState('')
  const [avatarError, setErrorAvatar] = useState('')

  // Les etats pour changer le MDP
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Champs RGPD: Suppression profil 
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('') // save l'erreur si le mdp pour confirmer le mdp du compte a sa suppresion est pas ok
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Etas pour gerer le 2FA
  const [qrCode, setQrCode] = useState(null)      // le QR code reçu (null tant qu'on n'a pas cliqué Activer)
  const [code, setCode] = useState('')            // le code à 6 chiffres saisi
  const [twoFAError, setTwoFAError] = useState('') // erreur propre à la 2FA 

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
    setAvatar(profile.avatar ?? '')
    setError('')
    setErrorAvatar('')
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
    setErrorAvatar('') // on vide le state error des precedents essai

    if (!file.type.startsWith('image/')) { // startWith : fonction qui test si un texte commence par un prefix donnee
      setErrorAvatar('Le fichier doit etre une image')
      return
    }

    const reader = new FileReader() // Explication dans xplain

    // Bloc executee QUE QUAND la lecture est fini. C'est une promesse pour plus tard, pas une action immediate. Elle range juste une fonction dans un tirroir "unload"
    reader.onload = () => {
      ///*Debug*/ console.log('onload OK', reader.result.slice(0, 30))
      const img = new Image()
      img.onload = () => {
        // Calcule les nouvelles dimensions (max 200px), en gardant les proportions
        const maxSize = 200
        let { width, height } = img
        if (width > height) {
          if (width > maxSize) { height = height * (maxSize / width); width = maxSize }
        } else {
          if (height > maxSize) { width = width * (maxSize / height); height = maxSize }
        }

        // Redessine l'image réduite dans un canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)

        setAvatar(canvas.toDataURL('image/jpeg', 0.8)) // Exporte en JPEG compressé (0.8 = qualité). C'est CETTE version qu'on stocke
      }
      img.src = reader.result // On charge l'image a partie du base64 lu
    }
    reader.readAsDataURL(file) // lance la lecture. Elle prend quelques ms. et ensuite le navigateur va regarder dans le tirroir onload et declanchera la fonction
  }

  function handleRemoveAvatar() {
    setAvatar('')
  }

  // Recuperer le QrCode (2FA)
  async function handleSetup2FA() {
    setTwoFAError('')
    try {
      const data = await setup2FA()
      setQrCode(data.qrCode) // le back renvoie qrCode
    } catch (error) {
      setTwoFAError('Impossible de demarrer la configuration')
    }
  }

  // saisie du code et confirmation
  async function handleVerify2FA() {
    setTwoFAError('')
    try {
      await verify2FA(code)
      setQrCode(null) // quitte le mode config
      setCode('')
      await loadProfile() // recharge le profil : twoFactorEnabled devient true
    } catch (error) {
      setTwoFAError('Code invalide') // le back renvoie 'Invalid mode'
    }
  }

  // Tant que le GET n'a pas repondu on attend. Ensuite profile devient l'objet et le vrai ccontenu s'affcihe
  if (!profile) return <p>Chargement...</p>

  // Debug 
  //console.log(profile)

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6 py-10">

      {/*Choix de style : */}
      <Card className="flex flex-col items-center gap-3 text-center">
        <div
          onClick={() => fileInputRef.current.click()}
          className="relative cursor-pointer group"
        >
          <Avatar
            src={avatar}
            username={profile.pseudo}
            size="lg"
          />
          {/*Voile au survol*/}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className='text-white text-xs'>Modifier</span>
          </div>
        </div>

        <input
          type='file'
          accept='image/*' // ne propose que des images dans le selecteurs
          onChange={handleAvatarChange}
          ref={fileInputRef}
          className='hidden'
        />

        <div>
          <h1 className="text-xl font-bold text-gray-900">{profile.pseudo}</h1>
          <p className="text-gray-500 text-sm">{profile.email}</p>
        </div>

        {avatarError && <p className="text-sm text-red-400">{avatarError}</p>}

        {/* Si avatar present, le supp */}
        {avatar && (
          <Button variant='danger' onClick={handleRemoveAvatar}>
            Supprimer la photo
          </Button>
        )}

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
              {STATUS_VALUES.map(value => (
                <option key={value} value={value}>{formatStatus(value)}</option>
              ))}
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

      <Card className='flex flex-col gap-3'>
        <h2 className="text-sm font-medium text-gray-700">Double authentification (2FA)</h2>

        {profile.twoFactorEnabled ? (
          //Etat deja active
          <p className="text-sm text-green-600">La 2FA est activée sur ton compte.</p>
          // TODO : Bouton desactiver a faire dans la route back
        ) : qrCode ? (
          //Etat configuration en cors (QR affiche)
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-500">Scanne ce QR code avec ton application d'authentification, puis entre le code généré.</p>
            <img src={qrCode} alt="QR code 2FA" className="w-40 h-40" />
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code a 6 chiffres"
              className="w-40 text-center"
            />
            {twoFAError && <p className="text-sm text-red-400">{twoFAError}</p>}
            <Button onClick={handleVerify2FA}>Confirmer</Button>
          </div>
        ) : (
          //Etat : Desactiver (bouton pour l'activer)
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">Ajoute une couche de sécurité à ton compte.</p>
            {twoFAError && <p className="text-sm text-red-400">{twoFAError}</p>}
            <Button onClick={handleSetup2FA} className="self-start">Activer la 2FA</Button>
          </div>
        )}
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