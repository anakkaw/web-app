"use client";

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useProjects } from "@/contexts/ProjectContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

export default function Auth({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
    const { loginAsReader, loginAsDemoAdmin, agencies } = useProjects()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passcode, setPasscode] = useState('')
    const [activeTab, setActiveTab] = useState<'reader' | 'admin'>('reader')
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
    const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null)
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)

    const handleReaderLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        try {
            const success = loginAsReader(passcode, selectedAgencyId || undefined)
            if (success) {
                if (onAuthSuccess) onAuthSuccess()
            } else {
                throw new Error('รหัสผ่านไม่ถูกต้อง')
            }
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleAdminAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            // Check for Demo Credentials
            if (email.trim() === 'demo@example.com' && password.trim() === 'demo1234') {
                await handleDemoLogin();
                return;
            }

            if (authMode === 'signin') {
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
        } catch (error: any) {
            // If demo login fails (it shouldn't if logic is correct, but for safety)
            if (email === 'demo@example.com' && password === 'demo1234') {
                // Fallback if context method isn't available yet (it will be after this save)
                return;
            }
            setMessage({ text: error.message || 'เกิดข้อผิดพลาด', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const router = useRouter()

    const handleDemoLogin = async () => {
        setLoading(true);
        try {
            // Immediate Demo Login
            loginAsDemoAdmin();

            // Allow state to propagate
            await new Promise(resolve => setTimeout(resolve, 100));

            // Execute success callback if provided
            if (onAuthSuccess) {
                onAuthSuccess();
            } else {
                // Trust React state update first, fallback to router
                router.replace('/');
            }
        } catch {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-5xl mx-auto px-4">
            <div className="text-center mb-10 space-y-4 animate-in slide-in-from-bottom-5 duration-700 fade-in">
                <div className="flex justify-center mb-6">
                    <Logo size="xl" />
                </div>
                <p className="text-xl text-stone-500 font-medium max-w-2xl mx-auto leading-relaxed">
                    ระบบบริหารจัดการงบประมาณโครงการก่อสร้างแบบครบวงจร ใช้งานง่าย ติดตามได้ทุกที่
                </p>
            </div>

            <Card className="w-full max-w-lg shadow-2xl shadow-stone-200/50 border-stone-100 bg-white/80 backdrop-blur-sm overflow-hidden animate-in zoom-in-95 duration-500">
                <Tabs defaultValue="reader" value={activeTab} onValueChange={(v: string) => setActiveTab(v as any)} className="w-full">
                    <div className="bg-stone-50/50 border-b border-stone-100 p-2">
                        <TabsList className="grid w-full grid-cols-2 bg-stone-200/50 h-12 p-1 gap-1">
                            <TabsTrigger
                                value="reader"
                                className="font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all rounded-md h-full"
                            >
                                เข้าชมโครงการ (Reader)
                            </TabsTrigger>
                            <TabsTrigger
                                value="admin"
                                className="font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm transition-all rounded-md h-full"
                            >
                                จัดการโครงการ (Admin)
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <CardContent className="p-8">
                        <TabsContent value="reader" className="space-y-6 mt-0 animate-in slide-in-from-right-4 duration-300">
                            {!selectedAgencyId ? (
                                <>
                                    <div className="text-center space-y-2 mb-4">
                                        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M17 21v-8.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V21" /></svg>
                                        </div>
                                        <h2 className="text-2xl font-black text-stone-800">เลือกหน่วยงาน</h2>
                                        <p className="text-stone-500 font-medium">กรุณาเลือกหน่วยงานที่ต้องการเข้าชม</p>
                                    </div>

                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                        {agencies.map(agency => (
                                            <div
                                                key={agency.id}
                                                onClick={() => setSelectedAgencyId(agency.id)}
                                                className="flex items-center justify-between p-4 rounded-xl border border-stone-200 bg-white hover:border-orange-500 hover:shadow-md cursor-pointer transition-all group"
                                            >
                                                <span className="font-bold text-stone-700 group-hover:text-orange-700">{agency.name}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 group-hover:text-orange-500 transition-colors"><path d="m9 18 6-6-6-6" /></svg>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-center space-y-2 mb-6">
                                        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                        </div>
                                        <h2 className="text-2xl font-black text-stone-800">
                                            {agencies.find(a => a.id === selectedAgencyId)?.name || 'เข้าชมข้อมูลโครงการ'}
                                        </h2>
                                        <p className="text-stone-500 font-medium">กรอกรหัสผ่านเพื่อเข้าถึงข้อมูล</p>
                                    </div>

                                    <form onSubmit={handleReaderLogin} className="space-y-4">
                                        <Input
                                            type="password"
                                            placeholder="รหัสผ่านเข้าชม"
                                            value={passcode}
                                            onChange={(e) => setPasscode(e.target.value)}
                                            required
                                            className="h-14 font-black text-center text-2xl tracking-[0.5em] bg-stone-50 border-stone-200 focus:border-orange-500 focus:ring-orange-500/20 transition-all rounded-xl placeholder:tracking-normal placeholder:text-base placeholder:font-medium"
                                            autoFocus
                                        />
                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-12 w-14 border-stone-200 text-stone-500 hover:text-stone-800"
                                                onClick={() => {
                                                    setSelectedAgencyId(null);
                                                    setPasscode("");
                                                    setMessage(null);
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white font-black text-lg rounded-xl shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 transition-all hover:-translate-y-0.5"
                                                disabled={loading}
                                            >
                                                {loading ? 'กำลังตรวจสอบ...' : 'เข้าใช้งาน'}
                                            </Button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </TabsContent>

                        <TabsContent value="admin" className="space-y-6 mt-0 animate-in slide-in-from-left-4 duration-300">
                            <div className="text-center space-y-2 mb-6">
                                <div className="w-16 h-16 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                                </div>
                                <h2 className="text-2xl font-black text-stone-800">
                                    {authMode === 'signin' ? 'เข้าสู่ระบบผู้ดูแล' : 'ลงทะเบียนผู้ดูแลใหม่'}
                                </h2>
                                <p className="text-stone-500 font-medium">จัดการข้อมูลงบประมาณและโครงการทั้งหมด</p>
                            </div>

                            <form onSubmit={handleAdminAuth} className="space-y-4">
                                <div className="space-y-4">
                                    <Input
                                        type="email"
                                        placeholder="อีเมล"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 font-bold bg-stone-50 border-stone-200 focus:border-stone-800 rounded-xl"
                                    />
                                    <Input
                                        type="password"
                                        placeholder="รหัสผ่าน"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 font-bold bg-stone-50 border-stone-200 focus:border-stone-800 rounded-xl"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-stone-900 hover:bg-black text-white font-black text-lg rounded-xl shadow-lg shadow-stone-900/20 hover:shadow-stone-900/30 transition-all hover:-translate-y-0.5"
                                    disabled={loading}
                                >
                                    {loading ? 'กำลังดำเนินการ...' : (authMode === 'signin' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก')}
                                </Button>
                            </form>

                            <div className="flex flex-col gap-3 pt-4 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
                                        setMessage(null)
                                    }}
                                    className="text-stone-500 hover:text-stone-800 text-sm font-bold transition-colors"
                                >
                                    {authMode === 'signin' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDemoLogin}
                                    className="text-orange-600 hover:text-orange-700 text-sm font-black transition-colors"
                                >
                                    ทดลองใช้งาน (Demo Login)
                                </button>
                            </div>
                        </TabsContent>

                        {message && (
                            <div className={`mt-4 p-4 rounded-xl text-sm font-bold text-center animate-in fade-in slide-in-from-top-2 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                {message.text}
                            </div>
                        )}
                    </CardContent>
                </Tabs>
            </Card>
        </div>
    )
}
