import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function OAuthSuccess() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { login } = useAuth()

    // const { user, login } = useAuth()
    // console.log('USER DANS OAUTH SUCCESS:', user)

    useEffect(() => {
        const token = searchParams.get('token')
        const userParam = searchParams.get('user')

        //DEbug
        //console.log('TOKEN OAUTH:', token)
        //console.log('USER PARAM:', userParam)

        if (!token || !userParam) {
            navigate('/login', { replace: true })
            return
        }

        try {
            const user = JSON.parse(userParam)

            //Debug 
            //console.log('USER DANS OAUTH SUCCESS:', user)

            // Sauvegarde du JWT
            localStorage.setItem('token', token)

            // Informe ton AuthContext que l'utilisateur est connecté
            login(user)

            // debug
            //console.log('Connexion OAuth réussie')

            // Va vers ton application
            navigate('/home', { replace: true })
        } catch (error) {
            console.error('Erreur OAuth:', error)
            navigate('/login', { replace: true })
        }
    }, [])

    // On attend que AuthContext soit réellement mis à jour
    // useEffect(() => {
    //     if (user) {
    //         navigate('/home', { replace: true })
    //     }
    // }, [user, navigate])

    return <p>Connexion en cours...</p>
}

export default OAuthSuccess
