"use client"
import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const { signIn } = useSignIn()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email) return
    
    setIsLoading(true)
    setMessage('')
    
    try {
      if (!signIn) {
        throw new Error('Sign in not available')
      }
      
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      setIsSuccess(true)
      setMessage('Password reset email sent! Check your inbox and follow the instructions.')
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as any)?.errors?.[0]?.message || 'Error sending reset email. Please try again.'
      setMessage(errorMessage)
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Illustration */}
      <div className="w-1/2 bg-white relative overflow-hidden flex flex-col justify-center items-center p-12">
        <div className="absolute inset-0 bg-white" />
        
        {/* Illustration */}
        <div className="relative z-10 mb-8 w-full max-w-md">
          <Image 
            src="/forgot-password.svg" 
            alt="Forgot password illustration"
            width={400}
            height={300}
            className="w-full h-auto"
            priority
          />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute top-1/3 right-8 w-16 h-16 bg-white/5 rounded-full blur-lg" />
      </div>

      {/* Right side - Forgot Password Form */}
      <div className="w-1/2 flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-sm">
          {!isSuccess ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Reset Password</h2>
                <p className="text-gray-600 text-lg">Enter your email to receive reset instructions</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    placeholder="Enter your email address"
                  />
                </div>

                {message && !isSuccess && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Email'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Sent!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail('')
                    setMessage('')
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Send Another Email
                </button>
              </div>
            </div>
          )}

          {/* Back to Sign In */}
          <div className="text-center mt-6">
            <Link 
              href="/sign-in"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}