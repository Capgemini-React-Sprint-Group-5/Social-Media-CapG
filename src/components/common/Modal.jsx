/**
 * Modal
 * Controlled Bootstrap modal (no JS dependency — pure CSS class toggle).
 * Usage:
 *   const [open, setOpen] = useState(false)
 *   <Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm">
 *     <p>Are you sure?</p>
 *   </Modal>
 */
export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ cursor: 'pointer' }}
      />

      {/* Dialog */}
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
