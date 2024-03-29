/**
 * @module @jakguru/vueprint/utilities/validation
 */
import Joi from 'joi'
import type { useI18n } from 'vue-i18n'

type I18nT = ReturnType<typeof useI18n>['t']

/**
 * An error with a translated message
 */
export class ErrorWithTranslatedMessage extends Error {}

/**
 * Check if a string is a valid Luhn number
 * @param input The input to check
 * @returns A boolean indicating whether the input is a valid Luhn number
 */
export const isValidLuhn = (input: unknown) => {
  if (!isGoodString(input)) {
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

/**
 * Create a Joi schema from a serialized Joi schema
 * @param serialized The serialized Joi schema
 * @returns A Joi schema
 */
export function getDeserializedSchema(serialized: string) {
  const description = JSON.parse(serialized)
  return Joi.build(description)
}

/**
 * Get the translated error message for a Joi validation error
 * @param error The error to translate
 * @param t The translation function
 * @param label The label of the field being validated
 * @returns The translated error message
 */
export function getJoiValidationErrorI18n(
  error: Error | undefined,
  t: I18nT,
  label = 'the Field'
): string {
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

/**
 * Check if a variable is a string which is not empty
 * @param string The variable which should be tested
 * @returns {boolean} Whether the string is a good string
 */
export const isGoodString = (string: unknown) => {
  return typeof string === 'string' && string.trim().length > 0
}
