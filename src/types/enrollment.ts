// Enrollment source types
export type EnrollmentSource = 
  | 'wallet'           // Enrolled via wallet payment
  | 'invoice'          // Enrolled via invoice payment
  | 'chapter_purchase' // Enrolled via chapter purchase
  | 'enrollment_code'  // Enrolled via enrollment code
  | 'direct'           // Direct enrollment (free courses)
  | 'unknown';         // Unknown source (for existing data)

// Enrollment result interface
export interface EnrollmentResult {
  success: boolean;
  message: string;
  enrollmentId?: string;
  error?: string;
}
