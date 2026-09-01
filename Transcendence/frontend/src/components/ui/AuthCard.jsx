import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Card from './Card'
import Button from './Button'
import Logo from './Logo'
import { IconBrandGoogle, IconBrandGithub } from '@tabler/icons-react'

function AuthCard({ title, subtitle, swapText, swapTo, children }) {
	const navigate = useNavigate()
	const { t } = useTranslation()

	const handleGoogle = () => {
		window.location.href = 'https://localhost:8443/api/auth/google'
	}

	const handleGithub = () => {
		window.location.href = 'https://localhost:8443/api/auth/github'
	}

	return (
		<Card className='w-96 flex flex-col items-center gap-6 p-10'>
			{/* Logo partout */}
			<Logo />

			{/* Titres + sous-titres */}
			<div className='text-center'>
				<h2 className='text-2xl font-medium text-primary-900'>
					{title}
				</h2>
				<p className='text-sm text-primary-700 mt-1'>
					{subtitle}
				</p>
			</div>

			{/* Boutons OAuth partout */}
			<div className='flex flex-col gap-3 w-full'>
				{/* GOOGLE */}
				<Button variant='ghost' onClick={handleGoogle}>
					<span className='flex items-center justify-center gap-2'>
						<IconBrandGoogle size={18} />
						{t('common.continueWithGoogle')}
					</span>
				</Button>

				{/* GITHUB */}
				<Button variant='ghost' onClick={handleGithub}>
					<span className='flex items-center justify-center gap-2'>
						<IconBrandGithub size={18} />
						{t('common.continueWithGithub')}
					</span>
				</Button>
			</div>

			{/* Ligne séparatrice */}
			<div className='flex items-center gap-3 w-full'>
				<div className='flex-1 h-px bg-gray-200' />
				<span className='text-xs text-primary-700'>
					{t('common.or')}
				</span>
				<div className='flex-1 h-px bg-gray-200' />
			</div>

			{/* Formulaire de chaque page */}
			{children}

			{/* Lien de bascule */}
			<p
				onClick={() => navigate(swapTo)}
				className='text-sm text-primary-700 cursor-pointer hover:text-primary-900 transition-colors'
			>
				{swapText}
			</p>

			{/* Bouton Retour partout */}
			<p
				onClick={() => navigate('/')}
				className='text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors'
			>
				← {t('common.back')}
			</p>
		</Card>
	)
}

export default AuthCard