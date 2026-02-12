"use client";

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Auth({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in')
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            if (view === 'sign_in') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                if (onAuthSuccess) onAuthSuccess()
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                setMessage({ text: 'สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน', type: 'success' })
            }
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ text: error.message || 'เกิดข้อผิดพลาด', type: 'error' })
            } else {
                setMessage({ text: 'เกิดข้อผิดพลาดที่ไม่รู้จัก', type: 'error' })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto shadow-xl border-stone-200">
            <CardHeader className="space-y-1 bg-stone-50/50 border-b border-stone-200">
                <CardTitle className="text-2xl font-black text-stone-900 text-center">
                    {view === 'sign_in' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                </CardTitle>
                <CardDescription className="text-center font-bold text-stone-500">
                    {view === 'sign_in'
                        ? 'เข้าสู่ระบบเพื่อซิงค์ข้อมูลของคุณ'
                        : 'สร้างบัญชีใหม่เพื่อเริ่มใช้งาน'}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="email"
                            placeholder="อีเมล"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-12 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="รหัสผ่าน"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-12 font-bold"
                        />
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {message.text}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-black text-lg shadow-lg shadow-orange-600/20"
                        disabled={loading}
                    >
                        {loading ? 'กำลังดำเนินการ...' : (view === 'sign_in' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก')}
                    </Button>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setView(view === 'sign_in' ? 'sign_up' : 'sign_in')
                                setMessage(null)
                            }}
                            className="text-stone-500 hover:text-orange-600 text-sm font-bold underline-offset-4 hover:underline transition-colors"
                        >
                            {view === 'sign_in' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}
                        </button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
