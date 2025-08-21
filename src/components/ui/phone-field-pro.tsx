import React, { useEffect, useId, useState } from 'react'
import { Label } from './label'
import { Input } from './input'
import { cn } from '@/lib/utils'

type Country = { code: string; name: string; flag: string; prefix: string; format: string }

const COUNTRIES: Country[] = [
	{ code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', prefix: '+225', format: 'XX XX XX XX XX' },
	{ code: 'LB', name: 'Liban', flag: '🇱🇧', prefix: '+961', format: 'X XXX XXX / XX XXX XXX' },
	{ code: 'MA', name: 'Maroc', flag: '🇲🇦', prefix: '+212', format: 'X XX XX XX XX' },
	{ code: 'DZ', name: 'Algérie', flag: '🇩🇿', prefix: '+213', format: 'X XX XX XX XX' },
	{ code: 'ML', name: 'Mali', flag: '🇲🇷', prefix: '+223', format: 'XX XX XX XX' },
	{ code: 'BF', name: 'Burkina', flag: '🇧🇫', prefix: '+226', format: 'XX XX XX XX' },
	{ code: 'GN', name: 'Guinée', flag: '🇬🇳', prefix: '+224', format: 'XX XXX XX XX' },
	{ code: 'TG', name: 'Togo', flag: '🇹🇬', prefix: '+228', format: 'XX XX XX XX' },
	{ code: 'BJ', name: 'Bénin', flag: '🇧🇯', prefix: '+229', format: 'XX XX XX XX' },
	{ code: 'GH', name: 'Ghana', flag: '🇬🇭', prefix: '+233', format: 'XX XXX XXXX' },
	{ code: 'LR', name: 'Libéria', flag: '🇱🇷', prefix: '+231', format: 'XX XXX XXX' },
]

const PATTERNS: Record<string, { regex: RegExp; min: number; max: number }> = {
	'+225': { regex: /^(\+225|00225)?\d{9}$/, min: 12, max: 12 },
	'+961': { regex: /^(\+961|00961)?\d{7,8}$/, min: 7, max: 8 },
	'+212': { regex: /^(\+212|00212)?\d{9}$/, min: 9, max: 9 },
	'+213': { regex: /^(\+213|00213)?\d{9}$/, min: 9, max: 9 },
	'+223': { regex: /^(\+223|00223)?\d{8}$/, min: 8, max: 8 },
	'+226': { regex: /^(\+226|00226)?\d{8}$/, min: 8, max: 8 },
	'+224': { regex: /^(\+224|00224)?\d{9}$/, min: 9, max: 9 },
	'+228': { regex: /^(\+228|00228)?\d{8}$/, min: 8, max: 8 },
	'+229': { regex: /^(\+229|00229)?\d{8}$/, min: 8, max: 8 },
	'+233': { regex: /^(\+233|00233)?\d{9}$/, min: 9, max: 9 },
	'+231': { regex: /^(\+231|00231)?\d{7,8}$/, min: 7, max: 8 },
}

export interface PhoneFieldProProps {
	label?: string
	value: string
	onChange: (value: string) => void
	error?: string
	required?: boolean
	disabled?: boolean
	className?: string
	onValidationChange?: (valid: boolean) => void
}

export const PhoneFieldPro: React.FC<PhoneFieldProProps> = ({
	label = 'Téléphone',
	value,
	onChange,
	error,
	required,
	disabled,
	className,
	onValidationChange,
}) => {
	const fieldId = useId()
	const errorId = `${fieldId}-error`
	const [prefix, setPrefix] = useState(COUNTRIES[0].prefix)
	const [number, setNumber] = useState('')
	const [hint, setHint] = useState<string>('')
	const [status, setStatus] = useState<'info' | 'success' | 'error'>('info')

	useEffect(() => {
		if (value) {
			const match = COUNTRIES.find(c => value.startsWith(c.prefix))
			if (match) {
				setPrefix(match.prefix)
				setNumber(value.slice(match.prefix.length).trim())
			}
		}
	}, [value])

	const validate = (pref: string, num: string) => {
		const clean = num.replace(/\D/g, '')
		if (!required && clean.length === 0) {
			setHint('')
			setStatus('info')
			onValidationChange?.(true)
			onChange(`${pref} ${num}`.trim())
			return
		}
		const rule = PATTERNS[pref]
		const country = COUNTRIES.find(c => c.prefix === pref)!
		if (!rule) {
			setHint('Pays non supporté')
			setStatus('error')
			onValidationChange?.(false)
			return
		}
		if (clean.length < rule.min) {
			setHint(`${country.name}: ${clean.length}/${rule.min} chiffres requis`)
			setStatus('info')
			onValidationChange?.(false)
			return
		}
		if (clean.length > rule.max) {
			setHint(`${country.name}: maximum ${rule.max} chiffres`)
			setStatus('error')
			onValidationChange?.(false)
			return
		}
		if (!rule.regex.test(`${pref}${clean}`)) {
			setHint(`Format invalide pour ${country.name}`)
			setStatus('error')
			onValidationChange?.(false)
			return
		}
		setHint('Numéro valide')
		setStatus('success')
		onValidationChange?.(true)
		onChange(`${pref} ${num}`.trim())
	}

	const handlePrefix = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const p = e.target.value
		setPrefix(p)
		validate(p, number)
	}
	const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
		const n = e.target.value.replace(/[^\d\s]/g, '')
		setNumber(n)
		validate(prefix, n)
	}

	return (
		<div className="space-y-2">
			{label && (
				<Label htmlFor={fieldId} className="text-sm font-medium">
					{label}
				</Label>
			)}
			<div className="flex gap-2">
				<select
					value={prefix}
					onChange={handlePrefix}
					disabled={disabled}
					className={cn('h-10 rounded-md border bg-background px-3 py-2 text-sm w-[220px]', error && 'border-red-500')}
					aria-label="Pays"
				>
					{COUNTRIES.map(c => (
						<option key={c.code} value={c.prefix}>{c.flag} {c.name} ({c.prefix})</option>
					))}
				</select>
				<Input
					id={fieldId}
					type="tel"
					value={number}
					onChange={handleNumber}
					disabled={disabled}
					required={required}
					placeholder={COUNTRIES.find(c => c.prefix === prefix)?.format}
					aria-invalid={Boolean(error || status === 'error')}
					aria-describedby={error || hint ? errorId : undefined}
					className={cn(
						status === 'error' && 'border-red-500 focus:border-red-500',
						status === 'success' && 'border-green-500 focus:border-green-500',
						className,
					)}
				/>
			</div>
			{(hint || error) && (
				<p id={errorId} className={cn('text-xs mt-1', status === 'error' && 'text-red-500', status === 'success' && 'text-green-500', status === 'info' && 'text-blue-500')}>
					{status === 'success' ? '✅ ' : status === 'error' ? '❌ ' : ''}{error || hint}
				</p>
			)}
		</div>
	)
}

export default PhoneFieldPro


