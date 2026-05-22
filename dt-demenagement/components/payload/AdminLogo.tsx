export default function AdminLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '2px 0' }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '9px',
        background: 'linear-gradient(145deg, #cc2a33 0%, #8a1820 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(181,32,39,0.35)',
      }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: '13px', letterSpacing: '-0.5px' }}>DT</span>
      </div>
      <div style={{ lineHeight: 1.3 }}>
        <div style={{ color: 'var(--dt-text)', fontWeight: 700, fontSize: '13px' }}>DT Déménagement</div>
        <div style={{ color: 'var(--dt-red)', fontSize: '9.5px', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase' as const }}>Tunisie · Admin</div>
      </div>
    </div>
  )
}
