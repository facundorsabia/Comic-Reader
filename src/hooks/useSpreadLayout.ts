import { useEffect, useState } from 'react';
// Two readable 360px leaves plus the 360px terminal and breathing room.
export function useSpreadLayout() {
 const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1200px)').matches);
 useEffect(() => {
  const query = window.matchMedia('(min-width: 1200px)');
  const update = () => setWide(query.matches);
  query.addEventListener('change', update);
  return () => query.removeEventListener('change', update);
 }, []);
 return wide;
}
