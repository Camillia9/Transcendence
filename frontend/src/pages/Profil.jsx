import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

import { changePassword, deleteAccount, getProfile, updateProfile } from '../api/users'
import { useNavigate } from 'react-router-dom'
import { setup2FA, verify2FA, disable2FA } from '../api/auth'
import { BASE_URL } from '../api/client'

function Profil() {
  const { t } = useTranslation()
  const { user, login, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [pseudo, setPseudo] = useState('')
  const [language, setLanguage] = useState('')
  const [avatar, setAvatar] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [avatarError, setErrorAvatar] = useState('')

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [qrCode, setQrCode] = useState(null)
  const [code, setCode] = useState('')
  const [twoFAError, setTwoFAError] = useState('')
  const [showDisable2FA, setShowDisable2FA] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')

  async function handleSave () {
    try {
      setError('')
      setSuccess('')
      const data = await updateProfile({pseudo, langue: language, avatar})
      login(data)
      setProfile(data)
      setSuccess(t('profile.saved'))
      setTimeout(() => setSuccess(''), 3000) // msg success disparait apres 3s
    } catch (err) {
      setError(err.message)
    }
  }

  async function loadProfile() {
    try {
      const data = await getProfile()
      setProfile(data)
    } catch (error) {
      console.error('Impossible de charger le profile', error)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])


  useEffect(() => {
   if (profile) {
    setPseudo(profile.pseudo)
    setLanguage(profile.langue)
    setAvatar(profile.avatar ?? '')
   }
  }, [profile])

    async function handleChangePassword () {
    setPasswordError('')

    if (newPassword.length < 6) {
      setPasswordError(t('signup.errors.passwordTooShort'))
      return
    }
    if (newPassword.length > 30) {
      setPasswordError(t('signup.errors.passwordTooLong'))
      return
    }

    try {
      await changePassword(oldPassword, newPassword)
      setOldPassword('')
      setNewPassword('')
      setPasswordSuccess(t('profile.passwordChanged'))
    } catch (err) {
      setPasswordError(err.message)
    }
  }

  async function handleDeleteAccount() {
    try {
      setDeleteError('')
      await deleteAccount(deletePassword)
      logout()
      navigate('/')
    } catch (error) {
      setDeleteError(error.message)
    }
  }

  const handleExportData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/profile/export`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'taskboard-mes-donnees.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }

  function cancelDelete() {
    setConfirmDelete(false)
    setDeletePassword('')
    setDeleteError('')
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setErrorAvatar('')

    if (!file.type.startsWith('image/')) {
      setErrorAvatar(t('profile.errors.avatarNotImage'))
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const maxSize = 200
        let { width, height } = img
        if (width > height) {
          if (width > maxSize) { height = height * (maxSize / width); width = maxSize }
        } else {
          if (height > maxSize) { width = width * (maxSize / height); height = maxSize }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)

        setAvatar(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveAvatar() {
    setAvatar('')
  }

  async function handleSetup2FA() {
    setTwoFAError('')
    try {
      const data = await setup2FA()
      setQrCode(data.qrCode)
    } catch (error) {
      setTwoFAError(t('profile.twoFactor.errors.setupFailed'))
    }
  }

  async function handleVerify2FA() {
    setTwoFAError('')
    try {
      await verify2FA(code)
      setQrCode(null)
      setCode('')
      await loadProfile()
    } catch (error) {
      setTwoFAError(t('profile.twoFactor.errors.invalidCode'))
    }
  }

  async function handleDisable2FA() {
    setTwoFAError('')
    try {
      await disable2FA(disablePassword)
      setShowDisable2FA(false)
      setDisablePassword('')
      await loadProfile()
    } catch (error) {
      setTwoFAError(error.message)
    }
  }
  

  if (!profile) return <p>{t('common.loading')}</p>

  const isOAuth = profile && profile.hasPassword === false
  
  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6 py-10">

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
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className='text-white text-xs'>{t('profile.editPhoto')}</span>
          </div>
        </div>

          <label htmlFor="profile-avatar" className="sr-only">{t('profile.editPhoto')}</label>
        <input
          id="profile-avatar"
          name="avatar"
          type='file'
          accept='image/*'
          onChange={handleAvatarChange}
          ref={fileInputRef}
          className='hidden'
        />

        <div>
          <h1 className="text-xl font-bold text-gray-900">{profile.pseudo}</h1>
          <p className="text-gray-500 text-sm">{profile.email}</p>
        </div>

        {avatarError && <p className="text-sm text-red-400">{avatarError}</p>}

        {avatar && (
          <Button variant='danger' onClick={handleRemoveAvatar}>
            {t('profile.removePhoto')}
          </Button>
        )}

        <div className='flex items-center justify-between'>
          <label htmlFor="profile-pseudo" className='text-sm text-gray-500'>{t('profile.pseudoLabel')}</label>
            <Input
              id="profile-pseudo"
              name="pseudo"
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder={t('profile.newPseudoPlaceholder')}
              className="w-48"
          />
        </div>

        <div className='flex items-center justify-between'>
          <label htmlFor="profile-language" className='text-sm text-gray-500'>{t('profile.languageLabel')}</label>
            <select
              id="profile-language"
              name="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className='text-sm text-gray-700 border border-gray-200 rounded-lg px-2 py-1'
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="cn">中文</option>

            </select>
        </div>

        {error && <p className='text-sm text-red-400'>{error}</p>}
        {success && <p className='text-sm text-green-400'>{success}</p>}
        
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleSave}>{t('common.save')}</Button>
        </div>
      </Card>

      <Card className='flex flex-col gap-4'>
        <h2 className='text-sm font-medium text-gray-700'>{t('profile.changePasswordTitle')}</h2>
        <div className='flex items-center justify-between'>
          <label htmlFor="profile-current-password" className='text-sm text-gray-500'>{t('profile.currentPasswordLabel')}</label>
            <Input
              id="profile-current-password"
              name="currentPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder={t('profile.currentPasswordLabel')}
              className="w-48"
          />
        </div>
        <div className='flex items-center justify-between'>
          <label htmlFor="profile-new-password" className='text-sm text-gray-500'>{t('profile.newPasswordLabel')}</label>
          <Input
            id="profile-new-password"
            name="newPassword"
            type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('profile.newPasswordLabel')}
              className="w-48"
          />
        </div>
          {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
          <div className='flex justify-end mt-2'>
            <Button onClick={handleChangePassword}>{t('profile.changePasswordSubmit')}</Button>
          </div>

          {passwordSuccess && <p className="text-sm text-green-500">{passwordSuccess}</p>}
      </Card>

      {!isOAuth && (
        <Card className='flex flex-col gap-3'>
          <h2 className="text-sm font-medium text-gray-700">{t('profile.twoFactor.title')}</h2>

          {profile.twoFactorEnabled ? (
            <div className='flex flex-col gap-2'>
              <p className="text-sm text-green-600">{t('profile.twoFactor.enabled')}</p>
              {!showDisable2FA ? (
                <Button variant='outline' onClick={() => setShowDisable2FA(true)} className='self-start'>
                  {t('profile.twoFactor.disable')}
                </Button>
              ) : (
                <div className='flex flex-col gap-2'>
                  <p className='text-sm text-gray-500'>{t('profile.twoFactor.enterPasswordToDisable')}</p>
                  <Input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder={t('profile.passwordPlaceholder')}
                    className="w-48"
                  />
                  {twoFAError && <p className='text-sm text-red-400'>{twoFAError}</p>}
                  <div className='flex gap-2'>
                    <Button onClick={() => { setShowDisable2FA(false); setDisablePassword(''); setTwoFAError('')}}>
                      {t('common.cancel')}
                    </Button>
                    <Button variant="danger" onClick={handleDisable2FA}>{t('common.confirm')}</Button>
                  </div>
                </div>
              )}

            </div>
          ) : qrCode ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-gray-500">{t('profile.twoFactor.scanQrCode')}</p>
              <img src={qrCode} alt={t('profile.twoFactor.qrCodeAlt')} className="w-40 h-40" />
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t('profile.twoFactor.codePlaceholder')}
                className="w-40 text-center"
              />
              {twoFAError && <p className="text-sm text-red-400">{twoFAError}</p>}
              <Button onClick={handleVerify2FA}>{t('common.confirm')}</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-500">{t('profile.twoFactor.addSecurityLayer')}</p>
              {twoFAError && <p className="text-sm text-red-400">{twoFAError}</p>}
              <Button onClick={handleSetup2FA} className="self-start">{t('profile.twoFactor.enable')}</Button>
            </div>
          )}
        </Card>
      )}

      <Card className='flex flex-col gap-4'>
        <h2 className='text-sm font-medium text-gray-800'>{t('profile.myData.title')}</h2>
        <p className='text-sm text-gray-500'>
          {t('profile.myData.description')}
        </p>
        <Button onClick={handleExportData}>
          {t('profile.myData.download')}
        </Button>
      </Card>

      <Card className='flex flex-col gap-4'>
        <h2 className='text-sm font-medium text-red-800'>{t('profile.deleteAccount.title')}</h2>
        {!confirmDelete ? (
          <Button variant='danger' onClick={() => setConfirmDelete(true)}>
            {t('profile.deleteAccount.button')}
          </Button>
        ) : (
          <div className='flex flex-col gap-3'>
            <p className='text-sm text-gray-500'>
              {t('profile.deleteAccount.irreversible')}
            </p>

            {isOAuth ? (
              <p className='text-sm text-gray-500'>
                {t('profile.deleteAccount.confirmOAuth')}
              </p>
            ) : (
              <>
                <p className='text-sm text-gray-500'>
                  {t('profile.deleteAccount.enterPassword')}
                </p>
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder={t('profile.passwordPlaceholder')}
                />
                {deletePassword && <p className='text-sm text-red-400'>{deleteError}</p>}
              </>
            )}
            <div className='flex justify-end gap-2'>
              <Button onClick={cancelDelete}>{t('common.cancel')}</Button>
              <Button variant='danger' onClick={handleDeleteAccount}>
                {t('profile.deleteAccount.confirmButton')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Profil