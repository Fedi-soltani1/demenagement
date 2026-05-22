export default function AdminLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px',
        background: 'linear-gradient(135deg, #b52027 0%, #8a1820 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: '14px', letterSpacing: '-0.5px' }}>DT</span>
      </div>
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: '13px' }}>DT Déménagement</div>
        <div style={{ color: '#b52027', fontSize: '10px', letterSpacing: '0.05em', fontWeight: 600 }}>TUNISIE · ADMIN</div>
      </div>
    </div>
  )
}
