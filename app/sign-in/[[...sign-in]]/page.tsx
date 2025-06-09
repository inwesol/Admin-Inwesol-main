"use client"
import { SignIn } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const { isLoaded } = useUser()
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  
  useEffect(() => {
    if (isLoaded) {
      setShowPlaceholder(false)
    }
  }, [isLoaded])
  
  return (
    <div className="min-h-screen flex">
      {/* Left side - Illustration */}
      <div className="w-1/2 bg-white relative overflow-hidden flex flex-col justify-center items-center p-12">
        <div className="absolute inset-0 bg-white" />
        
        {/* Storyset Illustration */}
        <div className="relative z-10 mb-8 w-full max-w-md">
          <img 
            src="/signin.svg" 
            alt="Login illustration"
            className="w-full h-auto"
          />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute top-1/3 right-8 w-16 h-16 bg-white/5 rounded-full blur-lg" />
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-1/2 flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Admin Login</h2>
            <p className="text-gray-600 text-lg">Enter your provided credentials</p>
          </div>
          
          {/* Show placeholder while Clerk is loading */}
          {showPlaceholder && (
            <div className="space-y-4 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 bg-[#00B24B] rounded"></div>
            </div>
          )}
          
          {/* Clerk SignIn component */}
          <div className={showPlaceholder ? 'opacity-0 absolute' : 'opacity-100'}>
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: {
                    backgroundColor: '#00B24B',
                    ':hover': {
                      backgroundColor: '#009140',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    },
                    fontSize: '14px',
                    textTransform: 'none',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  },
                  card: "shadow-none border-none",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formFieldInput: "border-2 border-gray-200 focus:border-blue-500 transition-colors duration-200",
                  footerActionLink: "text-blue-600 hover:text-blue-700",
                  // Hide sign up options completely
                  footerActionText: "hidden",
                  footerAction: "hidden",
                  // Hide social login buttons if any
                  socialButtonsBlockButton: "hidden",
                  socialButtonsBlockButtonText: "hidden",
                  dividerRow: "hidden",
                  dividerText: "hidden"
                }
              }}
              signUpUrl=""
              forceRedirectUrl="/partner-dashboard"
              fallbackRedirectUrl="/partner-dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  )
}