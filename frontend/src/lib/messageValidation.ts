// Message Validation Utility for OpenMindWell
// Handles input validation, character limits, and user feedback

const MAX_MESSAGE_LENGTH = 500;
const WARNING_THRESHOLD_PERCENT = 80;

export interface MessageValidationResult {
  isValid: boolean;
  error?: string;
  characterCount: number;
  remainingCharacters: number;
  isNearLimit: boolean;
}

/**
 * Validates a chat message for sending
 * @param message - The message text to validate
 * @returns Validation result with error message if invalid
 */
export const validateMessage = (message: string): MessageValidationResult => {
  // Trim whitespace
  const trimmedMessage = message.trim();
  
  // Check if message is empty
  if (!trimmedMessage || trimmedMessage.length === 0) {
    return {
      isValid: false,
      error: 'Message cannot be empty',
      characterCount: 0,
      remainingCharacters: MAX_MESSAGE_LENGTH,
      isNearLimit: false,
    };
  }
  
  // Check if message exceeds maximum length
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`,
      characterCount: trimmedMessage.length,
      remainingCharacters: 0,
      isNearLimit: true,
    };
  }
  
  // Calculate if near limit
  const isNearLimit = (trimmedMessage.length / MAX_MESSAGE_LENGTH) * 100 >= WARNING_THRESHOLD_PERCENT;
  
  return {
    isValid: true,
    characterCount: trimmedMessage.length,
    remainingCharacters: MAX_MESSAGE_LENGTH - trimmedMessage.length,
    isNearLimit,
  };
};

/**
 * Gets the character count for a message
 * @param message - The message text
 * @returns Character count and remaining characters
 */
export const getMessageStats = (message: string) => {
  const trimmedMessage = message.trim();
  const characterCount = trimmedMessage.length;
  const remainingCharacters = MAX_MESSAGE_LENGTH - characterCount;
  const percentUsed = (characterCount / MAX_MESSAGE_LENGTH) * 100;
  
  return {
    characterCount,
    remainingCharacters,
    percentUsed: Math.round(percentUsed),
    maxLength: MAX_MESSAGE_LENGTH,
    isNearLimit: percentUsed >= WARNING_THRESHOLD_PERCENT,
  };
};

/**
 * Checks if the send button should be disabled
 * @param message - The message text
 * @returns True if button should be disabled
 */
export const isSendButtonDisabled = (message: string): boolean => {
  const trimmedMessage = message.trim();
  return trimmedMessage.length === 0 || trimmedMessage.length > MAX_MESSAGE_LENGTH;
};

/**
 * Gets warning message based on character count
 * @param message - The message text
 * @returns Warning message or empty string
 */
export const getWarningMessage = (message: string): string => {
  const stats = getMessageStats(message);
  
  if (stats.percentUsed >= 95) {
    return `⚠️ Almost at limit: ${stats.remainingCharacters} characters remaining`;
  }
  
  if (stats.isNearLimit) {
    return `📝 ${stats.remainingCharacters} characters remaining`;
  }
  
  return '';
};
