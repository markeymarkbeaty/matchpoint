'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 px-6 py-16">
      <div className="max-w-4xl mx-auto">

        <section className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Compete. Predict. Climb the Leaderboard.
          </motion.h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            MatchPoint is a competitive NWSL prediction platform where you and
            your friends pick match outcomes and track performance all season.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/auth"
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-3 rounded-xl transition"
            >
              Create Account
            </Link>

            <Link
              href="/auth"
              className="border border-zinc-700 hover:border-zinc-500 px-6 py-3 rounded-xl transition"
            >
              Log In
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-20">
          <Feature
            title="Make Your Picks"
            description="Choose home, draw, or away before kickoff."
          />
          <Feature
            title="Track Results"
            description="Automatic scoring updates standings."
          />
          <Feature
            title="Compete With Friends"
            description="See who actually knows the league."
          />
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-20">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">
            Invite Your Friends
          </h2>
          <p className="text-zinc-400 mb-4">
            The more players, the better the competition.
          </p>
          <p className="text-zinc-500 text-sm break-all">
            https://matchpoint-ivory-pi.vercel.app
          </p>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">
            Coming Soon: Bet Against Yourself
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            An optional savings layer where wins invest funds and losses return
            principal. No gambling. Just better habits.
          </p>
        </section>

      </div>
    </main>
  )
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-2 text-green-400">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}