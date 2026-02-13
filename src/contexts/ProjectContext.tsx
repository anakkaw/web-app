"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";

export type ProjectStatus = "วางแผน" | "กำลังดำเนินการ" | "เสร็จสิ้น"; // Legacy status, keeping for compatibility if needed, or we can map it.
export type ProjectProgress = "Not Start" | "Planning" | "In Progress" | "Done";

export interface WBSItem {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
}

export interface Project {
    id: number;
    projectCode: string;
    name: string;
    budget: number;
    status: ProjectStatus; // Legacy
    progress: number; // Legacy numeric progress
    progressLevel: ProjectProgress; // New 4-level progress
    activityDate?: string; // New Activity Date
    owner?: string;
    location?: string;
    startDate?: string;
    category: string;
    wbs: WBSItem[];
}

export interface Agency {
    id: string;
    name: string;
    projects: Project[];
    categories: string[];
    totalAllocatedBudget: number;
    passcode?: string; // New: Per-agency reader passcode
}

interface ProjectContextType {
    agencies: Agency[];
    currentAgencyId: string;
    currentAgency: Agency | undefined;
    projects: Project[];
    categories: string[];
    totalAllocatedBudget: number;
    addProject: (project: Omit<Project, "id" | "progress">) => void;
    updateProject: (id: number, project: Partial<Project>) => void;
    deleteProject: (id: number) => void;
    addCategory: (category: string) => void;
    deleteCategory: (category: string) => void;
    updateTotalAllocatedBudget: (amount: number) => void;
    clearAllData: () => void;
    // Multi-agency functions
    addAgency: (name: string) => void;
    switchAgency: (id: string) => void;
    updateAgencyName: (id: string, name: string) => void;
    deleteAgency: (id: string) => void;
    session: Session | null;
    syncLocalToCloud: () => Promise<void>;
    duplicateProject: (id: number) => void;
    resetAllProjectDates: () => void;
    // Reader Mode
    userRole: 'admin' | 'reader' | 'guest';
    loginAsReader: (passcode: string) => boolean;
    loginAsDemoAdmin: () => void;
    logout: () => void;
    isAuthenticated: boolean;
    updateAgencyPasscode: (agencyId: string, passcode: string) => void;
    isLoaded: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const AGENCIES_STORAGE_KEY = "project_budget_agencies_v2";
const CURRENT_AGENCY_ID_KEY = "project_budget_current_agency_id";
const USER_ROLE_KEY = "project_budget_user_role";

// Legacy keys for migration
const LEGACY_PROJECTS_KEY = "project_budget_projects";
const LEGACY_CATEGORIES_KEY = "project_budget_categories";
const LEGACY_BUDGET_KEY = "project_budget_allocated_total";

const defaultCategories = [
    "บ้านพักอาศัย",
    "อาคารพาณิชย์",
    "โรงงาน/โกดัง",
    "อื่นๆ",
];

const defaultProjects: Project[] = [
    {
        id: 1,
        projectCode: "PRJ-001",
        name: "ปรับปรุงตึกสำนักงาน A",
        budget: 5000000,
        status: "กำลังดำเนินการ",
        progress: 25,
        progressLevel: "In Progress",
        activityDate: new Date().toISOString(),
        owner: "บริษัท เอ",
        location: "กรุงเทพฯ",
        category: "อาคารพาณิชย์",
        wbs: [],
    },
];

const DEMO_MODE_KEY = "project_budget_demo_mode";

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [currentAgencyId, setCurrentAgencyId] = useState<string>("");
    const [userRole, setUserRole] = useState<'admin' | 'reader' | 'guest'>('guest');
    const [isLoaded, setIsLoaded] = useState(false);
    const [session, setSession] = useState<Session | null>(null);

    const loadFromSupabase = async (userId: string) => {
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase
            .from("user_data")
            .select("data")
            .eq("user_id", userId)
            .single();

        if (data && data.data) {
            // Check if data is valid JSON structure for agencies
            const cloudData = data.data as { agencies?: Agency[], currentAgencyId?: string };
            const cloudAgencies = cloudData.agencies;
            const cloudCurrentId = cloudData.currentAgencyId;

            if (cloudAgencies && Array.isArray(cloudAgencies)) {
                setAgencies(cloudAgencies);
                if (cloudCurrentId) setCurrentAgencyId(cloudCurrentId);
            }
        } else {
            // No cloud data — fall back to local storage
            loadFromLocalStorage();
        }
        setIsLoaded(true);
    };

    // Initial load and Auth subscription
    useEffect(() => {
        // Restore user role specifically here to ensure it sticks
        const demo = localStorage.getItem(DEMO_MODE_KEY);
        const storedRole = localStorage.getItem(USER_ROLE_KEY);

        if (demo === 'true') {
            setUserRole('admin');
        } else if (storedRole === 'reader' || storedRole === 'admin') {
            setUserRole(storedRole as 'admin' | 'reader');
        }

        // 1. Initial Data Load
        loadFromLocalStorage();

        // 2. Supabase Auth Listener
        import("@/lib/supabase").then(({ supabase }) => {
            supabase.auth.getSession().then(({ data: { session } }) => {
                setSession(session);
                if (session) {
                    setUserRole('admin');
                    loadFromSupabase(session.user.id);
                }
                // Note: If no session, we DO NOT reset userRole here, 
                // because it might have been set by lazy init (local admin/reader).
            });

            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
                if (session) {
                    // Safety check: if we are in demo mode, do NOT switch to Supabase user
                    if (typeof window !== 'undefined' && localStorage.getItem(DEMO_MODE_KEY) === 'true') {
                        return;
                    }
                    setUserRole('admin');
                    loadFromSupabase(session.user.id);
                } else {
                    // Only reset if we were previously logged in via Supabase? 
                    // Or if we explicitly signed out?
                    // Safe approach: If we are not 'admin' or 'reader' locally, load defaults.
                    // But if we are locally 'admin' (demo), we should stay 'admin'.

                    // Actually, onAuthStateChange might fire on init. 
                    // We should only reset if the USER ROLE was 'admin' AND we lost session?
                    // No, Demo Admin effectively has no session.

                    // Best approach: Just load data. Do not touch userRole unless it is 'guest'.
                    loadFromLocalStorage();
                }
            });

            return () => subscription.unsubscribe();
        });
    }, []);

    const loadFromLocalStorage = () => {
        const storedAgencies = localStorage.getItem(AGENCIES_STORAGE_KEY);
        const storedCurrentId = localStorage.getItem(CURRENT_AGENCY_ID_KEY);

        if (storedAgencies) {
            try {
                const parsed = JSON.parse(storedAgencies);
                setAgencies(parsed);
                if (storedCurrentId) {
                    setCurrentAgencyId(storedCurrentId);
                } else if (parsed.length > 0) {
                    setCurrentAgencyId(parsed[0].id);
                }
            } catch (error) {
                console.error("Failed to parse agencies:", error);
            }
        } else {
            // Check for legacy data to migrate
            const legacyProjects = localStorage.getItem(LEGACY_PROJECTS_KEY);
            const legacyCategories = localStorage.getItem(LEGACY_CATEGORIES_KEY);
            const legacyBudget = localStorage.getItem(LEGACY_BUDGET_KEY);

            if (legacyProjects || legacyCategories || legacyBudget) {
                const initialAgency: Agency = {
                    id: "default-agency",
                    name: "หน่วยงานเริ่มต้น",
                    projects: legacyProjects ? JSON.parse(legacyProjects) : defaultProjects,
                    categories: legacyCategories ? JSON.parse(legacyCategories) : defaultCategories,
                    totalAllocatedBudget: legacyBudget ? parseFloat(legacyBudget) : 100000000,
                };
                setAgencies([initialAgency]);
                setCurrentAgencyId(initialAgency.id);
            } else {
                const initialAgency: Agency = {
                    id: "default-agency",
                    name: "หน่วยงานเริ่มต้น",
                    projects: defaultProjects,
                    categories: defaultCategories,
                    totalAllocatedBudget: 100000000,
                };
                setAgencies([initialAgency]);
                setCurrentAgencyId(initialAgency.id);
            }
        }
        setIsLoaded(true);
    };



    // Save data whenever it changes
    useEffect(() => {
        if (!isLoaded) return;

        // Always save to local storage as backup/offline cache
        localStorage.setItem(AGENCIES_STORAGE_KEY, JSON.stringify(agencies));
        localStorage.setItem(CURRENT_AGENCY_ID_KEY, currentAgencyId);

        // If logged in, save to cloud
        if (session?.user?.id) {
            const saveData = async () => {
                const { supabase } = await import("@/lib/supabase");
                await supabase.from("user_data").upsert({
                    user_id: session.user.id,
                    data: { agencies, currentAgencyId },
                    updated_at: new Date().toISOString()
                });
            };
            // Debounce or just save
            saveData().catch(console.error);
        }
    }, [agencies, currentAgencyId, isLoaded, session]);

    const currentAgency = agencies.find(a => a.id === currentAgencyId);

    // Proxy properties for backward compatibility and convenience
    const projects = currentAgency?.projects || [];
    const categories = currentAgency?.categories || [];
    const totalAllocatedBudget = currentAgency?.totalAllocatedBudget || 0;

    // Multi-agency functions
    const addAgency = (name: string) => {
        const newAgency: Agency = {
            id: Date.now().toString(),
            name,
            projects: [],
            categories: defaultCategories,
            totalAllocatedBudget: 100000000,
            passcode: '9999', // Default passcode for new agencies
        };
        setAgencies((prev) => [...prev, newAgency]);
        setCurrentAgencyId(newAgency.id);
    };

    const switchAgency = (id: string) => {
        if (agencies.find(a => a.id === id)) {
            setCurrentAgencyId(id);
        }
    };

    const updateAgencyName = (id: string, name: string) => {
        setAgencies((prev) => prev.map(a => a.id === id ? { ...a, name } : a));
    };

    const deleteAgency = (id: string) => {
        if (agencies.length <= 1) {
            alert("ไม่สามารถลบหน่วยงานสุดท้ายได้");
            return;
        }
        if (confirm("คุณต้องการลบหน่วยงานนี้ใช่หรือไม่? ข้อมูลทั้งหมดในหน่วยงานจะถูกลบถาวร")) {
            setAgencies((prev) => {
                const filtered = prev.filter(a => a.id !== id);
                if (currentAgencyId === id) {
                    setCurrentAgencyId(filtered[0].id);
                }
                return filtered;
            });
        }
    };

    // Updated Project/Category functions
    const addProject = (newProjectData: Omit<Project, "id" | "progress">) => {
        const newProject: Project = {
            ...newProjectData,
            id: Date.now(),
            progress: 0,
        };
        setAgencies(prev => prev.map(a =>
            a.id === currentAgencyId
                ? { ...a, projects: [newProject, ...a.projects] }
                : a
        ));
    };

    const updateProject = (id: number, updatedData: Partial<Project>) => {
        setAgencies(prev => prev.map(a =>
            a.id === currentAgencyId
                ? { ...a, projects: a.projects.map(p => p.id === id ? { ...p, ...updatedData } : p) }
                : a
        ));
    };

    const deleteProject = (id: number) => {
        setAgencies(prev => prev.map(a =>
            a.id === currentAgencyId
                ? { ...a, projects: a.projects.filter(p => p.id !== id) }
                : a
        ));
    };

    const addCategory = (category: string) => {
        setAgencies(prev => prev.map(a =>
            a.id === currentAgencyId && !a.categories.includes(category)
                ? { ...a, categories: [...a.categories, category] }
                : a
        ));
    };

    const deleteCategory = (category: string) => {
        setAgencies(prev => prev.map(a =>
            a.id === currentAgencyId
                ? { ...a, categories: a.categories.filter(c => c !== category) }
                : a
        ));
    };

    const updateTotalAllocatedBudget = (amount: number) => {
        setAgencies(prev => prev.map(a =>
            a.id === currentAgencyId
                ? { ...a, totalAllocatedBudget: amount }
                : a
        ));
    };

    const clearAllData = () => {
        setAgencies([{
            id: "default-agency",
            name: "หน่วยงานเริ่มต้น",
            projects: defaultProjects,
            categories: defaultCategories,
            totalAllocatedBudget: 100000000,
        }]);
        setCurrentAgencyId("default-agency");
    };

    // Migration function
    const syncLocalToCloud = async () => {
        if (!session?.user?.id) return alert("กรุณาเข้าสู่ระบบก่อนซิงค์ข้อมูล");

        if (confirm("คุณต้องการอัปโหลดข้อมูลจากเครื่องนี้ไปทับข้อมูลบน Cloud ใช่หรือไม่?")) {
            const { supabase } = await import("@/lib/supabase");
            const { error } = await supabase.from("user_data").upsert({
                user_id: session.user.id,
                data: { agencies, currentAgencyId },
                updated_at: new Date().toISOString()
            });

            if (error) {
                alert("เกิดข้อผิดพลาดในการซิงค์: " + error.message);
            } else {
                alert("ซิงค์ข้อมูลสำเร็จ!");
            }
        }
    }


    const duplicateProject = (id: number) => {
        const projectToCopy = projects.find(p => p.id === id);
        if (projectToCopy) {
            const newProject: Project = {
                ...projectToCopy,
                id: Date.now(),
                name: `${projectToCopy.name} (Copy)`,
                projectCode: `${projectToCopy.projectCode}-COPY`,
                progress: 0,
                progressLevel: "Not Start",
                // Keep other fields like budget, owner, location, wbs
                activityDate: undefined, // Clear date on copy
            };
            setAgencies(prev => prev.map(a =>
                a.id === currentAgencyId
                    ? { ...a, projects: [newProject, ...a.projects] }
                    : a
            ));
        }
    };

    const resetAllProjectDates = () => {
        if (confirm("คำเตือน: คุณต้องการล้างวันที่กิจกรรมของ 'ทุกโครงการ' ใน 'ทุกหน่วยงาน' ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
            setAgencies(prev => prev.map(a => ({
                ...a,
                projects: a.projects.map(p => ({ ...p, activityDate: "" }))
            })));
            alert("ล้างวันที่กิจกรรมเรียบร้อยแล้ว");
        }
    };

    const updateAgencyPasscode = (agencyId: string, newPasscode: string) => {
        setAgencies((prev) => prev.map(a =>
            a.id === agencyId ? { ...a, passcode: newPasscode } : a
        ));
    };

    const loginAsReader = (passcode: string): boolean => {
        // 1. Check if it matches any agency's passcode
        const targetAgency = agencies.find(a => a.passcode === passcode);

        if (targetAgency) {
            setUserRole('reader');
            localStorage.setItem(USER_ROLE_KEY, 'reader');
            setCurrentAgencyId(targetAgency.id); // Switch to that agency
            return true;
        }

        // 2. Fallback: Check hardcoded defaults or legacy global code if absolutely needed
        // For now, let's keep '1234' as a master fallback for testing if desired, or remove it for strictness.
        // User asked for "code for each agency", so we rely on that. 
        // We'll keep 'demo1234' as a global reader fail-safe? No, 'demo1234' is admin.


        return false;
    };

    const loginAsDemoAdmin = () => {
        setUserRole('admin');
        localStorage.setItem(USER_ROLE_KEY, 'admin');
        localStorage.setItem(DEMO_MODE_KEY, 'true');
        // Load local data for demo
        loadFromLocalStorage();
    };

    const logout = async () => {
        setUserRole('guest');
        localStorage.removeItem(USER_ROLE_KEY);
        localStorage.removeItem(DEMO_MODE_KEY);
        if (session) {
            const { supabase } = await import("@/lib/supabase");
            await supabase.auth.signOut();
        }
        // Force reload to clear states
        window.location.reload();
    };

    return (
        <ProjectContext.Provider value={{
            agencies,
            currentAgencyId,
            currentAgency,
            projects,
            categories,
            totalAllocatedBudget,
            addProject,
            updateProject,
            deleteProject,
            addCategory,
            deleteCategory,
            updateTotalAllocatedBudget,
            clearAllData,
            addAgency,
            switchAgency,
            updateAgencyName,
            deleteAgency,
            session,
            syncLocalToCloud,
            duplicateProject,
            resetAllProjectDates,
            userRole,
            loginAsReader,
            logout,
            isAuthenticated: userRole !== 'guest',
            updateAgencyPasscode,
            loginAsDemoAdmin,
            isLoaded,
        }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error("useProjects must be used within a ProjectProvider");
    }
    return context;
}
