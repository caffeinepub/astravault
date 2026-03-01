export default function DashboardFooter() {
  return (
    <footer
      className="py-3 px-6 text-center"
      style={{
        backgroundColor: 'var(--color-surface-dark)',
        borderTop: '1px solid var(--color-military-green-muted)',
      }}
    >
      <p
        className="font-inter text-xs"
        style={{ color: 'var(--color-gold-accent)' }}
      >
        Developed by Shubham Rathore
      </p>
      <p
        className="font-rajdhani text-xs tracking-widest uppercase mt-0.5"
        style={{ color: 'var(--color-gold-muted)' }}
      >
        Rajput – Creating History
      </p>
    </footer>
  );
}
