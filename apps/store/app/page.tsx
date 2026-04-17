import { redirect } from 'next/navigation';

// Raiz da store: middleware já redireciona, mas este é o fallback
export default function StorePage() {
  redirect('/login');
}
