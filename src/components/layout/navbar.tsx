"use client";

import Link from "next/link";
import { useProjects } from "@/contexts/ProjectContext";
import { useState } from "react";
import { AgencyModal } from "@/components/feature/AgencyModal";
import { Button } from "@/components/ui/button";

export function Navbar() {
    const { currentAgency } = useProjects();
    const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);

    return (
        <>
            <nav className="sticky top-0 z-40 border-b border-orange-200 bg-white/80 backdrop-blur-md shadow-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 shadow-md shadow-orange-600/20">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                            <Link href="/" className="text-xl font-black tracking-tight text-stone-900 transition-colors hover:text-orange-600">
                                ระบบคำนวณงบประมาณ
                            </Link>
                        </div>

                        {/* Agency Switcher Trigger */}
                        <div className="hidden md:flex items-center border-l border-stone-200 pl-6 gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setIsAgencyModalOpen(true)}
                                className="flex items-center gap-2 px-4 h-10 rounded-xl bg-orange-50/50 hover:bg-orange-100/80 text-orange-700 transition-all border border-orange-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                                <span className="font-black text-sm">{currentAgency?.name || "เลือกหน่วยงาน"}</span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <div className="flex gap-1 mr-2 border-r border-stone-200 pr-2 md:border-none md:pr-0">
                            <Link
                                href="/"
                                className="group flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-stone-600 transition-all hover:bg-orange-100 hover:text-orange-700 active:scale-95"
                            >
                                แดชบอร์ด
                            </Link>

                            <Link
                                href="/reports"
                                className="group flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-stone-600 transition-all hover:bg-orange-100 hover:text-orange-700 active:scale-95"
                            >
                                รายงาน
                            </Link>
                        </div>

                        {/* Mobile Agency Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsAgencyModalOpen(true)}
                            className="md:hidden h-10 w-10 text-orange-600 bg-orange-50 rounded-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z" /><circle cx="12" cy="12" r="3" /></svg>
                        </Button>
                    </div>
                </div>
            </nav>

            <AgencyModal
                isOpen={isAgencyModalOpen}
                onClose={() => setIsAgencyModalOpen(false)}
            />
        </>
    );
}
