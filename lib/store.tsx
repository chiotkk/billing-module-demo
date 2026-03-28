'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Customer = {
  id: string;
  name: string;
  company: string;
  email: string;
  onboardedAt: string;
};

export type ContractType = 'placement' | 'temp' | 'contract';
export type ContractSubtype = 'timesheet-basis' | 'contract-basis' | 'none';

export type Contract = {
  id: string;
  customerId: string;
  workerName: string;
  type: ContractType;
  subtype: ContractSubtype;
  rate: number;
  startDate: string;
  active: boolean;
};

export type PayComponent = {
  name: string;
  amount: number;
};

export type PayrollRecord = {
  id: string;
  contractId: string;
  components: PayComponent[];
  totalAmount: number;
  periodStart: string;
  periodEnd: string;
  ingestedAt: string;
};

export type ExportedPeriod = {
  period: string;
  exportedAt: string;
};

type AppContextType = {
  customers: Customer[];
  contracts: Contract[];
  payroll: PayrollRecord[];
  exportedPeriods: ExportedPeriod[];
  addContract: (c: Omit<Contract, 'id' | 'active'>) => void;
  addPayroll: (p: Omit<PayrollRecord, 'id' | 'ingestedAt' | 'totalAmount'>) => void;
  markPeriodExported: (period: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 'c1', name: 'Alice Smith', company: 'TechCorp', email: 'alice@techcorp.com', onboardedAt: '2026-01-15T10:00:00.000Z' },
    { id: 'c2', name: 'Bob Jones', company: 'BuildIt', email: 'bob@buildit.com', onboardedAt: '2026-02-20T10:00:00.000Z' },
    { id: 'c3', name: 'Carol White', company: 'DesignWorks', email: 'carol@designworks.com', onboardedAt: '2026-02-25T10:00:00.000Z' },
    { id: 'c4', name: 'David Lee', company: 'FinTech Solutions', email: 'david@fintech.com', onboardedAt: '2026-03-01T10:00:00.000Z' },
    { id: 'c5', name: 'Eve Davis', company: 'HealthPlus', email: 'eve@healthplus.com', onboardedAt: '2026-03-10T10:00:00.000Z' },
    { id: 'c6', name: 'Frank Miller', company: 'EduGlobal', email: 'frank@eduglobal.com', onboardedAt: '2026-03-15T10:00:00.000Z' },
    { id: 'c7', name: 'Grace Taylor', company: 'Logistics Pro', email: 'grace@logisticspro.com', onboardedAt: '2026-03-20T10:00:00.000Z' },
  ]);
  const [contracts, setContracts] = useState<Contract[]>([
    { id: 'ct1', customerId: 'c1', workerName: 'Charlie Dev', type: 'placement', subtype: 'none', rate: 15000, startDate: '2026-03-01T10:00:00.000Z', active: true },
    { id: 'ct2', customerId: 'c2', workerName: 'Dave Builder', type: 'temp', subtype: 'none', rate: 50, startDate: '2026-03-05T10:00:00.000Z', active: true },
    { id: 'ct3', customerId: 'c3', workerName: 'Emma Designer', type: 'contract', subtype: 'timesheet-basis', rate: 80, startDate: '2026-03-10T10:00:00.000Z', active: true },
    { id: 'ct4', customerId: 'c3', workerName: 'Fiona UX', type: 'contract', subtype: 'contract-basis', rate: 12000, startDate: '2026-03-12T10:00:00.000Z', active: true },
    { id: 'ct5', customerId: 'c4', workerName: 'George Analyst', type: 'placement', subtype: 'none', rate: 18000, startDate: '2026-03-15T10:00:00.000Z', active: true },
    { id: 'ct6', customerId: 'c5', workerName: 'Hannah Nurse', type: 'temp', subtype: 'none', rate: 45, startDate: '2026-03-18T10:00:00.000Z', active: true },
    { id: 'ct7', customerId: 'c5', workerName: 'Ian Tech', type: 'temp', subtype: 'none', rate: 55, startDate: '2026-03-20T10:00:00.000Z', active: true },
    { id: 'ct8', customerId: 'c5', workerName: 'Jane Admin', type: 'temp', subtype: 'none', rate: 30, startDate: '2026-03-22T10:00:00.000Z', active: true },
  ]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([
    { id: 'p1', contractId: 'ct2', components: [{ name: 'Base Pay', amount: 4000 }], totalAmount: 4000, periodStart: '2026-03-01', periodEnd: '2026-03-15', ingestedAt: '2026-03-27T10:00:00.000Z' }
  ]);
  const [exportedPeriods, setExportedPeriods] = useState<ExportedPeriod[]>([]);

  const addContract = (c: Omit<Contract, 'id' | 'active'>) => {
    const newContract: Contract = {
      ...c,
      id: Math.random().toString(36).substring(7),
      active: true,
    };
    setContracts((prev) => [...prev, newContract]);
  };

  const addPayroll = (p: Omit<PayrollRecord, 'id' | 'ingestedAt' | 'totalAmount'>) => {
    const totalAmount = p.components.reduce((sum, comp) => sum + comp.amount, 0);
    const newPayroll: PayrollRecord = {
      ...p,
      id: Math.random().toString(36).substring(7),
      totalAmount,
      ingestedAt: new Date().toISOString(),
    };
    setPayroll((prev) => [...prev, newPayroll]);
  };

  const markPeriodExported = (period: string) => {
    if (!exportedPeriods.some(ep => ep.period === period)) {
      setExportedPeriods(prev => [...prev, { period, exportedAt: new Date().toISOString() }]);
    }
  };

  return (
    <AppContext.Provider value={{ customers, contracts, payroll, exportedPeriods, addContract, addPayroll, markPeriodExported }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
