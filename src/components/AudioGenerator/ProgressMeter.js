import React from 'react'

function ProgressMeter({ progress, label, showLabel = true }) {
    const progressPercent = Math.min(100, Math.max(0, progress))

    return (
        <div style={{ marginBottom: '0.5rem' }}>
            {showLabel && label && (
                <div style={{
                    marginBottom: '0.25rem',
                    fontSize: '0.875rem',
                    color: '#666'
                }}>
                    {label}
                </div>
            )}
            <div style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#e0e0e0',
                borderRadius: '10px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent)',
                    borderRadius: '10px',
                    transition: 'width 0.2s ease-out'
                }} />
            </div>
            {showLabel && (
                <div style={{
                    marginTop: '0.25rem',
                    fontSize: '0.75rem',
                    color: '#999',
                    textAlign: 'right'
                }}>
                    {Math.round(progressPercent)}%
                </div>
            )}
        </div>
    )
}

export default ProgressMeter
