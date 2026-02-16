"use client";

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Auth from '@/components/feature/Auth'
import { Navbar } from '@/components/layout/navbar'

export default function AuthPage() {
    const router = useRouter()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                router.push('/')
            }
        })

        return () => subscription.unsubscribe()
    }, [router])

    return (
        <div className="min-h-screen bg-background font-sans">
            <Navbar />
            <main className="app-container px-6 py-12 lg:px-10 flex items-center justify-center min-h-[calc(100vh-64px)]">
                <Auth />
            </main>
        </div>
    )
}
