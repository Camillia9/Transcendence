{/* --- En-tête de la conversation active --- */}
<div className="flex items-center gap-3 pb-3 border-b border-gray-100">
  {/* Avatar, même style que dans la liste */}
  <div className="w-10 h-10 rounded-full bg-primary-900/15 flex items-center justify-center text-sm font-medium text-primary-900 shrink-0">
    {activeConversation.name[0]}
  </div>
  <div>
    <h2 className="text-lg font-medium text-primary-900 leading-tight">
      {activeConversation.name}
    </h2>
    {/* Sous-titre contextuel : privé → une mention ; groupe → le nb de participants.
        On déduit "group" du type. Pour le nb de membres, on affiche une valeur
        seulement si elle existe (les groupes n'ont pas encore de champ members,
        donc pour l'instant on reste sur un libellé simple). */}
    <p className="text-xs text-gray-400">
      {activeConversation.type === 'group' ? 'Conversation de groupe' : 'Conversation privée'}
    </p>
  </div>
</div>


{/* --- Le fil de messages --- */}
<div className="flex-1 flex flex-col gap-3 py-4 overflow-y-auto">

  {/* CAS 1 : la conversation n'a aucun message → on affiche un état vide.
      C'est le "empty state" : plutôt qu'un grand vide, un message d'accueil. */}
  {activeConversation.messages.length === 0 ? (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
      <IconMessage2 size={40} className="text-gray-200" />
      <p className="text-sm text-gray-400">Aucun message pour l'instant</p>
      <p className="text-xs text-gray-300">Envoie le premier message !</p>
    </div>
  ) : (
    // CAS 2 : il y a des messages → on les affiche.
    activeConversation.messages.map(msg => {
      // Est-ce MON message ? (pour l'aligner à droite et le colorer)
      const isMine = msg.author === CURRENT_USER

      return (
        // Ce conteneur gère l'alignement gauche/droite de TOUT le bloc
        // (nom + bulle + heure), pas seulement la bulle.
        <div
          key={msg.id}
          className={`flex flex-col max-w-xs ${isMine ? 'self-end items-end' : 'self-start items-start'}`}
        >
          {/* Le nom de l'auteur : affiché SEULEMENT pour les autres, et
              SEULEMENT dans un groupe (dans un privé, c'est inutile, on sait
              qui parle). En condition : pas moi ET type groupe. */}
          {!isMine && activeConversation.type === 'group' && (
            <span className="text-xs text-gray-400 mb-0.5 px-1">{msg.author}</span>
          )}

          {/* La bulle elle-même */}
          <div
            className={`rounded-2xl px-3 py-2 text-sm ${
              isMine
                ? 'bg-primary-600 text-white'      // mes messages : navy plein
                : 'bg-gray-100 text-gray-800'      // les autres : gris clair
            }`}
          >
            {msg.text}
          </div>

          {/* L'heure, en tout petit sous la bulle */}
          <span className="text-[10px] text-gray-300 mt-0.5 px-1">{msg.time}</span>
        </div>
      )
    })
  )}
</div>


{/* --- Le champ d'envoi --- */}
<div className="flex gap-2 pt-3 border-t border-gray-100">
  <input
    type="text"
    value={draft}
    onChange={(e) => setDraft(e.target.value)} // À CHAQUE frappe : on met à jour "draft" avec le nouveau contenu. e.target.value = le texte actuellement dans le champ.
    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
    placeholder="Écris un message..."
    // focus:outline-none enlève le contour bleu par défaut du navigateur,
    // focus:border-primary-600 met TON accent quand le champ est actif.
    className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-600 transition-colors"
  />
  <button
    onClick={handleSend}
    // flex + items-center + gap = icône et texte alignés proprement.
    // disabled quand le champ est vide → le bouton se grise (voir plus bas).
    disabled={!draft.trim()}
    className="flex items-center gap-1.5 bg-primary-600 text-white rounded-xl px-4 text-sm font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
  >
    <IconSend size={16} />
    Envoyer
  </button>
</div>