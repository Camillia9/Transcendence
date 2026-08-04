import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { changePassword, getProfile, updateProfile } from '../api/users'

function Profil() {
  const { user, login } = useAuth()
  const [profile, setProfile] = useState(null) // Cree un profile vide. null au cas ou le profil n'a pas fini de charger(voir plus bas)
  
  // Les etats des champs du profil
  const [pseudo, setPseudo] = useState('')
  const [statut, setStatut] = useState('')
  const [language, setLanguage] = useState('')
  //const [avatar, setAvatar] = useState(null)
  // Save les erreurs des champs du profile
  const [error, setError] = useState('')

  // Les etats pour changer le MDP
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  async function handleSave () {
    try {
      setError('') // vide le precendent message d'erreur
      const data = await updateProfile({pseudo, statut, langue: language})
      login(data)
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

  // Tant que le GET n'a pas repondu on attend. Ensuite profile devient l'objet et le vrai ccontenu s'affcihe
  if (!profile) return <p>Chargement...</p>

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6 py-10">

      {/*Choix de style : */}
      {/*<Card className="flex flex-col items-center gap-3 text-center">*/}
      <Card className="flex items-center justify-center gap-4">
        <Avatar username={profile.pseudo} size="lg" />
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

    </div>
  )
}

export default Profil