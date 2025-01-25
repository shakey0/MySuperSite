function BackArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path 
        d="M19 12a1 1 0 0 1-1 1H8.414l1.293 1.293a1 1 0 0 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414l3-3a1 1 0 0 1 1.414 1.414L8.414 11H18a1 1 0 0 1 1 1z" 
        style={{ fill: '#ff8833' }} 
        data-name="Left" 
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="66px" height="66px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 18L20 18" stroke="#ff8833" strokeWidth="2" strokeLinecap="round"/>
      <path d="M4 12L20 12" stroke="#ff8833" strokeWidth="2" strokeLinecap="round"/>
      <path d="M4 6L20 6" stroke="#ff8833" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export { BackArrow, MenuIcon };
