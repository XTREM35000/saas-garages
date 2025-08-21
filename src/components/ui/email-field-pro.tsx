import React, { useEffect, useId, useMemo, useState } from 'react'
import { Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { Label } from './label'

type DomainOption = { label: string; value: string }

const DOMAIN_OPTIONS: DomainOption[] = [
	{ label: 'Gmail', value: 'gmail.com' },
	{ label: 'Hotmail', value: 'hotmail.com' },
	{ label: 'Outlook', value: 'outlook.com' },
	{ label: 'Yahoo', value: 'yahoo.com' },
	{ label: 'Garage Multi', value: 'multigarage.com' },
]

export interface EmailFieldProProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
	label?: string
	value: string
	onChange: (value: string) => void
	error?: string
	disabled?: boolean
	required?: boolean
	className?: string
	onValidationChange?: (valid: boolean) => void
}

export const EmailFieldPro: React.FC<EmailFieldProProps> = ({
	label = 'Email',
	value,
	onChange,
	error,
	disabled,
	required,
	className,
	onValidationChange,
	...rest
}) => {
	const fieldId = useId()
	const errorId = `${fieldId}-error`

	const [localPart, setLocalPart] = useState('')
	const [domain, setDomain] = useState<string>(DOMAIN_OPTIONS[0].value)
	const [internalError, setInternalError] = useState<string>('')

	useEffect(() => {
		if (!value) {
			setLocalPart('')
			return
		}
		const [loc, dom] = value.split('@')
		setLocalPart(loc || '')
		if (dom) setDomain(dom)
	}, [value])

	const fullValue = useMemo(() => (localPart && domain ? `${localPart}@${domain}` : ''), [localPart, domain])

	useEffect(() => {
		const isValid = !required || (required && validateEmail(fullValue))
		onValidationChange?.(isValid)
	}, [fullValue, required, onValidationChange])

	const validateEmail = (email: string) => {
		if (!email) {
			setInternalError(required ? 'Email requis' : '')
			return !required
		}
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		const ok = re.test(email)
		setInternalError(ok ? '' : 'Format email invalide')
		return ok
	}

	const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const sanitized = e.target.value.replace(/@/g, '')
		setLocalPart(sanitized)
		onChange(sanitized ? `${sanitized}@${domain}` : '')
	}

	const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newDom = e.target.value
		setDomain(newDom)
		onChange(localPart ? `${localPart}@${newDom}` : '')
	}

	return (
		<div className="space-y-2">
			{label && (
				<Label htmlFor={fieldId} className="flex items-center gap-2 text-sm font-medium">
					<Mail className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
					<span>{label}</span>
				</Label>
			)}

			<div className="flex items-center gap-2">
				<Input
					{...rest}
					type="text"
					id={fieldId}
					value={localPart}
					onChange={handleLocalChange}
					disabled={disabled}
					aria-invalid={Boolean(error || internalError)}
					aria-describedby={error || internalError ? errorId : undefined}
					placeholder="nom.utilisateur"
					className={cn('flex-1', (error || internalError) && 'border-red-500 focus-visible:ring-red-500', className)}
				/>
				<span aria-hidden="true">@</span>
				<select
					value={domain}
					onChange={handleDomainChange}
					disabled={disabled}
					className={cn('h-10 rounded-md border bg-background px-3 text-sm', error || internalError ? 'border-red-500' : 'border-input')}
					aria-label="Domaine"
				>
					{DOMAIN_OPTIONS.map(opt => (
						<option key={opt.value} value={opt.value}>{opt.label}</option>
					))}
				</select>
			</div>

			{(error || internalError) && (
				<p id={errorId} className="text-xs text-red-500">{error || internalError}</p>
			)}
		</div>
	)
}

export default EmailFieldPro


