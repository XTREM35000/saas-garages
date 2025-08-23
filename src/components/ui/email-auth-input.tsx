import React, { useEffect, useId, useMemo, useState } from 'react'
import { Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { Label } from './label'

export interface EmailAuthInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
	label?: string
	value: string
	onChange: (value: string) => void
	slug?: string
	error?: string
	disabled?: boolean
	required?: boolean
	className?: string
	onValidationChange?: (valid: boolean) => void
}

export const EmailAuthInput: React.FC<EmailAuthInputProps> = ({
	label = 'Email',
	value,
	onChange,
	slug,
	error,
	disabled,
	required,
	className,
	onValidationChange,
	placeholder,
	...rest
}) => {
	const fieldId = useId()
	const errorId = `${fieldId}-error`

	const [localPart, setLocalPart] = useState('')
	const [internalError, setInternalError] = useState<string>('')

	// Construire l'email complet avec le slug
	const fullEmail = useMemo(() => {
		if (!localPart) return ''
		if (slug) {
			return `${localPart}@${slug}.com`
		}
		return localPart
	}, [localPart, slug])

	// Mettre à jour la valeur externe quand l'email complet change
	useEffect(() => {
		onChange(fullEmail)
	}, [fullEmail, onChange])

	// Synchroniser avec la valeur externe
	useEffect(() => {
		if (!value) {
			setLocalPart('')
			return
		}

		if (slug) {
			// Extraire la partie locale depuis l'email complet
			const slugSuffix = `@${slug}.com`
			if (value.endsWith(slugSuffix)) {
				setLocalPart(value.slice(0, -slugSuffix.length))
			} else {
				setLocalPart(value)
			}
		} else {
			setLocalPart(value)
		}
	}, [value, slug])

	// Validation
	useEffect(() => {
		const isValid = !required || (required && validateEmail(fullEmail))
		onValidationChange?.(isValid)
	}, [fullEmail, required, onValidationChange])

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
		const newValue = e.target.value
		// Nettoyer les caractères non autorisés
		const sanitized = newValue.replace(/[@\s]/g, '')
		setLocalPart(sanitized)
	}

	const getPlaceholder = () => {
		if (placeholder) return placeholder
		if (slug) return `prenom.nom`
		return `votre@email.com`
	}

	return (
		<div className="space-y-2">
			{label && (
				<Label htmlFor={fieldId} className="flex items-center gap-2 text-sm font-medium">
					<Mail className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
					<span>{label}</span>
				</Label>
			)}

			<div className="relative">
				<Input
					{...rest}
					type="text"
					id={fieldId}
					value={localPart}
					onChange={handleLocalChange}
					disabled={disabled}
					aria-invalid={Boolean(error || internalError)}
					aria-describedby={error || internalError ? errorId : undefined}
					placeholder={getPlaceholder()}
					className={cn(
						'pr-20', // Espace pour le badge
						(error || internalError) && 'border-red-500 focus-visible:ring-red-500',
						className
					)}
				/>
				
				{/* Badge du domaine */}
				{slug && (
					<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
						<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
							@{slug}.com
						</span>
					</div>
				)}
			</div>

			{(error || internalError) && (
				<p id={errorId} className="text-xs text-red-500">
					{error || internalError}
				</p>
			)}
		</div>
	)
}

export default EmailAuthInput
