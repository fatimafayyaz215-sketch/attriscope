"use client";

import { create } from "zustand";
import { DEFAULT_INDUSTRY, getIndustryDefaultWeights } from "@/lib/industry-defaults";

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  company: string;
  industry: string;
  last_login_at: string | null;
  days_inactive: number;
  usage_drop: number;
  support_complaints: number;
  payment_delay: number;
  risk_score: number;
  risk_level: "high" | "medium" | "low";
  ai_explanation: string | null;
  created_at: string;
}

export interface StoreWeights {
  inactivity: number;
  usage: number;
  support: number;
  payment: number;
}

interface ChurnStore {
  customers: CustomerRow[];
  selectedCustomerId: string | null;
  weights: StoreWeights;
  industry: string;
  dataVersion: number;
  setCustomers: (customers: CustomerRow[]) => void;
  selectCustomer: (id: string | null) => void;
  setWeights: (weights: StoreWeights) => void;
  setIndustry: (industry: string) => void;
  updateCustomer: (id: string, update: Partial<CustomerRow>) => void;
  bumpDataVersion: () => void;
}

export const useChurnStore = create<ChurnStore>((set) => ({
  customers: [],
  selectedCustomerId: null,
  weights: getIndustryDefaultWeights(DEFAULT_INDUSTRY),
  industry: DEFAULT_INDUSTRY,
  dataVersion: 0,

  setCustomers: (customers) => set({ customers }),
  selectCustomer: (id) => set({ selectedCustomerId: id }),
  setWeights: (weights) => set({ weights }),
  setIndustry: (industry) => set({ industry }),
  updateCustomer: (id, update) =>
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...update } : c
      ),
    })),
  bumpDataVersion: () => set((state) => ({ dataVersion: state.dataVersion + 1 })),
}));
