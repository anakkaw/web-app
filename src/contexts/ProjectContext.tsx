"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ProjectStatus = "วางแผน" | "กำลังดำเนินการ" | "เสร็จสิ้น";

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
    status: ProjectStatus;
    progress: number;
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
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const AGENCIES_STORAGE_KEY = "project_budget_agencies_v2";
const CURRENT_AGENCY_ID_KEY = "project_budget_current_agency_id";

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
        owner: "บริษัท เอ",
        location: "กรุงเทพฯ",
        category: "อาคารพาณิชย์",
        wbs: [],
    },
];

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [currentAgencyId, setCurrentAgencyId] = useState<string>("");
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
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
                // Perform migration
                const initialAgency: Agency = {
                    id: "default-agency",
                    name: "หน่วยงานเริ่มต้น",
                    projects: legacyProjects ? JSON.parse(legacyProjects) : defaultProjects,
                    categories: legacyCategories ? JSON.parse(legacyCategories) : defaultCategories,
                    totalAllocatedBudget: legacyBudget ? parseFloat(legacyBudget) : 100000000,
                };
                setAgencies([initialAgency]);
                setCurrentAgencyId(initialAgency.id);

                // Optional: clear legacy keys to prevent re-migration
                // localStorage.removeItem(LEGACY_PROJECTS_KEY);
                // localStorage.removeItem(LEGACY_CATEGORIES_KEY);
                // localStorage.removeItem(LEGACY_BUDGET_KEY);
            } else {
                // Complete fresh start
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
    }, []);

    // Save to local storage whenever agencies or currentAgencyId changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(AGENCIES_STORAGE_KEY, JSON.stringify(agencies));
            localStorage.setItem(CURRENT_AGENCY_ID_KEY, currentAgencyId);
        }
    }, [agencies, currentAgencyId, isLoaded]);

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
            deleteAgency
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
