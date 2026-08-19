import { useState, useEffect } from 'react'
import { IconSearch } from '@tabler/icons-react'
import { mockFriends } from '../data/mockFriends'
import { getFriends, searchUsers, addFriend, removeFriend } from '../api/friends'
import { useSocket } from '../context/SocketContext'
import FriendCard from '../components/ui/FriendCard'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

export default function FriendsPage() {
	const [query, setQuery] = useState('')
	const [searchOpen, setSearchOpen] = useState(false)
	const [friends, setFriends] = useState([]) // demarre vide
	const [results, setResults] = useState([]) // resultats stockes
	const [selectedUser, setSelectedUser] = useState(null) // Un pour savoir si modal ouverte, un pour retenir quel utilisateur on a cliqué
	const socket = useSocket()

	// charge mes amis au montage
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

	// Lance la recherche quand query change (des 2 caracteres)
	useEffect(() => {
		if (query.length < 2) {
			setResults([])
			return
		}
		let annule = false
		async function run() {
			try {
				const data = await searchUsers(query)
				if (!annule) setResults(data) // ignore reponse tardive si query a deja change
			} catch (error) {
				console.error('Recherche echouee', error)
			}
		}
		run()
		return () => { annule = true }
	}, [query])

	// close le menu deroulant search 
	function closeSearch() {
		setSearchOpen(false)
		setQuery('')
	}

	// Ouvre la modal depuis nimporte quelle entree
	function openUser(user) {
		setSelectedUser(user)
		closeSearch() // si on venait de la barre de recherche on la ferme
	}

	// Add un user. refresh direct apres
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
			{/*En-tete : titre + recherche */}
			<div className="flex items-center justify-between mb-6 relative z-50">
				<h1 className="text-2xl font-semibold text-gray-800">Amis</h1>
				
				<div className="relative w-72">
					<IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						type='text'
						value={query}
						onFocus={() => setSearchOpen(true)}
						onChange={(e) => setQuery(e.target.value)}
						placeholder='Rechercher un pseudo...'
						className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
					/>

					{/*Menu deroulant*/}
					{searchOpen && (
						<div className="absolute right-0 top-full mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-md max-h-96 overflow-y-auto z-50">
							{query.length < 2 ? (
								<p className="px-4 py-3 text-sm text-gray-400 text-center">Tape au moins 2 caractères</p>
							) : results.length === 0 ? (
								<p className="px-4 py-3 text-sm text-gray-400 text-center">Aucun résultat</p>
							) : (
								results.map((u) => (
									<button
										key={u.id}
										onClick={() => openUser(u)} // Ouvre la modal. A brancher. 
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
				
			{/*Grille d'amis */}
			{friends.length === 0 ? (
				<p className="text-sm text-gray-400">Tu n'as pas encore d'amis.</p>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
					{friends.map((item) => (
						<FriendCard
							key={item.id}
							friend={item.friend}
							onClick={() => openUser(item.friend)} //Ouvre la modal.  A brancher 
						/>
					))}
				</div>
			)}

			{/*Voile gris */}
			{searchOpen && (
				<div onClick={closeSearch} className='absolute -inset-6 bg-black/10 z-40'/>
			)}

			{/*Modal (ouverte si selectedUser !== null)*/}
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

// La modale, dans le même fichier pour l'instant 
function FriendModal({ user, friends, onClose, onAdd, onRemove }) {
  const isFriend = user
    ? friends.some(item => item.friend.id === user.id)
    : false

  return (
    <Modal isOpen={!!user} onClose={onClose} title="Contact">
      {user && (
        <div className="flex flex-col items-center gap-4">
          <Avatar src={user.avatar} username={user.pseudo} size="lg" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-800">{user.pseudo}</p>
            <p className="text-sm text-gray-400">{user.statut}</p>
          </div>

          {isFriend ? (
            <Button variant="danger" onClick={() => onRemove(user)}>
              Supprimer des contacts
            </Button>
          ) : (
            <Button onClick={() => onAdd(user)}>
              Ajouter aux contacts
            </Button>
          )}
        </div>
      )}
    </Modal>
  )
}