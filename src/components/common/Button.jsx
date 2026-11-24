import React from 'react'

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : null}
      {children}
    </button>
  )
}

export default Button
