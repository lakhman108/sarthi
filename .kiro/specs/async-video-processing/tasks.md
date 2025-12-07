# Implementation Plan

- [ ] 1. Update Lecture Model Schema
  - Add `processingStatus` field (enum: pending, processing, completed, failed)
  - Add `jobId` field (String)
  - Add `processingError` field (String, optional)
  - Set default value for `processingStatus` to 'pending'
  - _Requirements: 1.2, 2.1_

- [ ] 2. Modify Upload Endpoint for Non-Blocking Response
  - Remove the `await job.finished()` blocking call
  - Create lecture record BEFORE enqueueing job
  - Include `lectureId` in job data
  - Return immediately with `lectureId`, `jobId`, and `processingStatus`
  - _Requirements: 1.1, 1.3, 1.5_

- [ ] 3. Update Bull Queue Worker to Update Lecture Status
  - At job start: Update lecture status to "processing"
  - On success: Update lecture with status "completed" and `videoLink`
  - On failure: Update lecture with status "failed" and error message
  - Pass `lectureId` to worker from job data
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 5.3_

- [ ] 4. Update Lecture Routes to Include Status
  - Modify GET `/api/lectures/:id` to return `processingStatus` and `jobId`
  - Modify GET `/api/lectures/course/:courseId` to include status fields
  - _Requirements: 2.1, 3.1_

- [ ] 5. Update Frontend to Handle Async Processing
  - Close modal immediately after upload response
  - Display lecture with "Processing..." badge when status is pending/processing
  - Disable video playback for pending/processing lectures
  - Enable playback when status is completed
  - Show error message when status is failed
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 6. Add Basic Error Handling
  - Log errors when job fails
  - Ensure lecture status is updated on all error paths
  - _Requirements: 6.1, 6.2_

- [ ] 7. Test End-to-End Flow
  - Upload a video and verify immediate response
  - Check lecture is created with pending status
  - Wait for processing to complete
  - Verify lecture status updates to completed
  - Verify video is playable
  - _Requirements: All_
