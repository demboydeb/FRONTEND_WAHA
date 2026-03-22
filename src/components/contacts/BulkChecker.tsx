import React, { useState } from 'react'
import { useBulkCheckContacts } from '@/hooks/useContacts'
import { Button } from '@/components/common/Button'
import type { ContactCheck } from '@/types'

interface BulkCheckerProps {
  sessionId: string
}

export const BulkChecker: React.FC<BulkCheckerProps> = ({ sessionId }) => {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<ContactCheck[] | null>(null)
  const [summary, setSummary] = useState<{ found: number; total: number } | null>(null)

  const bulkMutation = useBulkCheckContacts(sessionId)

  const handleSubmit = async () => {
    const phones = input
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .slice(0, 50)

    if (phones.length === 0) return

    const res = await bulkMutation.mutateAsync(phones)
    setResults(res.data.results)
    setSummary({ found: res.data.found, total: res.data.total })
  }

  return (
    <div data-testid="bulk-checker" className="space-y-4">
      <div>
        <label className="text-sm font-medium text-[#8892a8] block mb-1">
          Phone Numbers (one per line, up to 50)
        </label>
        <textarea
          data-testid="bulk-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={'+33612345678\n+447911123456\n+12025551234'}
          rows={6}
          className="w-full bg-[#11141b] border border-[#252b3b] rounded-[10px] px-3 py-2 text-[#e8ecf4] text-sm placeholder:text-[#5a6478] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 focus:border-[#3b4460] transition-colors resize-y"
        />
      </div>

      <Button
        data-testid="bulk-submit"
        onClick={() => void handleSubmit()}
        loading={bulkMutation.isPending}
        disabled={!input.trim()}
      >
        Check All
      </Button>

      {summary && (
        <p data-testid="bulk-summary" className="text-sm text-[#8892a8]">
          <span className="font-semibold text-[#22c55e]">{summary.found}</span> of{' '}
          <span className="font-semibold text-[#e8ecf4]">{summary.total}</span> found on WhatsApp
        </p>
      )}

      {results && results.length > 0 && (
        <div data-testid="bulk-results" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#252b3b]">
                <th className="text-left py-2 px-3 text-xs font-semibold text-[#5a6478] uppercase tracking-wide">
                  Phone
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-[#5a6478] uppercase tracking-wide">
                  JID
                </th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-[#5a6478] uppercase tracking-wide">
                  Exists
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.phone} className="border-b border-[#252b3b]/50 hover:bg-[#1c2130]/50">
                  <td className="py-2 px-3 text-[#e8ecf4]">{r.phone}</td>
                  <td className="py-2 px-3 text-[#8892a8] font-mono text-xs">{r.jid || '-'}</td>
                  <td className="py-2 px-3 text-center">
                    {r.exists ? (
                      <svg className="w-4 h-4 text-[#22c55e] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-[#ef4444] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {bulkMutation.isError && (
        <p className="text-sm text-[#ef4444]">Error checking contacts. Please try again.</p>
      )}
    </div>
  )
}

export default BulkChecker
