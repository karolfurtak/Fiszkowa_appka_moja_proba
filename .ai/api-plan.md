# REST API Plan for 10xCards

## 1. Resources

The API is built on Supabase, which provides automatic REST endpoints for database tables. This plan defines both the standard Supabase REST endpoints and custom Edge Functions for business logic.

### Core Resources

- **profiles** - Maps to `public.profiles` table
  - Stores public user profile information
  - Linked to Supabase Auth `auth.users` table

- **decks** - Maps to `public.decks` table
  - Collections of flashcards belonging to a user
  - One-to-many relationship with flashcards

- **flashcards** - Maps to `public.flashcards` table
  - Individual flashcards within a deck
  - Contains question, answers, learning metadata, and spaced repetition data
  - Only accepted flashcards (converted from proposals)

- **flashcard_proposals** - Maps to `public.flashcard_proposals` table
  - Temporary AI-generated flashcard proposals awaiting user verification
  - Can be accepted (converted to flashcards) or rejected
  - Grouped by generation_session_id for batch operations

### Custom Business Logic Endpoints

- **AI Generation** - Edge Function for generating flashcards from text
- **Spaced Repetition** - Edge Function for processing quiz results and updating intervals
- **Flashcard Management** - Edge Functions for bulk operations and status changes

## 2. Endpoints

### Authentication Endpoints

Supabase Auth handles authentication. These endpoints are provided by Supabase Auth API:

#### Register User
- **Method:** `POST`
- **Path:** `/auth/v1/signup`
- **Description:** Register a new user with email and password
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "data": {
      "username": "johndoe"
    }
  }
  ```
- **Response (200):**
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token",
      "expires_in": 3600
    }
  }
  ```
- **Error Responses:**
  - `400` - Invalid email format or password too weak
  - `422` - Email already registered

#### Login User
- **Method:** `POST`
- **Path:** `/auth/v1/token?grant_type=password`
- **Description:** Authenticate user and receive session tokens
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200):**
  ```json
  {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  }
  ```
- **Error Responses:**
  - `400` - Invalid credentials
  - `401` - Invalid email or password

#### Logout User
- **Method:** `POST`
- **Path:** `/auth/v1/logout`
- **Description:** Invalidate current session
- **Headers:** `Authorization: Bearer {access_token}`
- **Response (204):** No content
- **Error Responses:**
  - `401` - Invalid or expired token

#### Update Password
- **Method:** `PUT`
- **Path:** `/auth/v1/user`
- **Description:** Update user password
- **Headers:** `Authorization: Bearer {access_token}`
- **Request Body:**
  ```json
  {
    "password": "newpassword123"
  }
  ```
- **Response (200):**
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "updated_at": "2024-01-01T00:00:00Z"
  }
  ```
- **Error Responses:**
  - `400` - Password too weak
  - `401` - Unauthorized

#### Delete Account
- **Method:** `DELETE`
- **Path:** `/auth/v1/admin/users/{user_id}`
- **Description:** Permanently delete user account and all associated data
- **Headers:** `Authorization: Bearer {service_role_key}` (Admin only)
- **Note:** This should be implemented as an Edge Function to handle cascade deletion properly
- **Response (200):**
  ```json
  {
    "message": "User account deleted successfully"
  }
  ```
- **Error Responses:**
  - `401` - Unauthorized
  - `404` - User not found

### Profile Endpoints

#### Get Current User Profile
- **Method:** `GET`
- **Path:** `/rest/v1/profiles?id=eq.{user_id}&select=*`
- **Description:** Retrieve current user's profile
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Query Parameters:**
  - `id` - User ID (from JWT token)
  - `select` - Fields to return (default: `*`)
- **Response (200):**
  ```json
  [
    {
      "id": "uuid",
      "username": "johndoe",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- **Error Responses:**
  - `401` - Unauthorized
  - `404` - Profile not found

#### Update User Profile
- **Method:** `PATCH`
- **Path:** `/rest/v1/profiles?id=eq.{user_id}`
- **Description:** Update user profile (username)
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`, `Prefer: return=representation`
- **Request Body:**
  ```json
  {
    "username": "newusername"
  }
  ```
- **Response (200):**
  ```json
  [
    {
      "id": "uuid",
      "username": "newusername",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-02T00:00:00Z"
    }
  ]
  ```
- **Error Responses:**
  - `400` - Validation error (username already taken)
  - `401` - Unauthorized
  - `404` - Profile not found

### Deck Endpoints

#### List User Decks
- **Method:** `GET`
- **Path:** `/rest/v1/decks?user_id=eq.{user_id}&select=*,flashcards(count)`
- **Description:** Get all decks for the current user with flashcard counts
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Query Parameters:**
  - `user_id` - User ID (from JWT token)
  - `select` - Fields to return, can include related data
  - `order` - Sort order (e.g., `created_at.desc`)
- **Response (200):**
  ```json
  [
    {
      "id": 1,
      "user_id": "uuid",
      "name": "Biology Basics",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "flashcards": [
        {
          "count": 25
        }
      ]
    }
  ]
  ```
- **Error Responses:**
  - `401` - Unauthorized

#### Get Deck with Due Count
- **Method:** `GET`
- **Path:** `/rest/v1/decks?id=eq.{deck_id}&select=*,flashcards(count)`
- **Description:** Get a specific deck with count of flashcards due for review
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Query Parameters:**
  - `id` - Deck ID
  - `select` - Fields to return
- **Response (200):**
  ```json
  [
    {
      "id": 1,
      "user_id": "uuid",
      "name": "Biology Basics",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "flashcards": [
        {
          "count": 5
        }
      ]
    }
  ]
  ```
- **Error Responses:**
  - `401` - Unauthorized
  - `404` - Deck not found

#### Create Deck
- **Method:** `POST`
- **Path:** `/rest/v1/decks`
- **Description:** Create a new deck
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`, `Prefer: return=representation`
- **Request Body:**
  ```json
  {
    "name": "New Deck Name",
    "user_id": "uuid"
  }
  ```
- **Response (201):**
  ```json
  [
    {
      "id": 1,
      "user_id": "uuid",
      "name": "New Deck Name",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- **Error Responses:**
  - `400` - Validation error (name required)
  - `401` - Unauthorized

#### Update Deck
- **Method:** `PATCH`
- **Path:** `/rest/v1/decks?id=eq.{deck_id}`
- **Description:** Update deck name
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`, `Prefer: return=representation`
- **Request Body:**
  ```json
  {
    "name": "Updated Deck Name"
  }
  ```
- **Response (200):**
  ```json
  [
    {
      "id": 1,
      "user_id": "uuid",
      "name": "Updated Deck Name",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-02T00:00:00Z"
    }
  ]
  ```
- **Error Responses:**
  - `400` - Validation error
  - `401` - Unauthorized
  - `404` - Deck not found

#### Delete Deck
- **Method:** `DELETE`
- **Path:** `/rest/v1/decks?id=eq.{deck_id}`
- **Description:** Delete a deck and all its flashcards (cascade delete)
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Response (204):** No content
- **Error Responses:**
  - `401` - Unauthorized
  - `404` - Deck not found

### Flashcard Endpoints

#### List Flashcards in Deck
- **Method:** `GET`
- **Path:** `/rest/v1/flashcards?deck_id=eq.{deck_id}&select=*&order=created_at.desc`
- **Description:** Get all flashcards in a specific deck
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Query Parameters:**
  - `deck_id` - Deck ID
  - `select` - Fields to return
  - `order` - Sort order
  - `status` - Filter by status (`eq.learning` or `eq.mastered`)
  - `limit` - Limit number of results
  - `offset` - Pagination offset
- **Response (200):**
  ```json
  [
    {
      "id": 1,
      "deck_id": 1,
      "question": "What is the capital of France?",
      "correct_answer": "Paris",
      "image_url": null,
      "status": "learning",
      "due_date": "2024-01-02T00:00:00Z",
      "interval": 1,
      "consecutive_correct_answers": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- **Error Responses:**
  - `401` - Unauthorized
  - `404` - Deck not found

#### Get Flashcards Due for Review
- **Method:** `GET`
- **Path:** `/rest/v1/flashcards?deck_id=eq.{deck_id}&due_date=lte.{current_timestamp}&status=eq.learning&select=*&order=due_date.asc`
- **Description:** Get flashcards that are due for review in a specific deck
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Query Parameters:**
  - `deck_id` - Deck ID
  - `due_date` - Filter by due date (less than or equal to current timestamp)
  - `status` - Filter by status (only `learning` cards)
  - `select` - Fields to return
  - `order` - Sort order
- **Response (200):** Array of flashcard objects
- **Error Responses:**
  - `401` - Unauthorized
  - `404` - Deck not found

#### Get Single Flashcard
- **Method:** `GET`
- **Path:** `/rest/v1/flashcards?id=eq.{flashcard_id}&select=*`
- **Description:** Get a specific flashcard by ID
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Query Parameters:**
  - `id` - Flashcard ID
  - `select` - Fields to return
- **Response (200):**
  ```json
  [
    {
      "id": 1,
      "deck_id": 1,
      "question": "What is the capital of France?",
      "correct_answer": "Paris",
      "image_url": null,
      "status": "learning",
      "due_date": "2024-01-02T00:00:00Z",
      "interval": 1,
      "consecutive_correct_answers": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- **Error Responses:**
  - `401` - Unauthorized
  - `404` - Flashcard not found

#### Create Flashcard
- **Method:** `POST`
- **Path:** `/rest/v1/flashcards`
- **Description:** Create a single flashcard manually
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`, `Prefer: return=representation`
- **Request Body:**
  ```json
  {
    "deck_id": 1,
    "question": "What is photosynthesis?",
    "correct_answer": "The process by which plants convert light energy into chemical energy",
    "image_url": "https://example.com/image.jpg"
  }
  ```
- **Response (201):**
  ```json
  [
    {
      "id": 1,
      "deck_id": 1,
      "question": "What is photosynthesis?",
      "correct_answer": "The process by which plants convert light energy into chemical energy",
      "image_url": "https://example.com/image.jpg",
      "status": "learning",
      "due_date": "2024-01-02T00:00:00Z",
      "interval": 1,
      "consecutive_correct_answers": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- **Error Responses:**
  - `400` - Validation error (missing required fields, invalid URL format)
  - `401` - Unauthorized
  - `404` - Deck not found

#### Create Multiple Flashcards (Bulk Insert)
- **Method:** `POST`
- **Path:** `/rest/v1/flashcards`
- **Description:** Create multiple flashcards at once. Used for manual bulk creation or when accepting proposals (converted from proposals to flashcards). Note: AI-generated proposals are automatically saved to `flashcard_proposals` table and must be accepted before becoming flashcards.
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`, `Prefer: return=representation`
- **Request Body:**
  ```json
  [
    {
      "deck_id": 1,
      "question": "What is photosynthesis?",
      "correct_answer": "The process by which plants convert light energy into chemical energy",
      "image_url": null
    },
    {
      "deck_id": 1,
      "question": "What is the primary pigment in photosynthesis?",
      "correct_answer": "Chlorophyll",
      "image_url": "https://example.com/chlorophyll.jpg"
    },
    {
      "deck_id": 1,
      "question": "Where does photosynthesis occur?",
      "correct_answer": "In the chloroplasts",
      "image_url": null
    }
  ]
  ```
- **Response (201):**
  ```json
  [
    {
      "id": 1,
      "deck_id": 1,
      "question": "What is photosynthesis?",
      "correct_answer": "The process by which plants convert light energy into chemical energy",
      "image_url": null,
      "status": "learning",
      "due_date": "2024-01-02T00:00:00Z",
      "interval": 1,
      "consecutive_correct_answers": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "deck_id": 1,
      "question": "What is the primary pigment in photosynthesis?",
      "correct_answer": "Chlorophyll",
      "image_url": "https://example.com/chlorophyll.jpg",
      "status": "learning",
      "due_date": "2024-01-02T00:00:00Z",
      "interval": 1,
      "consecutive_correct_answers": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": 3,
      "deck_id": 1,
      "question": "Where does photosynthesis occur?",
      "correct_answer": "In the chloroplasts",
      "image_url": null,
      "status": "learning",
      "due_date": "2024-01-02T00:00:00Z",
      "interval": 1,
      "consecutive_correct_answers": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- **Notes:**
  - All flashcards in the array must belong to the same deck (or all can have different deck_ids if user owns all decks)
  - Each flashcard is validated independently
  - Partial success: If some flashcards fail validation, successfully created flashcards are returned with error details for failed ones
  - Default values are applied: `status='learning'`, `interval=1`, `due_date=now()`, `consecutive_correct_answers=0`
  - Used for manual flashcard creation or when accepting proposals (proposals are converted to flashcards via `accept-proposal` endpoints)
  - AI-generated proposals are stored in `flashcard_proposals` table and must be accepted before becoming flashcards
- **Error Responses:**
  - `400` - Validation error (one or more flashcards have invalid data)
  - `401` - Unauthorized
  - `404` - One or more decks not found
  - `207` - Multi-status (partial success - some flashcards created, some failed)

#### Update Flashcard
- **Method:** `PATCH`
- **Path:** `/rest/v1/flashcards?id=eq.{flashcard_id}`
- **Description:** Update flashcard content or metadata
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`, `Prefer: return=representation`
- **Request Body:**
  ```json
  {
    "question": "Updated question?",
    "correct_answer": "Updated answer",
    "image_url": "https://example.com/new-image.jpg"
  }
  ```
- **Response (200):** Updated flashcard object
- **Error Responses:**
  - `400` - Validation error
  - `401` - Unauthorized
  - `404` - Flashcard not found

#### Delete Flashcard
- **Method:** `DELETE`
- **Path:** `/rest/v1/flashcards?id=eq.{flashcard_id}`
- **Description:** Delete a flashcard
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Response (204):** No content
- **Error Responses:**
  - `401` - Unauthorized
  - `404` - Flashcard not found

#### Get Mastered Flashcards
- **Method:** `GET`
- **Path:** `/rest/v1/flashcards?status=eq.mastered&deck_id=eq.{deck_id}&select=*&order=created_at.desc`
- **Description:** Get all mastered flashcards for a deck
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Query Parameters:**
  - `status` - Filter by status (`eq.mastered`)
  - `deck_id` - Optional deck ID filter
  - `select` - Fields to return
  - `order` - Sort order
- **Response (200):** Array of mastered flashcard objects
- **Error Responses:**
  - `401` - Unauthorized

### Flashcard Proposal Endpoints

#### List User Proposals
- **Method:** `GET`
- **Path:** `/rest/v1/flashcard_proposals?user_id=eq.{user_id}&select=*&order=created_at.desc`
- **Description:** Get all flashcard proposals for the current user
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Query Parameters:**
  - `user_id` - User ID (from JWT token)
  - `status` - Filter by status (`eq.pending`, `eq.accepted`, `eq.rejected`)
  - `generation_session_id` - Filter by generation session ID
  - `select` - Fields to return
  - `order` - Sort order
  - `limit` - Limit number of results
  - `offset` - Pagination offset
- **Response (200):**
  ```json
  [
    {
      "id": 1,
      "user_id": "uuid",
      "question": "What is photosynthesis?",
      "correct_answer": "The process by which plants convert light energy into chemical energy",
      "image_url": null,
      "domain": "Biology",
      "generation_session_id": "session-123",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- **Error Responses:**
  - `401` - Unauthorized

#### Get Proposals by Session
- **Method:** `GET`
- **Path:** `/rest/v1/flashcard_proposals?generation_session_id=eq.{session_id}&status=eq.pending&select=*&order=created_at.asc`
- **Description:** Get all pending proposals from a specific generation session
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Query Parameters:**
  - `generation_session_id` - Generation session ID
  - `status` - Filter by status (typically `eq.pending`)
  - `select` - Fields to return
  - `order` - Sort order
- **Response (200):** Array of proposal objects
- **Error Responses:**
  - `401` - Unauthorized

#### Get Single Proposal
- **Method:** `GET`
- **Path:** `/rest/v1/flashcard_proposals?id=eq.{proposal_id}&select=*`
- **Description:** Get a specific proposal by ID
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Query Parameters:**
  - `id` - Proposal ID
  - `select` - Fields to return
- **Response (200):**
  ```json
  [
    {
      "id": 1,
      "user_id": "uuid",
      "question": "What is photosynthesis?",
      "correct_answer": "The process by which plants convert light energy into chemical energy",
      "image_url": null,
      "domain": "Biology",
      "generation_session_id": "session-123",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```
- **Error Responses:**
  - `401` - Unauthorized
  - `404` - Proposal not found

#### Update Proposal
- **Method:** `PATCH`
- **Path:** `/rest/v1/flashcard_proposals?id=eq.{proposal_id}`
- **Description:** Update proposal content (question, answer, domain, image_url) or status
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`, `Prefer: return=representation`
- **Request Body:**
  ```json
  {
    "question": "Updated question text...",
    "correct_answer": "Updated answer",
    "domain": "Updated Domain",
    "image_url": "https://example.com/image.jpg"
  }
  ```
- **Response (200):** Updated proposal object
- **Error Responses:**
  - `400` - Validation error
  - `401` - Unauthorized
  - `404` - Proposal not found

#### Delete Proposal
- **Method:** `DELETE`
- **Path:** `/rest/v1/flashcard_proposals?id=eq.{proposal_id}`
- **Description:** Delete a proposal (reject it)
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Response (204):** No content
- **Error Responses:**
  - `401` - Unauthorized
  - `404` - Proposal not found

### Proposal Management Endpoints (Edge Functions)

#### Accept Proposal (Convert to Flashcard)
- **Method:** `POST`
- **Path:** `/functions/v1/accept-proposal`
- **Description:** Accept a proposal and convert it to a flashcard in the specified deck
- **Headers:** `Authorization: Bearer {access_token}`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "proposal_id": 1,
    "deck_id": 1
  }
  ```
- **Response (200):**
  ```json
  {
    "proposal_id": 1,
    "flashcard_id": 10,
    "deck_id": 1,
    "status": "accepted",
    "message": "Proposal accepted and converted to flashcard"
  }
  ```
- **Notes:**
  - Updates proposal status to `'accepted'`
  - Creates a new flashcard in the specified deck
  - Flashcard gets default values: `status='learning'`, `interval=1`, `due_date=now()`
- **Error Responses:**
  - `400` - Invalid request (proposal already accepted/rejected, deck not found)
  - `401` - Unauthorized
  - `404` - Proposal not found

#### Reject Proposal
- **Method:** `POST`
- **Path:** `/functions/v1/reject-proposal`
- **Description:** Reject a proposal (mark as rejected, optionally delete)
- **Headers:** `Authorization: Bearer {access_token}`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "proposal_id": 1,
    "delete": false
  }
  ```
- **Response (200):**
  ```json
  {
    "proposal_id": 1,
    "status": "rejected",
    "message": "Proposal rejected"
  }
  ```
- **Notes:**
  - If `delete=true`, the proposal is permanently deleted
  - If `delete=false`, the proposal status is set to `'rejected'` and kept for reference
- **Error Responses:**
  - `400` - Invalid request
  - `401` - Unauthorized
  - `404` - Proposal not found

#### Accept Multiple Proposals (Bulk Accept)
- **Method:** `POST`
- **Path:** `/functions/v1/accept-proposals`
- **Description:** Accept multiple proposals and convert them to flashcards in the specified deck
- **Headers:** `Authorization: Bearer {access_token}`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "proposal_ids": [1, 2, 3],
    "deck_id": 1
  }
  ```
- **Response (200):**
  ```json
  {
    "accepted_count": 3,
    "flashcard_ids": [10, 11, 12],
    "deck_id": 1,
    "results": [
      {
        "proposal_id": 1,
        "flashcard_id": 10,
        "status": "accepted"
      },
      {
        "proposal_id": 2,
        "flashcard_id": 11,
        "status": "accepted"
      },
      {
        "proposal_id": 3,
        "flashcard_id": 12,
        "status": "accepted"
      }
    ],
    "message": "Proposals accepted and converted to flashcards"
  }
  ```
- **Notes:**
  - All proposals must belong to the authenticated user
  - All proposals must have status `'pending'`
  - Operation is transactional - if any proposal fails, the entire operation fails
- **Error Responses:**
  - `400` - Validation error (one or more proposals invalid, already accepted/rejected)
  - `401` - Unauthorized
  - `404` - Deck not found

#### Reject Multiple Proposals (Bulk Reject)
- **Method:** `POST`
- **Path:** `/functions/v1/reject-proposals`
- **Description:** Reject multiple proposals
- **Headers:** `Authorization: Bearer {access_token}`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "proposal_ids": [4, 5, 6],
    "delete": false
  }
  ```
- **Response (200):**
  ```json
  {
    "rejected_count": 3,
    "deleted_count": 0,
    "results": [
      {
        "proposal_id": 4,
        "status": "rejected"
      },
      {
        "proposal_id": 5,
        "status": "rejected"
      },
      {
        "proposal_id": 6,
        "status": "rejected"
      }
    ],
    "message": "Proposals rejected"
  }
  ```
- **Error Responses:**
  - `400` - Invalid request
  - `401` - Unauthorized

#### Accept Proposals by Session
- **Method:** `POST`
- **Path:** `/functions/v1/accept-proposals-by-session`
- **Description:** Accept all pending proposals from a specific generation session
- **Headers:** `Authorization: Bearer {access_token}`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "generation_session_id": "session-abc123",
    "deck_id": 1
  }
  ```
- **Response (200):**
  ```json
  {
    "generation_session_id": "session-abc123",
    "accepted_count": 5,
    "flashcard_ids": [10, 11, 12, 13, 14],
    "deck_id": 1,
    "message": "All proposals from session accepted"
  }
  ```
- **Error Responses:**
  - `400` - Invalid request
  - `401` - Unauthorized
  - `404` - Deck not found or no pending proposals found

### AI Generation Endpoints (Edge Functions)

#### Generate Flashcards from Text
- **Method:** `POST`
- **Path:** `/functions/v1/generate-flashcards`
- **Description:** Generate flashcard proposals from pasted text using AI. Proposals are saved to `flashcard_proposals` table with status `pending` and can be reviewed before acceptance.
- **Headers:** `Authorization: Bearer {access_token}`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "text": "Photosynthesis is the process by which plants convert light energy into chemical energy...",
    "domain": "Biology"
  }
  ```
- **Response (200):**
  ```json
  {
    "generation_session_id": "session-abc123",
    "proposals": [
      {
        "id": 1,
        "question": "What is photosynthesis?",
        "correct_answer": "The process by which plants convert light energy into chemical energy",
        "domain": "Biology",
        "status": "pending"
      }
    ],
    "detected_domain": "Biology",
    "total_generated": 5
  }
  ```
- **Notes:**
  - All generated proposals are automatically saved to `flashcard_proposals` table with `status='pending'`
  - A unique `generation_session_id` is generated and assigned to all proposals from this generation
  - User can review proposals and accept/reject them individually or in bulk
  - Proposals are not yet assigned to any deck until accepted
- **Error Responses:**
  - `400` - Invalid request (text too short, missing text)
  - `401` - Unauthorized
  - `500` - AI service error


### Spaced Repetition Endpoints (Edge Functions)

#### Submit Quiz Answer
- **Method:** `POST`
- **Path:** `/functions/v1/submit-quiz-answer`
- **Description:** Process a quiz answer and update spaced repetition data
- **Headers:** `Authorization: Bearer {access_token}`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "flashcard_id": 1,
    "is_correct": true
  }
  ```
- **Response (200):**
  ```json
  {
    "flashcard_id": 1,
    "is_correct": true,
    "updated_interval": 2,
    "consecutive_correct_answers": 1,
    "new_due_date": "2024-01-03T00:00:00Z",
    "status": "learning",
    "message": "Answer processed successfully"
  }
  ```
- **Error Responses:**
  - `400` - Invalid request
  - `401` - Unauthorized
  - `404` - Flashcard not found

#### Process Quiz Session
- **Method:** `POST`
- **Path:** `/functions/v1/process-quiz-session`
- **Description:** Process multiple quiz answers from a training session
- **Headers:** `Authorization: Bearer {access_token}`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "answers": [
      {
        "flashcard_id": 1,
        "is_correct": true
      },
      {
        "flashcard_id": 2,
        "is_correct": false
      }
    ]
  }
  ```
- **Response (200):**
  ```json
  {
    "total_answered": 2,
    "correct_count": 1,
    "incorrect_count": 1,
    "updated_flashcards": [
      {
        "flashcard_id": 1,
        "new_status": "learning",
        "new_interval": 2,
        "consecutive_correct_answers": 1
      },
      {
        "flashcard_id": 2,
        "new_status": "learning",
        "new_interval": 1,
        "consecutive_correct_answers": 0
      }
    ],
    "mastered_count": 0
  }
  ```
- **Error Responses:**
  - `400` - Invalid request
  - `401` - Unauthorized

#### Restore Mastered Flashcard
- **Method:** `POST`
- **Path:** `/functions/v1/restore-flashcard`
- **Description:** Restore a mastered flashcard back to learning status
- **Headers:** `Authorization: Bearer {access_token}`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "flashcard_id": 1
  }
  ```
- **Response (200):**
  ```json
  {
    "flashcard_id": 1,
    "status": "learning",
    "interval": 1,
    "consecutive_correct_answers": 0,
    "due_date": "2024-01-02T00:00:00Z",
    "message": "Flashcard restored to learning status"
  }
  ```
- **Error Responses:**
  - `400` - Invalid request
  - `401` - Unauthorized
  - `404` - Flashcard not found

### Bulk Operations Endpoints (Edge Functions)

## 3. Authentication and Authorization

### Authentication Mechanism

The API uses **Supabase Auth** for authentication, which provides:

- JWT-based authentication
- Email/password authentication (as per PRD F-001)
- Session management with access and refresh tokens
- Automatic token refresh

### Authorization

**Row Level Security (RLS)** is enforced at the database level for all tables:

- **Profiles**: Users can only view and update their own profile (`auth.uid() = id`)
- **Decks**: Users can only access decks they own (`auth.uid() = user_id`)
- **Flashcards**: Users can only access flashcards in decks they own (via EXISTS subquery checking deck ownership)
- **Flashcard Proposals**: Users can only access proposals they own (`auth.uid() = user_id`)

### Request Headers

All authenticated requests must include:

```
Authorization: Bearer {access_token}
apikey: {anon_key}
```

For Edge Functions:

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Token Management

- Access tokens expire after 1 hour (default Supabase setting)
- Refresh tokens are used to obtain new access tokens
- Tokens are automatically validated by Supabase middleware
- Invalid or expired tokens return `401 Unauthorized`

### Naming Convention

The API follows a consistent naming convention for all request and response fields:

- **Fields with underscores**: Use `snake_case` (e.g., `proposal_id`, `deck_id`, `flashcard_id`, `user_id`, `generation_session_id`, `correct_answer`, `is_correct`, `created_at`, `updated_at`)
- **Simple single-word fields**: Remain unchanged (e.g., `text`, `domain`, `email`, `password`, `username`, `name`, `status`, `id`)

This convention ensures:
- Consistency with the database schema (PostgreSQL uses snake_case)
- Consistency between request and response payloads
- Alignment with Supabase REST API conventions
- No need for field name transformations between layers

**Examples:**
- Request: `{ "proposal_id": 1, "deck_id": 2, "text": "..." }`
- Response: `{ "generation_session_id": "abc123", "correct_answer": "...", "total_generated": 5 }`

## 4. Validation and Business Logic

### Validation Rules

#### Profile Validation
- `username`: Required, unique, max length 50 characters
- `id`: Must match authenticated user's ID (enforced by RLS)

#### Deck Validation
- `name`: Required, max length 200 characters
- `user_id`: Required, must match authenticated user's ID (enforced by RLS)
- `id`: Auto-generated, read-only

#### Flashcard Validation
- `deck_id`: Required, must reference existing deck owned by user
- `question`: Required, min length 1000 characters, max length 10000 characters
  - **Note:** Examples in this documentation use shortened questions for readability. Actual questions must meet the length requirement (1000-10000 characters).
- `correct_answer`: Required, max length 500 characters
- `image_url`: Optional, must be valid URL format (validated by CHECK constraint)
- `status`: Must be `'learning'` or `'mastered'` (ENUM validation)
- `due_date`: Required, must be valid timestamp
- `interval`: Required, must be positive integer, default 1
- `consecutive_correct_answers`: Required, must be non-negative integer, default 0

**Bulk Insert Validation:**
- When creating multiple flashcards via array, each flashcard is validated independently
- All flashcards must belong to decks owned by the authenticated user
- If any flashcard fails validation, the behavior depends on the endpoint:
  - REST API bulk insert: Returns `207 Multi-Status` with details of successful and failed inserts
  - Edge Function `accept-proposals`: Fails entire operation (transactional) and returns `400` with error details

#### Flashcard Proposal Validation
- `user_id`: Required, must match authenticated user's ID (enforced by RLS)
- `question`: Required, min length 1000 characters, max length 10000 characters
  - **Note:** Examples in this documentation use shortened questions for readability. Actual questions must meet the length requirement (1000-10000 characters).
- `correct_answer`: Required, max length 500 characters
- `image_url`: Optional, must be valid URL format (validated by CHECK constraint)
- `domain`: Optional, max length 100 characters
- `generation_session_id`: Optional, used to group proposals from the same generation
- `status`: Must be `'pending'`, `'accepted'`, or `'rejected'` (ENUM validation), default `'pending'`

**Proposal Acceptance Validation:**
- Only proposals with `status='pending'` can be accepted
- Proposals must belong to the authenticated user
- Deck must exist and belong to the authenticated user
- When accepting multiple proposals, all must pass validation or the entire operation fails (transactional)

### Business Logic Implementation

#### Spaced Repetition Algorithm (F-010, F-011)

Implemented in Edge Function `submit-quiz-answer`:

1. **Correct Answer:**
   - Increment `consecutive_correct_answers` by 1
   - If `consecutive_correct_answers >= 30`: Set `status` to `'mastered'`
   - Otherwise: Double the `interval` (or use a simple multiplier)
   - Update `due_date` = current_time + `interval` days

2. **Incorrect Answer:**
   - Reset `consecutive_correct_answers` to 0
   - Reset `interval` to 1
   - Update `due_date` = current_time + 1 day

3. **Automatic Archiving:**
   - When `consecutive_correct_answers` reaches 30, automatically set `status` to `'mastered'`
   - Mastered flashcards are excluded from training sessions but visible in "Mastered" view

#### AI Flashcard Generation (F-002, F-003, F-004)

Implemented in Edge Function `generate-flashcards`:

1. **Text Analysis:**
   - Send text to OpenRouter.ai API with prompt for flashcard generation
   - AI automatically detects domain (F-003)
   - Generate flashcard proposals with question and correct answer only

2. **Proposal Storage:**
   - All generated proposals are automatically saved to `flashcard_proposals` table
   - Each proposal gets `status='pending'` by default
   - All proposals from the same generation get the same `generation_session_id`
   - Proposals are not yet assigned to any deck

3. **Response Format:**
   - Returns `generation_session_id` for grouping proposals
   - Each proposal contains: question, correct answer, domain
   - Return detected domain for user verification (US-010)

4. **Security:**
   - OpenRouter.ai API key stored as Supabase secret
   - Only accessible from Edge Functions (server-side)
   - Never exposed to client

#### Flashcard Verification Workflow (F-005, US-009)

1. **Generation Phase:**
   - User submits text via `generate-flashcards` endpoint
   - AI generates flashcard proposals and saves them to `flashcard_proposals` table with `status='pending'`
   - All proposals from the same generation get the same `generation_session_id`
   - Returns `generation_session_id` and list of proposals with detected domain

2. **Verification Phase:**
   - Frontend queries proposals by `generation_session_id` using `GET /rest/v1/flashcard_proposals`
   - Frontend displays proposals for user review
   - User can accept/reject individual proposals or in bulk
   - User can edit proposal content (question, answer, domain, image_url) via `PATCH /rest/v1/flashcard_proposals`

3. **Acceptance Phase:**
   - User selects deck (new or existing) for accepted proposals
   - For single proposal: Call `accept-proposal` endpoint with `proposal_id` and `deck_id`
   - For multiple proposals: Call `accept-proposals` endpoint with array of `proposal_ids` and `deck_id`
   - For all proposals from session: Call `accept-proposals-by-session` endpoint with `generation_session_id` and `deck_id`
   - Accepted proposals are converted to flashcards in the specified deck
   - Proposal status is updated to `'accepted'`

4. **Rejection Phase:**
   - User can reject proposals individually or in bulk
   - Call `reject-proposal` or `reject-proposals` endpoint
   - Proposals can be marked as `'rejected'` (kept for reference) or permanently deleted

#### Manual Flashcard Creation (F-006, US-013)

1. **User Input:**
   - User provides question, correct answer, optional image URL
   - Can create single flashcard or multiple flashcards at once

2. **Saving:**
   - Single flashcard: Use `POST /rest/v1/flashcards` with single object
   - Multiple flashcards: Use `POST /rest/v1/flashcards` with array of objects (bulk insert)
   - Default values applied: `status='learning'`, `interval=1`, `due_date=now()`, `consecutive_correct_answers=0`
   - All flashcards in bulk insert must pass validation; partial failures return error details

#### Training Session Logic (US-014, US-015, US-016)

1. **Session Start:**
   - Query flashcards with `due_date <= now()` and `status='learning'`
   - Randomize order of flashcards

2. **Answer Processing:**
   - For each answer, call `submit-quiz-answer` or batch process via `process-quiz-session`
   - Update spaced repetition data

3. **Session Summary:**
   - Calculate correct/incorrect counts
   - Return list of incorrectly answered flashcards
   - Update all flashcards in batch

#### Mastered Flashcard Management (US-018)

1. **Viewing Mastered:**
   - Query flashcards with `status='mastered'`
   - Group by deck for display

2. **Restoring:**
   - Call `restore-flashcard` endpoint
   - Reset: `status='learning'`, `interval=1`, `consecutive_correct_answers=0`
   - Set `due_date` to current time

### Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

Common error codes:
- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required or invalid
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (e.g., duplicate username)
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

### Rate Limiting

- Supabase REST API: Default rate limits apply (varies by plan)
- Edge Functions: Recommended rate limiting for AI endpoints to prevent abuse
- Consider implementing per-user rate limits for AI generation endpoints

### Pagination

For list endpoints, use Supabase's built-in pagination:

- `limit` - Number of results per page (default: 20, max: 100)
- `offset` - Number of results to skip
- Response includes total count when available

Example:
```
GET /rest/v1/flashcards?deck_id=eq.1&limit=20&offset=0
```

