import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/services/api'
import type { MessageTemplate } from '@/types'

interface TemplateEditorProps {
  sessionId: string
}

function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{(\w+)\}\}/g) ?? []
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))]
}

function renderPreview(content: string): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_match, varName: string) => `[${varName}]`)
}

interface EditorState {
  name: string
  content: string
  isActive: boolean
}

const EMPTY_STATE: EditorState = { name: '', content: '', isActive: true }

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ sessionId }) => {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState<EditorState>(EMPTY_STATE)

  const { data, isLoading } = useQuery({
    queryKey: ['templates', sessionId],
    queryFn: async () => {
      const res = await apiClient.get<{ templates: MessageTemplate[] }>(
        `/sessions/${sessionId}/templates`
      )
      return res.data.templates
    },
  })

  const templates: MessageTemplate[] = data ?? []

  const createMutation = useMutation({
    mutationFn: async (body: { name: string; content: string }) => {
      const res = await apiClient.post<MessageTemplate>(
        `/sessions/${sessionId}/templates`,
        body
      )
      return res.data
    },
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['templates', sessionId] })
      setSelectedId(created.id)
      setIsNew(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      tId,
      body,
    }: {
      tId: string
      body: { name?: string; content?: string; isActive?: boolean }
    }) => {
      const res = await apiClient.put<MessageTemplate>(
        `/sessions/${sessionId}/templates/${tId}`,
        body
      )
      return res.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['templates', sessionId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (tId: string) => {
      await apiClient.delete(`/sessions/${sessionId}/templates/${tId}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['templates', sessionId] })
      setSelectedId(null)
      setIsNew(false)
      setForm(EMPTY_STATE)
    },
  })

  const handleSelect = (t: MessageTemplate) => {
    setSelectedId(t.id)
    setIsNew(false)
    setForm({ name: t.name, content: t.content, isActive: t.isActive })
  }

  const handleCreate = () => {
    setSelectedId(null)
    setIsNew(true)
    setForm(EMPTY_STATE)
  }

  const handleSave = () => {
    if (isNew) {
      createMutation.mutate({ name: form.name, content: form.content })
    } else if (selectedId) {
      updateMutation.mutate({
        tId: selectedId,
        body: { name: form.name, content: form.content, isActive: form.isActive },
      })
    }
  }

  const handleDelete = () => {
    if (!selectedId) return
    if (window.confirm('Delete this template?')) {
      deleteMutation.mutate(selectedId)
    }
  }

  const variables = extractVariables(form.content)
  const preview = renderPreview(form.content)
  const hasSelection = isNew || selectedId !== null

  return (
    <div data-testid="template-editor" className="flex gap-4 min-h-[400px]">
      {/* Template list */}
      <div
        data-testid="template-list"
        className="w-48 flex-shrink-0 flex flex-col gap-1 border-r border-[#252b3b] pr-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#5a6478] uppercase tracking-wide">
            Templates
          </span>
          <button
            onClick={handleCreate}
            className="text-xs text-[#22c55e] hover:text-[#16a34a] font-medium"
            aria-label="Create template"
          >
            + New
          </button>
        </div>

        {isLoading && (
          <p className="text-xs text-[#5a6478]">Loading...</p>
        )}

        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSelect(t)}
            className={[
              'text-left px-2 py-1.5 rounded-[6px] text-sm truncate transition-colors',
              selectedId === t.id
                ? 'bg-[#22c55e]/10 text-[#22c55e]'
                : 'text-[#8892a8] hover:bg-[#1c2130] hover:text-[#e8ecf4]',
              !t.isActive ? 'opacity-50' : '',
            ].join(' ')}
          >
            {t.name}
          </button>
        ))}

        {!isLoading && templates.length === 0 && (
          <p className="text-xs text-[#5a6478]">No templates yet</p>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col gap-4">
        {!hasSelection ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[#5a6478]">
              Select a template or create a new one
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-[#5a6478] mb-1 block">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Template name"
                  className="w-full bg-[#0a0c10] border border-[#252b3b] rounded-[8px] px-3 py-2 text-sm text-[#e8ecf4] placeholder-[#5a6478] focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="text-xs text-[#5a6478] mb-1 block">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Hello {{name}}, your order {{orderId}} is ready!"
                  rows={5}
                  className="w-full bg-[#0a0c10] border border-[#252b3b] rounded-[8px] px-3 py-2 text-sm text-[#e8ecf4] placeholder-[#5a6478] focus:outline-none focus:border-[#22c55e] resize-none"
                />
              </div>

              {!isNew && (
                <label className="flex items-center gap-2 text-sm text-[#5a6478] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="accent-[#22c55e]"
                  />
                  Active
                </label>
              )}

              {/* Variables detected */}
              {variables.length > 0 && (
                <div>
                  <p className="text-xs text-[#5a6478] mb-1">Variables detected:</p>
                  <div className="flex flex-wrap gap-1">
                    {variables.map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 bg-[#22c55e]/10 text-[#22c55e] rounded text-xs font-mono"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            {form.content && (
              <div
                data-testid="template-preview"
                className="bg-[#0a0c10] border border-[#252b3b] rounded-[8px] p-3"
              >
                <p className="text-xs text-[#5a6478] mb-1 font-semibold uppercase tracking-wide">
                  Preview
                </p>
                <p className="text-sm text-[#e8ecf4] whitespace-pre-wrap">{preview}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-2">
              <button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending || !form.name}
                className="px-4 py-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white text-sm font-medium rounded-[8px] transition-colors"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>

              {!isNew && selectedId && (
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] text-sm font-medium rounded-[8px] transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default TemplateEditor
