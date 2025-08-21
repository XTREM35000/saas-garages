import React, { useEffect, useId, useMemo, useState } from 'react'
import { Eye, EyeOff, Key } from 'lucide-react'
import { Input } from './input'
import { Label } from './label'
import { cn } from '@/lib/utils'

export interface PasswordFieldProProps {
	label?: string
	value: string
	onChange: (value: string) => void
	error?: string
	required?: boolean
	disabled?: boolean
	className?: string
	onValidationChange?: (valid: boolean) => void
}

const rules = {
	minLength: (v: string) => v.length >= 8,
	upper: (v: string) => /[A-Z]/.test(v),
	lower: (v: string) => /[a-z]/.test(v),
	digit: (v: string) => /\d/.test(v),
	special: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v),
}

export const PasswordFieldPro: React.FC<PasswordFieldProProps> = ({
	label = 'Mot de passe',
	value,
	onChange,
	error,
	required = true,
	disabled,
	className,
	onValidationChange,
}) => {
	const fieldId = useId()
	const errorId = `${fieldId}-error`
	const [show, setShow] = useState(false)

	const checks = useMemo(() => ({
		minLength: rules.minLength(value),
		upper: rules.upper(value),
		lower: rules.lower(value),
		digit: rules.digit(value),
		special: rules.special(value),
	}), [value])

	const score = useMemo(() => Object.values(checks).filter(Boolean).length, [checks])
	const color = score <= 2 ? 'bg-red-500' : score === 3 || score === 4 ? 'bg-orange-500' : 'bg-green-500'

	useEffect(() => {
		const valid = (!required && value.length === 0) || Object.values(checks).every(Boolean)
		onValidationChange?.(valid)
	}, [checks, required, value, onValidationChange])

	return (
		<div className="space-y-2">
			{label && (
				<Label htmlFor={fieldId} className="flex items-center gap-2 text-sm font-medium">
					<Key className="h-4 w-4" aria-hidden="true" />
					<span>{label}</span>
				</Label>
			)}
			<div className="relative">
				<Input
					id={fieldId}
					type={show ? 'text' : 'password'}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					disabled={disabled}
					required={required}
					aria-invalid={Boolean(error)}
					aria-describedby={error ? errorId : undefined}
					className={cn('pr-10', error && 'border-red-500', className)}
				/>
				<button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2">
					{show ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
				</button>
			</div>
			<div className="space-y-2 text-sm">
				<div className="h-1 w-full rounded-full bg-gray-200 overflow-hidden">
					<div className={cn('h-full transition-all', color)} style={{ width: `${(score / 5) * 100}%` }} />
				</div>
				<ul className="space-y-1 text-xs text-gray-500">
					<li className={checks.minLength ? 'text-green-600' : ''}>• Au moins 8 caractères</li>
					<li className={checks.upper ? 'text-green-600' : ''}>• Une majuscule</li>
					<li className={checks.lower ? 'text-green-600' : ''}>• Une minuscule</li>
					<li className={checks.digit ? 'text-green-600' : ''}>• Un chiffre</li>
					<li className={checks.special ? 'text-green-600' : ''}>• Un caractère spécial</li>
				</ul>
			</div>
			{error && <p id={errorId} className="text-xs text-red-500">{error}</p>}
		</div>
	)
}

export default PasswordFieldPro


