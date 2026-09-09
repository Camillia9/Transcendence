import { useTranslation } from 'react-i18next'
import { getDisplayStatus } from "../../utils/status"
import Avatar from "./Avatar"
export default function FriendCard({ friend, onClick }) {
	const { t } = useTranslation()
	const display = getDisplayStatus(friend, t)
  return (
		<button
			onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-100 transition-colors"
		>
      <div className="relative">
        <Avatar src={friend.avatar} username={friend.pseudo} size="lg" />
        <span
          className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${display.dotClass}`}
        />
      </div>
      <span className="text-sm font-medium text-gray-800">{friend.pseudo}</span>
      <span className="text-xs text-gray-400">{display.label}</span>
		</button>
	)
}