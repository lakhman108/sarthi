# Requirements Document

## Introduction

This document specifies requirements for implementing asynchronous video processing in the Sarthi learning management system. Currently, video uploads block the user interface until processing completes, which can take several minutes for large videos. This feature will enable non-blocking video uploads with background processing, status tracking, and optimistic UI updates.

## Glossary

- **System**: The Sarthi backend video processing service
- **User**: A teacher uploading video content for lectures
- **Video_Processing_Job**: A background task that transcodes video into multiple HLS resolutions
- **Lecture**: A database entity representing a single video lesson within a course
- **Processing_Status**: An enumeration indicating the current state of video processing (pending, processing, completed, failed)
- **Job_ID**: A unique identifier for tracking a specific video processing task
- **Master_Playlist**: An HLS m3u8 file that references multiple video quality streams
- **Bull_Queue**: The Redis-backed job queue system for managing video processing tasks

## Requirements

### Requirement 1

**User Story:** As a teacher, I want to upload a video and immediately continue working, so that I don't have to wait for video processing to complete.

#### Acceptance Criteria

1. WHEN a user uploads a video file THEN the System SHALL return a response within 2 seconds containing the Job_ID and initial Processing_Status
2. WHEN the upload endpoint receives a video THEN the System SHALL create a Lecture record with Processing_Status set to "pending"
3. WHEN the upload response is sent THEN the System SHALL enqueue the Video_Processing_Job to the Bull_Queue without blocking
4. WHEN a Lecture is created with pending status THEN the System SHALL include the Job_ID in the Lecture record
5. WHEN the upload completes THEN the System SHALL return the Lecture ID, Job_ID, and Processing_Status to the frontend

### Requirement 2

**User Story:** As a teacher, I want to see the processing status of my uploaded videos, so that I know when they are ready for students to view.

#### Acceptance Criteria

1. WHEN a user requests lecture details THEN the System SHALL include the current Processing_Status in the response
2. WHEN a Video_Processing_Job completes successfully THEN the System SHALL update the Lecture Processing_Status to "completed"
3. WHEN a Video_Processing_Job fails THEN the System SHALL update the Lecture Processing_Status to "failed"
4. WHEN the Processing_Status is "completed" THEN the System SHALL include the Master_Playlist URL in the Lecture videoLink field
5. WHEN the Processing_Status is "failed" THEN the System SHALL include an error message in the Lecture record

### Requirement 3

**User Story:** As a teacher, I want to check the status of video processing, so that I can see if it's done.

#### Acceptance Criteria

1. WHEN a user requests lecture details THEN the System SHALL include the Processing_Status in the response
2. WHEN a Video_Processing_Job completes THEN the System SHALL include the Master_Playlist URL in the lecture

### Requirement 4

**User Story:** As a student, I want to see which videos are still processing, so that I know which lectures are not yet available to watch.

#### Acceptance Criteria

1. WHEN a student views a course's lecture list THEN the System SHALL display Processing_Status for each Lecture
2. WHEN a Lecture has Processing_Status "pending" or "processing" THEN the System SHALL prevent video playback
3. WHEN a Lecture has Processing_Status "completed" THEN the System SHALL enable video playback with the Master_Playlist URL
4. WHEN a Lecture has Processing_Status "failed" THEN the System SHALL display an error message to the user

### Requirement 5

**User Story:** As a system administrator, I want video processing to happen in the background, so that the system can handle multiple uploads concurrently without blocking.

#### Acceptance Criteria

1. WHEN the Bull_Queue processes a Video_Processing_Job THEN the System SHALL execute video transcoding asynchronously
2. WHEN video transcoding completes THEN the System SHALL upload the processed files to MinIO storage
3. WHEN MinIO upload completes THEN the System SHALL update the Lecture record with the Master_Playlist URL and set Processing_Status to "completed"
4. WHEN any processing step fails THEN the System SHALL update the Lecture Processing_Status to "failed" and log the error details
5. WHEN local files are uploaded to MinIO THEN the System SHALL delete the local temporary files

### Requirement 6

**User Story:** As a developer, I want basic error handling for video processing, so that failures are tracked.

#### Acceptance Criteria

1. WHEN a Video_Processing_Job fails THEN the System SHALL mark the Lecture Processing_Status as "failed"
2. WHEN a Video_Processing_Job fails THEN the System SHALL log the error message
