'use client'

interface EditableCardProps {
  children: React.ReactNode       // the display content (coaching view UI)
  editContent: React.ReactNode    // the edit fields shown when open
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  isSaving?: boolean
  savedOk?: boolean
  onSave: () => void
}

export default function EditableCard({
  children,
  editContent,
  isOpen,
  onOpen,
  onClose,
  isSaving,
  savedOk,
  onSave,
}: EditableCardProps) {
  return (
    <div
      className={`relative rounded-xl transition-all ${
        isOpen ? 'ring-1 ring-[#c6180e]/50' : 'cursor-pointer hover:ring-1 hover:ring-white/10'
      }`}
      onClick={!isOpen ? onOpen : undefined}
    >
      {/* Pencil icon */}
      <button
        onClick={(e) => { e.stopPropagation(); isOpen ? onClose() : onOpen() }}
        className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white/40 hover:text-white/80 hover:bg-black/60 transition-all text-sm"
        aria-label={isOpen ? 'Lukk redigering' : 'Rediger'}
      >
        {isOpen ? '×' : '✏️'}
      </button>

      {/* Display content */}
      <div className={isOpen ? 'opacity-60' : ''}>{children}</div>

      {/* Edit panel */}
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-white/10 px-4 pb-4 space-y-3">
          {editContent}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="bg-[#c6180e] hover:bg-[#a8140c] disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            >
              {isSaving ? 'Lagrer…' : 'Lagre'}
            </button>
            <button
              onClick={onClose}
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Avbryt
            </button>
            {savedOk && (
              <span className="text-xs text-green-400 animate-pulse">Lagret ✓</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
