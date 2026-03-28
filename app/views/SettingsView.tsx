'use client';

import React from 'react';
import { Database, FileJson } from 'lucide-react';

export default function SettingsView() {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">
            Settings & Integrations
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your upstream payroll and downstream finance system integrations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll Integration */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-lg font-medium leading-6 text-gray-900">Payroll Integration</h3>
            </div>
            <div className="prose prose-sm text-gray-500">
              <p>Configure your upstream payroll system connection to automatically ingest payroll records.</p>
              
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
                <p className="text-sm font-medium text-gray-600">Configuration coming soon...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Finance Integration */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <FileJson className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-medium leading-6 text-gray-900">Finance Integration</h3>
            </div>
            <div className="prose prose-sm text-gray-500">
              <p>Schema definition for the downstream finance system payload. This is the expected format when exporting invoices.</p>
              
              <div className="mt-4 bg-gray-900 rounded-md p-4 overflow-auto max-h-96">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
{`{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Finance Invoice Payload",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "billingId": {
        "type": "string",
        "description": "Unique identifier for the billing item"
      },
      "billingPeriod": {
        "type": "string",
        "description": "The billing period (e.g., '2026-03')"
      },
      "customerName": {
        "type": "string"
      },
      "customerEmail": {
        "type": "string"
      },
      "amount": {
        "type": "number",
        "description": "Total amount to be invoiced"
      },
      "description": {
        "type": "string"
      },
      "contractType": {
        "type": "string",
        "enum": ["placement", "temp", "contract"]
      },
      "components": {
        "type": "array",
        "description": "Line items or pay components",
        "items": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "amount": { "type": "number" }
          },
          "required": ["name", "amount"]
        }
      }
    },
    "required": [
      "billingId", 
      "billingPeriod", 
      "customerName", 
      "amount", 
      "contractType"
    ]
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
