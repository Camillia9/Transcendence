import { mockFriends } from "../data/mockFriends"
import FriendCard from "../components/ui/FriendCard"

export default function FriendsPage() {
	const friends = mockFriends // A remplace par l'API

	return (
		<div>
			<h1 className="text-2xl font-semibold text-gray-800 mb-6">Amis</h1>

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
		</div>
	)
}