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
        <div className="min-h-screen bg-stone-50 font-sans">
            <Navbar />
            <main className="container mx-auto px-4 py-12 lg:px-10 flex items-center justify-center min-h-[calc(100vh-64px)] animate-page-enter">
                <Auth />
            </main>
        </div>
    )
}
