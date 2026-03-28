'use client';

import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  LayoutDashboard,
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DashboardView from './views/DashboardView';
import CustomersView from './views/CustomersView';
import PayrollView from './views/PayrollView';
import InvoicesView from './views/InvoicesView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';

type Tab = 'dashboard' | 'customers' | 'payroll' | 'invoices' | 'reports' | 'settings';

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payroll', label: 'Payroll Ingestion', icon: DollarSign },
    { id: 'invoices', label: 'Billing & Invoices', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView onNavigate={setActiveTab} />;
      case 'customers': return <CustomersView />;
      case 'payroll': return <PayrollView />;
      case 'invoices': return <InvoicesView />;
      case 'reports': return <ReportsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden w-64 flex-col bg-white border-r border-gray-200 md:flex">
        <div className="flex h-16 items-center justify-center border-b border-gray-200 px-6">
          <h1 className="text-xl font-bold text-indigo-600">StaffingSync</h1>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === item.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5 flex-shrink-0", activeTab === item.id ? "text-indigo-700" : "text-gray-400")} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile menu */}
      <div className="md:hidden">
        {/* Mobile header */}
        <div className="flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4">
          <h1 className="text-xl font-bold text-indigo-600">StaffingSync</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {isMobileMenuOpen && (
          <div className="absolute inset-x-0 top-16 z-50 bg-white border-b border-gray-200 shadow-lg">
            <nav className="space-y-1 px-2 pb-3 pt-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center rounded-md px-3 py-2 text-base font-medium",
                      activeTab === item.id
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className={cn("mr-4 h-6 w-6 flex-shrink-0", activeTab === item.id ? "text-indigo-700" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto focus:outline-none">
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
