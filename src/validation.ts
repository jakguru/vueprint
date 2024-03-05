import Joi from 'joi'
import type { useI18n } from 'vue-i18n'

type I18nT = ReturnType<typeof useI18n>['t']

export class ErrorWithTranslatedMessage extends Error {}

export const isValidLuhn = (input: string | null) => {
  if (!input) {
    return false
  }
  // Ensure the input is a string and remove any non-digit characters
  const str = String(input).replace(/\D/g, '')

  // Perform Luhn check
  let sum = 0
  let shouldDouble = false
  for (let i = str.length - 1; i >= 0; i--) {
    let digit = parseInt(str.charAt(i), 10)

    if (shouldDouble) {
      if ((digit *= 2) > 9) digit -= 9
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  // Valid if sum is a multiple of 10
  return sum % 10 === 0
}

export function getDeserializedSchema(serialized: string) {
  const description = JSON.parse(serialized)
  return Joi.build(description)
}

export function getJoiValidationErrorI18n(error: Error | undefined, t: I18nT, label = 'the Field') {
  if (!error) {
    return ''
  }
  if (!(error instanceof Joi.ValidationError)) {
    return error.message
  }
  const detail = error.details[0]
  const { type } = detail
  return t(`validation.${type}`, { label })
}
