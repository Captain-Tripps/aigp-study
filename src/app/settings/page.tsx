'use client'

import { useState } from 'react'
import { ExamSettings } from '@/components/settings/ExamSettings'

export default function SettingsPage() {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    const res = await fetch('/api/export')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'aigp-study-export.json'
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const text = await file.text()
    const data = JSON.parse(text)
    await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setImporting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-clay-text/50">Manage your study configuration and data</p>
      </div>

      <ExamSettings />

      <div className="clay-card-sm">
        <h2 className="text-lg font-semibold text-clay-text">Data Management</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="clay-btn-secondary disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export Data (JSON)'}
          </button>
          <label className="clay-btn-secondary cursor-pointer">
            {importing ? 'Importing...' : 'Import Data (JSON)'}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
