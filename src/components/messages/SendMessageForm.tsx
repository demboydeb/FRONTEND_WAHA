import React, { useState } from 'react'
import { MessageTypePicker } from '@/components/messages/MessageTypePicker'
import { Button } from '@/components/common/Button'
import { useSendMessage } from '@/hooks/useMessages'
import type { MessageType } from '@/types'

interface SendMessageFormProps {
  sessionId: string
  onSuccess?: () => void
}

interface ButtonRow {
  id: string
  text: string
}

interface ListRow {
  id: string
  title: string
}

interface ListSection {
  title: string
  rows: ListRow[]
}

export const SendMessageForm: React.FC<SendMessageFormProps> = ({ sessionId, onSuccess }) => {
  const sendMessage = useSendMessage(sessionId)

  const [messageType, setMessageType] = useState<MessageType>('text')
  const [to, setTo] = useState('')
  const [content, setContent] = useState('')
  const [caption, setCaption] = useState('')

  // contact
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  // poll
  const [pollName, setPollName] = useState('')
  const [pollOptions, setPollOptions] = useState('')
  const [pollSelectableCount, setPollSelectableCount] = useState(1)

  // reaction
  const [reactionEmoji, setReactionEmoji] = useState('')
  const [reactionMessageId, setReactionMessageId] = useState('')

  // reply
  const [quotedMessageId, setQuotedMessageId] = useState('')

  // buttons
  const [footer, setFooter] = useState('')
  const [buttonRows, setButtonRows] = useState<ButtonRow[]>([
    { id: '', text: '' },
    { id: '', text: '' },
    { id: '', text: '' },
  ])

  // list
  const [buttonText, setButtonText] = useState('')
  const [listSections, setListSections] = useState<ListSection[]>([
    { title: '', rows: [{ id: '', title: '' }] },
  ])

  // template
  const [templateButtons, setTemplateButtons] = useState('')

  // forward
  const [forwardRawMessage, setForwardRawMessage] = useState('')

  const resetForm = () => {
    setTo('')
    setContent('')
    setCaption('')
    setContactName('')
    setContactPhone('')
    setPollName('')
    setPollOptions('')
    setPollSelectableCount(1)
    setReactionEmoji('')
    setReactionMessageId('')
    setQuotedMessageId('')
    setFooter('')
    setButtonRows([{ id: '', text: '' }, { id: '', text: '' }, { id: '', text: '' }])
    setButtonText('')
    setListSections([{ title: '', rows: [{ id: '', title: '' }] }])
    setTemplateButtons('')
    setForwardRawMessage('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = { to, type: messageType }

    switch (messageType) {
      case 'text':
        payload.content = content
        break
      case 'image':
      case 'video':
      case 'audio':
      case 'document':
      case 'sticker':
        payload.content = content
        if (caption) payload.caption = caption
        break
      case 'location':
        payload.content = content
        if (caption) payload.caption = caption
        break
      case 'contact':
        payload.contactName = contactName
        payload.contactPhone = contactPhone
        break
      case 'poll':
        payload.pollName = pollName
        payload.pollOptions = pollOptions.split('\n').filter(Boolean)
        payload.pollSelectableCount = pollSelectableCount
        break
      case 'reaction':
        payload.reactionEmoji = reactionEmoji
        payload.reactionMessageId = reactionMessageId
        break
      case 'reply':
        payload.content = content
        payload.quotedMessageId = quotedMessageId
        break
      case 'buttons':
        payload.content = content
        payload.footer = footer
        payload.buttons = buttonRows.filter((b) => b.id || b.text)
        break
      case 'list':
        payload.content = content
        payload.buttonText = buttonText
        payload.sections = listSections
        break
      case 'template':
        payload.content = content
        payload.templateButtons = templateButtons
        break
      case 'forward':
        payload.forwardRawMessage = forwardRawMessage
        break
    }

    sendMessage.mutate(payload, {
      onSuccess: () => {
        resetForm()
        onSuccess?.()
      },
    })
  }

  const inputClass =
    'w-full bg-[#11141b] border border-[#252b3b] rounded-lg px-3 py-2 text-sm text-[#e8ecf4] placeholder-[#5a6478] focus:outline-none focus:border-[#22c55e] transition-colors'

  const labelClass = 'block text-xs font-medium text-[#5a6478] mb-1'

  return (
    <form data-testid="send-message-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <MessageTypePicker value={messageType} onChange={setMessageType} />

      {/* To field */}
      <div>
        <label className={labelClass}>
          To <span className="text-[#ef4444]">*</span>
        </label>
        <input
          type="text"
          required
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="33612345678@s.whatsapp.net"
          className={inputClass}
        />
      </div>

      {/* Dynamic fields */}
      {messageType === 'text' && (
        <div>
          <label className={labelClass}>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Your message..."
            className={inputClass}
          />
        </div>
      )}

      {(messageType === 'image' ||
        messageType === 'video' ||
        messageType === 'audio' ||
        messageType === 'document' ||
        messageType === 'sticker') && (
        <>
          <div>
            <label className={labelClass}>URL</label>
            <input
              type="url"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
          {messageType !== 'audio' && messageType !== 'sticker' && (
            <div>
              <label className={labelClass}>Caption (optional)</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption..."
                className={inputClass}
              />
            </div>
          )}
        </>
      )}

      {messageType === 'location' && (
        <>
          <div>
            <label className={labelClass}>Coordinates (lat,lng)</label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="48.8566,2.3522"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Caption (optional)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Location name..."
              className={inputClass}
            />
          </div>
        </>
      )}

      {messageType === 'contact' && (
        <>
          <div>
            <label className={labelClass}>Contact Name</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="John Doe"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Contact Phone</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+33612345678"
              className={inputClass}
            />
          </div>
        </>
      )}

      {messageType === 'poll' && (
        <>
          <div>
            <label className={labelClass}>Poll Name</label>
            <input
              type="text"
              value={pollName}
              onChange={(e) => setPollName(e.target.value)}
              placeholder="What's your favorite color?"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Options (one per line)</label>
            <textarea
              value={pollOptions}
              onChange={(e) => setPollOptions(e.target.value)}
              rows={4}
              placeholder={"Red\nBlue\nGreen"}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Selectable Count</label>
            <input
              type="number"
              value={pollSelectableCount}
              onChange={(e) => setPollSelectableCount(parseInt(e.target.value) || 1)}
              min={1}
              className={inputClass}
            />
          </div>
        </>
      )}

      {messageType === 'reaction' && (
        <>
          <div>
            <label className={labelClass}>Emoji</label>
            <input
              type="text"
              value={reactionEmoji}
              onChange={(e) => setReactionEmoji(e.target.value)}
              placeholder="👍"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Message ID</label>
            <input
              type="text"
              value={reactionMessageId}
              onChange={(e) => setReactionMessageId(e.target.value)}
              placeholder="msg-id-to-react-to"
              className={inputClass}
            />
          </div>
        </>
      )}

      {messageType === 'reply' && (
        <>
          <div>
            <label className={labelClass}>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Your reply..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Quoted Message ID</label>
            <input
              type="text"
              value={quotedMessageId}
              onChange={(e) => setQuotedMessageId(e.target.value)}
              placeholder="msg-id-to-quote"
              className={inputClass}
            />
          </div>
        </>
      )}

      {messageType === 'buttons' && (
        <>
          <div>
            <label className={labelClass}>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Button message body..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Footer (optional)</label>
            <input
              type="text"
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              placeholder="Footer text..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Buttons</label>
            <div className="flex flex-col gap-2">
              {buttonRows.map((btn, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={btn.id}
                    onChange={(e) => {
                      const updated = [...buttonRows]
                      updated[i] = { ...updated[i], id: e.target.value }
                      setButtonRows(updated)
                    }}
                    placeholder={`Button ${i + 1} ID`}
                    className={`${inputClass} flex-1`}
                  />
                  <input
                    type="text"
                    value={btn.text}
                    onChange={(e) => {
                      const updated = [...buttonRows]
                      updated[i] = { ...updated[i], text: e.target.value }
                      setButtonRows(updated)
                    }}
                    placeholder={`Button ${i + 1} Text`}
                    className={`${inputClass} flex-1`}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {messageType === 'list' && (
        <>
          <div>
            <label className={labelClass}>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="List message body..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Button Text</label>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="See options"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Sections</label>
            {listSections.map((section, si) => (
              <div key={si} className="border border-[#252b3b] rounded-lg p-3 mb-2">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    const updated = [...listSections]
                    updated[si] = { ...updated[si], title: e.target.value }
                    setListSections(updated)
                  }}
                  placeholder="Section title"
                  className={`${inputClass} mb-2`}
                />
                {section.rows.map((row, ri) => (
                  <div key={ri} className="flex gap-2 mb-1">
                    <input
                      type="text"
                      value={row.id}
                      onChange={(e) => {
                        const updated = [...listSections]
                        updated[si].rows[ri] = { ...updated[si].rows[ri], id: e.target.value }
                        setListSections(updated)
                      }}
                      placeholder="Row ID"
                      className={`${inputClass} flex-1`}
                    />
                    <input
                      type="text"
                      value={row.title}
                      onChange={(e) => {
                        const updated = [...listSections]
                        updated[si].rows[ri] = { ...updated[si].rows[ri], title: e.target.value }
                        setListSections(updated)
                      }}
                      placeholder="Row Title"
                      className={`${inputClass} flex-1`}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...listSections]
                    updated[si].rows.push({ id: '', title: '' })
                    setListSections(updated)
                  }}
                  className="text-xs text-[#22c55e] hover:underline mt-1"
                >
                  + Add row
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setListSections([...listSections, { title: '', rows: [{ id: '', title: '' }] }])
              }
              className="text-xs text-[#22c55e] hover:underline"
            >
              + Add section
            </button>
          </div>
        </>
      )}

      {messageType === 'template' && (
        <>
          <div>
            <label className={labelClass}>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Template content..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Template Buttons (JSON)</label>
            <textarea
              value={templateButtons}
              onChange={(e) => setTemplateButtons(e.target.value)}
              rows={3}
              placeholder='[{"type":"QUICK_REPLY","text":"Yes"}]'
              className={inputClass}
            />
          </div>
        </>
      )}

      {messageType === 'forward' && (
        <div>
          <label className={labelClass}>Raw Message (JSON)</label>
          <textarea
            value={forwardRawMessage}
            onChange={(e) => setForwardRawMessage(e.target.value)}
            rows={4}
            placeholder='{"key":{"id":"msg-id"}}'
            className={inputClass}
          />
        </div>
      )}

      <Button
        type="submit"
        loading={sendMessage.isPending}
        disabled={sendMessage.isPending || !to}
      >
        Send Message
      </Button>
    </form>
  )
}

export default SendMessageForm
