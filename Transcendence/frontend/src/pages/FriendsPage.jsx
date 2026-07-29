import { useState } from 'react'
import { IconSearch } from '@tabler/icons-react'
import { mockFriends } from '../data/mockFriends'
import { searchUsers } from '../data/mockUsers2'
import FriendCard from '../components/ui/FriendCard'
import Avatar from '../components/ui/Avatar'

export default function FriendsPage() {
	const [query, setQuery] = useState('')
	const [searchOpen, setSearchOpen] = useState(false)

	const friends = mockFriends // A remplace par l'API
	const results = query.length >= 2 ? searchUsers(query) : []

	// Recup l'Input
	function handleChange(e) {
		const value = e.target.value
		setQuery(value)
		setSearchOpen(value.length >= 2)
	}

	// close le menu deroulant search 
	function closeSearch() {
		setSearchOpen(false)
		setQuery('')
	}

	return (
		<div className="relative h-full">
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
										onClick={() => {}} // A brancher
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
							onClick={() => {}} // A brancher 
						/>
					))}
				</div>
			)}

			{/*Voile gris */}
			{searchOpen && (
				<div onClick={closeSearch} className='absolute -inset-6 bg-black/10 z-40'/>
			)}
		</div>
	)
}