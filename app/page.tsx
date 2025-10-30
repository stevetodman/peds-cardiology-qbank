import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to sign-in page - middleware will handle auth from there
  redirect('/auth/signin')
}
