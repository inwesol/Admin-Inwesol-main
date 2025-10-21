// import { redirect } from 'next/navigation'

// export default function HomePage() {
//   redirect('/clients')
// }

'use client'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { isLoaded, user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        // If user is signed in, redirect to clients
        router.push('/clients')
      } else {
        // If user is not signed in, redirect to sign-in
        router.push('/sign-in')
      }
    }
  }, [isLoaded, user, router])

  // Show loading state while redirecting
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='h-32 w-32 animate-spin rounded-full border-b-2 border-[#00B24B]'></div>
    </div>
  )
}
