// lib/utils/error.ts

export const getMedicalExamErrorMessage = (errorCode: string): string => {
  // Implement specific error messages based on error codes if needed
  switch (errorCode) {
    case "MEDICAL_EXAM_NOT_FOUND":
      return "Medical exam not found.";
    case "CANNOT_MODIFY_AFTER_24_HOURS":
      return "Cannot modify medical exam after 24 hours of creation.";
    default:
      return "An unknown error occurred with medical exam operations.";
  }
};

export const getPrescriptionErrorMessage = (errorCode: string): string => {
  // Implement specific error messages based on error codes if needed
  switch (errorCode) {
    case "PRESCRIPTION_ALREADY_EXISTS":
      return "A prescription already exists for this medical exam.";
    case "MEDICAL_EXAM_NOT_FOUND":
      return "Medical exam not found for prescription.";
    default:
      return "An unknown error occurred with prescription operations.";
  }
};
