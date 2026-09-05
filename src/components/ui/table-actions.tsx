"use client"

import Link from "next/link"

type TableActionLinkProps = {
  href: string
  children: React.ReactNode
}

export function TableActionLink({ href, children }: TableActionLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
    >
      {children}
    </Link>
  )
}

type TableActionButtonProps = {
  onClick: () => void
  children: React.ReactNode
  variant?: "primary" | "danger" | "success"
  disabled?: boolean
}

export function TableActionButton({ onClick, children, variant = "primary", disabled }: TableActionButtonProps) {
  const variants = {
    primary: "text-primary hover:bg-primary/10",
    danger: "text-red-500 hover:bg-red-500/10",
    success: "text-green-500 hover:bg-green-500/10",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${variants[variant]}`}
    >
      {children}
    </button>
  )
}
