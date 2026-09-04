import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { IconSearch } from '@tabler/icons-react'
import { getFriends, searchUsers, addFriend, removeFriend } from '../api/friends'
import { useSocket } from '../context/SocketContext'
import FriendCard from '../components/ui/FriendCard'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { formatStatus } from '../utils/status'

export default function FriendsPage() {
	const { t } = useTranslation()
	const [query, setQuery] = useState('')
	const [searchOpen, setSearchOpen] = useState(false)
	const [friends, setFriends] = useState([])
	const [results, setResults] = useState([])
	const [selectedUser, setSelectedUser] = useState(null)
	const socket = useSocket()

	useEffect(() => {
		loadFriends()
	}, [])

	useEffect(() => {
		if (!socket) return
		const handleStatus = ({ userId, statut, isOnline }) => {
			setFriends(prev => prev.map(item =>
				item.friend.id === userId ? { ...item, friend: { ...item.friend, statut, isOnline } } : item
			))
		}
		socket.on('user:status', handleStatus)
		return () => socket.off('user:status', handleStatus)
	}, [socket])

	async function loadFriends() {
		try {
			const data = await getFriends()
			setFriends(data)
		} catch (error) {
			console.error('Impossible de charger les amis', error)
		}
	}

	useEffect(() => {
		if (query.length < 2) {
			setResults([])
			return
		}
		let annule = false
		async function run() {
			try {
				const data = await searchUsers(query)
				if (!annule) setResults(data)
			} catch (error) {
				console.error('Recherche echouee', error)
			}
		}
		run()
		return () => { annule = true }
	}, [query])

	function closeSearch() {
		setSearchOpen(false)
		setQuery('')
	}

	function openUser(user) {
		setSelectedUser(user)
		closeSearch()
	}

	async function handleAdd(user) {
		try {
			await addFriend(user.id)
			await loadFriends()
		} catch (error) {
			console.error('Ajout echoue', error)
		}
		setSelectedUser(null)
	}

	async function handleRemove(user) {
		try {
			await removeFriend(user.id)
			await loadFriends()
		} catch (error) {
			console.error('Suppression echouee', error)
		}
		setSelectedUser(null)
	}

	return (
		<div className="relative h-full isolate">
			<div className="flex items-center justify-between mb-6 relative z-50">
				<h1 className="text-2xl font-semibold text-gray-800">{t('friends.title')}</h1>
				
				<div className="relative w-72">
					<IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						type='text'
						value={query}
						onFocus={() => setSearchOpen(true)}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={t('friends.searchPlaceholder')}
						className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
					/>

					{searchOpen && (
						<div className="absolute right-0 top-full mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-md max-h-96 overflow-y-auto z-50">
							{query.length < 2 ? (
								<p className="px-4 py-3 text-sm text-gray-400 text-center">{t('friends.searchMinChars')}</p>
							) : results.length === 0 ? (
								<p className="px-4 py-3 text-sm text-gray-400 text-center">{t('friends.noResults')}</p>
							) : (
								results.map((u) => (
									<button
										key={u.id}
										onClick={() => openUser(u)}
										className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
									>
										<Avatar src={u.avatar} username={u.pseudo} size='sm'/>
										<span className='text-sm text-gray-800'>{u.pseudo}</span>
									</button>
								))
							)}
						</div>
					)}
				</div>
			</div>
				
			{friends.length === 0 ? (
				<p className="text-sm text-gray-400">{t('friends.emptyState')}</p>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
					{friends.map((item) => (
						<FriendCard
							key={item.id}
							friend={item.friend}
							onClick={() => openUser(item.friend)}
						/>
					))}
				</div>
			)}

			{searchOpen && (
				<div onClick={closeSearch} className='absolute -inset-6 bg-black/10 z-40'/>
			)}

			<FriendModal
				user={selectedUser}
				friends={friends}
				onClose={() => setSelectedUser(null)}
				onAdd={handleAdd}
				onRemove={handleRemove}
			/>
		</div>
	)
}

function FriendModal({ user, friends, onClose, onAdd, onRemove }) {
  const { t } = useTranslation()
  const isFriend = user
    ? friends.some(item => item.friend.id === user.id)
    : false

  return (
    <Modal isOpen={!!user} onClose={onClose} title={t('friends.contactModal.title')}>
      {user && (
        <div className="flex flex-col items-center gap-4">
          <Avatar src={user.avatar} username={user.pseudo} size="lg" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-800">{user.pseudo}</p>
            <p className="text-sm text-gray-400">{formatStatus(user.statut, t)}</p>
          </div>

          {isFriend ? (
            <Button variant="danger" onClick={() => onRemove(user)}>
              {t('friends.removeContact')}
            </Button>
          ) : (
            <Button onClick={() => onAdd(user)}>
              {t('friends.addContact')}
            </Button>
          )}
        </div>
      )}
    </Modal>
  )
}