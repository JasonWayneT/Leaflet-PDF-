# CR-022: Output Delivery & Success Screen

## Description
Implement Epic 8 (Output Delivery), specifically Story 8.1. After the PDF is generated, a native Windows save dialog is presented to the user. The PDF is saved if confirmed, the `lastSaveDirectory` is updated in the settings store, and the user is shown a Success Screen with an "Open File" and "Process Another" button. If the user cancels the save, they can retry saving from the ProcessingScreen.

## Requirement IDs
- FR-023
- FR-024
- UX-DR6

## Verification
- Test that save dialog appears on `pipeline:complete`.
- Test that cancelling save dialog keeps user on ProcessingScreen and a "Retry Save" option is shown.
- Test that confirming save writes the file and shows SuccessScreen.
- Test that clicking "Open File" opens the saved file in the OS default viewer.
