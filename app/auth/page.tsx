'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {

  const router = useRouter()

  const [isSignup, setIsSignup] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault()

    setLoading(true)
    setError(null)
    setMessage(null)

    try {

      if (isSignup) {

        const normalizedUsername = username.toLowerCase()

        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .ilike('username', normalizedUsername)
          .single()

        if (existingUser) {
          throw new Error('Username already taken')
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'https://matchpoint-one.vercel.app/home'
          }
        })

        if (error) throw error

        if (data.user) {

          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: normalizedUsername
            })

          if (profileError) throw profileError
        }

        setMessage(
          'Account created! Please check your email to confirm your account before logging in.'
        )

      } else {

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        router.push('/home')
        router.refresh()
      }

    } catch (err: any) {

      setError(err.message)

    }

    setLoading(false)
  }

  return (

    <main className="min-h-screen bg-black text-zinc-100 flex items-center justify-center px-6">

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md transition hover:border-green-400 hover:shadow-[0_0_18px_rgba(74,222,128,0.25)]">

        <h1 className="text-2xl font-semibold mb-6 text-center">
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {isSignup && (
            <input
              type="text"
              placeholder="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400 transition"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400 transition"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400 transition"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {message && (
            <p className="text-green-400 text-sm">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 border border-green-400 text-green-300 font-semibold py-3 rounded-xl transition hover:shadow-[0_0_14px_rgba(74,222,128,0.6)] disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'}
          </button>

        </form>

        <div className="text-center mt-6 text-sm text-zinc-400">

          <button
            onClick={() => {
              setIsSignup(!isSignup)
              setError(null)
              setMessage(null)
            }}
            className="hover:text-green-400 transition"
          >
            {isSignup
              ? 'Already have an account? Log in'
              : "Don't have an account? Sign up"}
          </button>

        </div>

      </div>

    </main>

  )
}