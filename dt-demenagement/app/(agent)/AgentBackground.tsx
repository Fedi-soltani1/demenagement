// Fond animé 3D de l'espace agent (perspective CSS — pas de Three.js, donc sûr
// sur mobile). Couche fixe, derrière tout le contenu, dans la colonne centrée.
export function AgentBackground() {
  return (
    <div className="dt-bg" aria-hidden="true">
      <div className="dt-bg-col">
        <span className="dt-bg-orb dt-bg-orb1" />
        <span className="dt-bg-orb dt-bg-orb2" />
        <div className="dt-bg-floor">
          <div className="dt-bg-floor-grid" />
        </div>
      </div>
    </div>
  )
}
