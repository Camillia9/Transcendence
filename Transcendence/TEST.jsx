useEffect(() => {
  const handleClickOutside = () => setProfileMenuOpen(false)
  if (profileMenuOpen)
    document.addEventListener('click', handleClickOutside)
  return () => document.removeEventListener('click', handleClickOutside)
}, [profileMenuOpen])