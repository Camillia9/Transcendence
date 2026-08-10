import { useNavigate } from 'react-router-dom'
import Card from './Card'
import Button from './Button'
import Logo from './Logo'
import {IconBrandGoogle, IconBrandGithub} from '@tabler/icons-react'

function AuthCard({ title, subtitle, swapText, swapTo, children }) {
	const navigate = useNavigate()

	const handleGoogle = () => {
		window.location.href = 'https://localhost/api/auth/google'
	}

	const handleGithub = () => {
		window.location.href = 'https://localhost/api/auth/github'
	}

	return (
		<Card className='w-96 flex flex-col items-center gap-6 p-10'>
			{/*Logo partout */}
			<Logo />

			{/*Titres + sous-titres*/}
			<div className='text-center'>
				<h2 className='text-2xl font-medium text-primary-900'>{title}</h2>
				<p className='text-sm text-primary-700 mt-1'>{subtitle}</p>
			</div>

			{/*Boutons OAuth partout */}
			<div className='flex flex-col gap-3 w-full'>
				{/*GOOGLE */}
				<Button variant='ghost' onClick={handleGoogle}>
					<span className='flex items-center justify-center gap-2'>
						<IconBrandGoogle size={18} />
						Continuer avec Google
					</span>
				</Button>

				{/*GITHUB */}
				<Button variant='ghost' onClick={handleGithub}>
					<span className='flex items-center justify-center gap-2'>
						<IconBrandGithub size={18} />
						Continuer avec GitHub
					</span>
				</Button>
			</div>

			{/*Ligne separatrice*/}
			<div className='flex items-center gap-3 w-full'>
				<div className='flex-1 h-px bg-gray-200' />
				<span className='text-xs text-primary-700'>ou</span>
				<div className='flex-1 h-px bg-gray-200' />
			</div>

			{/*Formulaire de chaque page */}
			{children}

			{/*Lien de bascule */}
			<p
				onClick={() => navigate(swapTo)}
				className='text-sm text-primary-700 cursor-pointer hover:text-primary-900 transition-colors'
			>
				{swapText}
			</p>

			{/*Bouton Retour partout */}
			<p
				onClick={() => navigate('/')}
				className='text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors'
			>
				← Retour
			</p>
		</Card>
	)
}

export default AuthCard