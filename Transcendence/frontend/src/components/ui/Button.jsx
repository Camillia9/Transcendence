function Button({ children, onClick, variant = 'primary', loading = false, disabled = false }) {

  const styles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    danger:  'bg-red-500 text-white hover:bg-red-600',
    ghost:   'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-100',
    outline: 'bg-white text-primary-700 border border-gray-200 hover:bg-gray-50',
  }

  const isDisabled = loading || disabled

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`px-8 py-3 rounded-lg font-semibold transition-opacity ${styles[variant]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Chargement...' : children}
    </button>
  )
}
export default Button

// Children = le mots que je mets entre <Buttons> et </Button>, Ici : "Commencer"
// onClick = la fonction quand on clique
// variant = le style du bouton

// loading = false : le bouton est par defaut. Ex: Login
// disabled{login} : si le bouton est en loading, on le désactive
// Lorsque loading = true : le bouton est desactive, en attente, plus possible de cliquer dessus pour eviter plusieurs requetes en meme temps
// {loading ? 'Chargement...' : children} : Change le texte (EX: Login devient attente)