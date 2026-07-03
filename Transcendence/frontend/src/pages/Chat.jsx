// ═══════════════════════════════════════════════════════════════════════════
//  Chat.jsx — La page de messagerie
// ═══════════════════════════════════════════════════════════════════════════
//
//  Vue d'ensemble : cette page affiche une messagerie à deux colonnes.
//    - À GAUCHE  : la liste de toutes les conversations (Alice, Bob, un groupe…)
//    - À DROITE  : la conversation actuellement ouverte, avec ses messages
//                  et un champ pour en écrire un nouveau.
//
//  Toute la logique repose sur 3 "states" (des données que React surveille :
//  quand elles changent, React redessine l'écran automatiquement).
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react'
// useState = l'outil de React pour créer une "donnée surveillée".
// Chaque fois qu'on la modifie (via sa fonction set...), l'écran se redessine.

import { mockConversations } from '../data/mockConversations'
// Nos fausses conversations de départ (le fichier qu'on a créé à l'étape 1).
// Plus tard, ça viendra du back ; pour l'instant c'est notre point de départ.

import { CURRENT_USER } from '../data/currentUser'
// "Qui suis-je ?" — l'utilisateur connecté simulé. Sert à savoir quels messages
// sont les MIENS (pour les afficher à droite) vs ceux des autres (à gauche).


function Chat() {

  // ─────────────────────────────────────────────────────────────────────────
  //  LES 3 STATES (les 3 données que React surveille)
  // ─────────────────────────────────────────────────────────────────────────

  // STATE 1 — La liste complète des conversations.
  // On la met dans un state (au lieu de lire mockConversations directement)
  // PARCE QU'ON VA LA MODIFIER : à chaque message envoyé, on ajoute une ligne
  // à une conversation. Sans state, l'écran ne se redessinerait pas.
  //   - conversations       = la valeur actuelle (on la LIT)
  //   - setConversations    = la fonction pour la changer (on l'APPELLE)
  //   - useState(mock...)   = la valeur de DÉPART
  const [conversations, setConversations] = useState(mockConversations)

  // STATE 2 — L'id de la conversation actuellement ouverte.
  // ATTENTION au choix : on stocke juste l'IDENTIFIANT (un nombre, ex: 1),
  // PAS la conversation entière. Pourquoi ? Parce que si on stockait la
  // conversation entière, on en aurait DEUX copies (celle-ci + celle dans
  // "conversations"), et il faudrait les garder synchronisées → source de bugs.
  // En ne gardant que l'id, il n'y a qu'une seule vérité : "conversations".
  // On part avec la 1re conversation ouverte (son id).
  const [activeId, setActiveId] = useState(mockConversations[0].id)

  // STATE 3 — Le texte en train d'être tapé dans le champ du bas.
  // "draft" = brouillon. Il se remplit lettre par lettre quand tu tapes,
  // et se vide quand tu envoies.
  const [draft, setDraft] = useState('')


  // ─────────────────────────────────────────────────────────────────────────
  //  DONNÉE DÉRIVÉE (calculée à partir des states, pas stockée séparément)
  // ─────────────────────────────────────────────────────────────────────────

  // On a l'id de la conversation active (STATE 2), mais pour l'AFFICHER il nous
  // faut la conversation COMPLÈTE. On la retrouve dans la liste avec .find() :
  // "parcours les conversations, donne-moi celle dont l'id === activeId".
  // Ceci se recalcule tout seul à chaque redessin — donc si activeId change
  // (clic sur une autre conv) ou si conversations change (nouveau message),
  // activeConversation est toujours à jour automatiquement.
  const activeConversation = conversations.find(c => c.id === activeId)


  // ─────────────────────────────────────────────────────────────────────────
  //  FONCTION 1 — receiveMessage : AJOUTER UN MESSAGE À L'ÉCRAN
  // ─────────────────────────────────────────────────────────────────────────
  //
  //  C'EST LA FONCTION LA PLUS IMPORTANTE POUR DEV 3.
  //
  //  Son rôle : recevoir un message et l'ajouter à la bonne conversation.
  //  Elle prend 2 informations :
  //    - conversationId : DANS QUELLE conversation ranger le message
  //    - message        : le message lui-même (un objet {id, author, text, time})
  //
  //  Pourquoi une fonction séparée, et pas directement dans "envoyer" ?
  //  Parce qu'avec un WebSocket, les messages arrivent de DEUX origines :
  //    1. les messages que J'écris et que le serveur me renvoie
  //    2. les messages que les AUTRES écrivent et que le serveur me pousse
  //  Les deux doivent atterrir au même endroit : ICI. Donc on centralise
  //  "ajouter un message à l'écran" dans une seule fonction réutilisable.
  //
  const receiveMessage = (conversationId, message) => {
    // On reconstruit la liste des conversations :
    //   - la conversation ciblée (id === conversationId) est recopiée
    //     à l'identique { ...c } MAIS avec un message de plus dans ses messages
    //     [...c.messages, message] = "tous les anciens messages, PUIS le nouveau"
    //   - toutes les AUTRES conversations sont laissées telles quelles (: c)
    //
    // Note : on écrit "prev =>" au lieu d'utiliser "conversations" directement.
    // "prev" = la version la plus à jour de la liste au moment du calcul.
    // C'est une sécurité : quand des messages arrivent très vite du réseau
    // (plusieurs en même temps), ça garantit qu'on n'en perd aucun en route.
    setConversations(prev => prev.map(c =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, message] }  // la bonne conv : +1 message
        : c                                             // les autres : inchangées
    ))
  }


  // ─────────────────────────────────────────────────────────────────────────
  //  FONCTION 2 — handleSend : ENVOYER LE MESSAGE QUE JE VIENS DE TAPER
  // ─────────────────────────────────────────────────────────────────────────
  //
  //  Appelée quand je clique "Envoyer" ou que j'appuie sur Entrée.
  //
  const handleSend = () => {

    // Garde-fou : si le brouillon est vide (ou juste des espaces), on ne fait
    // rien. .trim() enlève les espaces autour ; une chaîne vide "" est "fausse"
    // pour le if, donc !draft.trim() = "si le message est vide, on sort".
    if (!draft.trim()) return

    // On fabrique l'objet message à partir de ce que j'ai tapé.
    const newMessage = {
      id: Date.now(),          // un id unique : le nb de millisecondes depuis 1970
                               // (jamais deux fois le même → parfait comme id)
      author: CURRENT_USER,    // l'auteur, c'est MOI (je suis en train d'écrire)
      text: draft.trim(),      // le texte tapé, sans espaces superflus autour
      time: new Date().toLocaleTimeString('fr-FR', {  // l'heure actuelle, ex "14:32"
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  ⚠️  POINT DE BRANCHEMENT POUR DEV 3  ⚠️
    // ═══════════════════════════════════════════════════════════════════════
    //
    //  COMMENT ÇA MARCHE AUJOURD'HUI (sans socket) :
    //  On appelle directement receiveMessage() → le message s'ajoute tout de
    //  suite à l'écran. C'est simple et ça rend le chat testable en local.
    //
    //  CE QUE DEV 3 FERA (avec le socket) :
    //  Il REMPLACERA la ligne receiveMessage(...) ci-dessous par un envoi au
    //  serveur, du genre :
    //        socket.send({ conversationId: activeId, message: newMessage })
    //
    //  Et pourquoi il ne gardera PAS le receiveMessage ici ? Parce qu'avec le
    //  socket, le serveur me RENVERRA mon propre message (il le diffuse à tous
    //  les participants, moi compris). C'est à CE moment-là — à la réception —
    //  que receiveMessage sera appelé (depuis son écouteur de socket).
    //  Si je l'ajoutais aussi ici, je verrais mon message EN DOUBLE.
    //
    //  Donc la règle : un message ne s'affiche QUE lorsqu'il REVIENT du serveur.
    //  En attendant le socket, on triche en appelant receiveMessage direct :
    //
    receiveMessage(activeId, newMessage)
    //
    // ═══════════════════════════════════════════════════════════════════════

    // On vide le champ de saisie pour la prochaine frappe.
    setDraft('')
  }


  // ─────────────────────────────────────────────────────────────────────────
  //  L'AFFICHAGE (le JSX = le "HTML" de React)
  // ─────────────────────────────────────────────────────────────────────────
  return (

    // Conteneur principal : deux colonnes côte à côte (flex), hauteur fixée
    // à "l'écran moins 8rem" pour que ça tienne sans faire déborder la page.
    <div className="flex gap-4 h-[calc(100vh-8rem)]">

      {/* ═══ COLONNE GAUCHE : la liste des conversations ═══ */}
      <div className="w-64 flex flex-col gap-1 border-r border-gray-100 pr-2 overflow-y-auto">

        {/* On parcourt CHAQUE conversation et on dessine une ligne cliquable.
            .map = "pour chaque conv de la liste, produis ce bloc de JSX". */}
        {conversations.map(conv => (

          <div
            key={conv.id}   // React exige un "key" unique par élément d'une liste
                            // (ça l'aide à suivre qui est qui quand ça change)

            // AU CLIC sur une conversation : on change activeId pour son id.
            // → activeConversation se recalcule → la colonne droite change.
            onClick={() => setActiveId(conv.id)}

            // Le style change selon que cette conv est ouverte ou non :
            //   - ouverte (conv.id === activeId) → petit fond bleu clair
            //   - fermée → juste un survol gris
            className={`p-3 rounded-lg cursor-pointer ${
              conv.id === activeId ? 'bg-primary-700/10' : 'hover:bg-gray-50'
            }`}
          >
            {/* Le nom de la conversation (Alice, Bob, Équipe Frontend…) */}
            <p className="text-sm font-medium text-gray-800">{conv.name}</p>

            {/* Un aperçu du DERNIER message, en petit et grisé.
                conv.messages[conv.messages.length - 1] = le dernier du tableau.
                Le "?." évite un plantage si la conv n'a aucun message.
                "truncate" coupe avec "…" si c'est trop long. */}
            <p className="text-xs text-gray-400 truncate">
              {conv.messages[conv.messages.length - 1]?.text}
            </p>
          </div>
        ))}
      </div>

      {/* ═══ COLONNE DROITE : la conversation ouverte ═══ */}
      <div className="flex-1 flex flex-col">

        {/* --- En-tête : le nom de la conversation active --- */}
        <div className="pb-3 border-b border-gray-100">
          <h2 className="text-lg font-medium text-primary-900">
            {activeConversation.name}
          </h2>
        </div>

        {/* --- Le fil de messages --- */}
        {/* flex-1 = "prends toute la place verticale dispo" ; overflow-y-auto =
            "si ça déborde, fais défiler ICI" (pas toute la page). */}
        <div className="flex-1 flex flex-col gap-2 py-4 overflow-y-auto">

          {/* Pour chaque message de la conversation active, une bulle. */}
          {activeConversation.messages.map(msg => (
            <div
              key={msg.id}

              // LE point clé de l'affichage : mes messages à droite, les
              // autres à gauche. On compare l'auteur du message à MOI :
              //   - msg.author === CURRENT_USER (c'est moi) → bulle bleue,
              //     collée à DROITE (self-end)
              //   - sinon (quelqu'un d'autre) → bulle grise, à GAUCHE (self-start)
              className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                msg.author === CURRENT_USER
                  ? 'bg-primary-700 text-white self-end'
                  : 'bg-gray-100 text-gray-800 self-start'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* --- Le champ d'envoi (en bas) --- */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">

          <input
            type="text"
            value={draft}   // le champ AFFICHE toujours le contenu de "draft"

            // À CHAQUE frappe : on met à jour "draft" avec le nouveau contenu.
            // e.target.value = le texte actuellement dans le champ.
            onChange={(e) => setDraft(e.target.value)}

            // Si on appuie sur Entrée → on envoie (comme le bouton).
            // "e.key === 'Enter' && handleSend()" = "si touche = Entrée,
            // alors exécute handleSend".
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}

            placeholder="Écris un message..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />

          {/* Le bouton envoyer appelle la même fonction que la touche Entrée. */}
          <button
            onClick={handleSend}
            className="bg-primary-700 text-white rounded-lg px-4 text-sm"
          >
            Envoyer
          </button>
        </div>

      </div>
    </div>
  )
}

export default Chat