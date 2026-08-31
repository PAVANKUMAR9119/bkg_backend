# API Documentation

Base URL:

```text
http://localhost:3000/api
```

All request and response bodies are JSON unless mentioned otherwise.

Authentication uses a JWT bearer token:

```http
Authorization: Bearer <accessToken>
```

Global validation is enabled with whitelist mode, so unknown request body fields are rejected.

## Common Models

### User

```json
{
  "_id": "64f...",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "type": "STUDENT",
  "profileImage": "https://example.com/avatar.jpg",
  "role": "USER",
  "isActive": true,
  "createdAt": "2026-08-31T10:00:00.000Z",
  "updatedAt": "2026-08-31T10:00:00.000Z"
}
```

Allowed `type` values:

```text
STUDENT, TEACHER, AUTHOR
```

Allowed `role` values:

```text
USER, ADMIN
```

### Article

```json
{
  "_id": "64f...",
  "title": "Article title",
  "body": "Article body",
  "image": "https://example.com/image.jpg",
  "author": {
    "_id": "64f...",
    "name": "John Doe",
    "type": "AUTHOR",
    "profileImage": "https://example.com/avatar.jpg"
  },
  "status": "APPROVED",
  "rejectionReason": null,
  "likesCount": 0,
  "commentsCount": 0,
  "createdAt": "2026-08-31T10:00:00.000Z",
  "updatedAt": "2026-08-31T10:00:00.000Z"
}
```

Allowed `status` values:

```text
PENDING, APPROVED, REJECTED
```

### Error Response

NestJS default errors usually follow this shape:

```json
{
  "message": "Invalid email or password",
  "error": "Unauthorized",
  "statusCode": 401
}
```

Validation errors may return `message` as an array of validation messages.

## Health

### GET `/`

Returns a simple app health message.

Auth: Public

Response `200`:

```text
Hello World!
```

## Auth APIs

### POST `/auth/register`

Registers a new user.

Auth: Public

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "secret123",
  "type": "STUDENT",
  "profileImage": "https://example.com/avatar.jpg"
}
```

Fields:

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `name` | string | Yes | Must not be empty |
| `email` | string | Yes | Must be valid email |
| `phone` | string | Yes | Must not be empty |
| `password` | string | Yes | Minimum 6 characters |
| `type` | enum | Yes | `STUDENT`, `TEACHER`, `AUTHOR` |
| `profileImage` | string | No | String URL/path |

Response `201`:

```json
{
  "message": "Registration successful",
  "user": {
    "_id": "64f...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "type": "STUDENT",
    "profileImage": "https://example.com/avatar.jpg",
    "role": "USER",
    "isActive": true,
    "createdAt": "2026-08-31T10:00:00.000Z",
    "updatedAt": "2026-08-31T10:00:00.000Z"
  }
}
```

Errors:

| Status | Reason |
| --- | --- |
| `400` | Validation failed |
| `409` | Email already registered |

### POST `/auth/login`

Logs in an active user and returns a JWT.

Auth: Public

Request body:

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

Fields:

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `email` | string | Yes | Must be valid email |
| `password` | string | Yes | Minimum 6 characters |

Response `201`:

```json
{
  "accessToken": "jwt.token.here",
  "user": {
    "_id": "64f...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "type": "STUDENT",
    "role": "USER",
    "isActive": true
  }
}
```

Errors:

| Status | Reason |
| --- | --- |
| `400` | Validation failed |
| `401` | Invalid email/password or account disabled |

### GET `/auth/me`

Returns the authenticated user.

Auth: Required

Response `200`:

```json
{
  "_id": "64f...",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "type": "STUDENT",
  "role": "USER",
  "isActive": true
}
```

Errors:

| Status | Reason |
| --- | --- |
| `401` | Missing, invalid, or expired token |

## Article APIs

### GET `/articles`

Returns approved articles only, newest first.

Auth: Public

Query parameters:

| Field | Type | Required | Default |
| --- | --- | --- | --- |
| `page` | number | No | `1` |
| `limit` | number | No | `10` |

Example:

```http
GET /api/articles?page=1&limit=10
```

Response `200`:

```json
{
  "articles": [
    {
      "_id": "64f...",
      "title": "Article title",
      "body": "Article body",
      "image": "https://example.com/image.jpg",
      "author": {
        "_id": "64f...",
        "name": "John Doe",
        "type": "AUTHOR",
        "profileImage": "https://example.com/avatar.jpg"
      },
      "status": "APPROVED",
      "likesCount": 3,
      "commentsCount": 2,
      "createdAt": "2026-08-31T10:00:00.000Z",
      "updatedAt": "2026-08-31T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### GET `/articles/:id`

Returns one approved article by ID.

Auth: Public

Path parameters:

| Field | Type | Required |
| --- | --- | --- |
| `id` | MongoDB ObjectId | Yes |

Response `200`:

```json
{
  "_id": "64f...",
  "title": "Article title",
  "body": "Article body",
  "author": {
    "_id": "64f...",
    "name": "John Doe",
    "type": "AUTHOR",
    "profileImage": "https://example.com/avatar.jpg"
  },
  "status": "APPROVED",
  "likesCount": 3,
  "commentsCount": 2
}
```

Errors:

| Status | Reason |
| --- | --- |
| `404` | Article not found or not approved |

### POST `/articles`

Creates a new article. New articles are created with `PENDING` status and must be approved by an admin before appearing in public article APIs.

Auth: Required

Request body:

```json
{
  "title": "Article title",
  "body": "Article body",
  "image": "https://example.com/image.jpg"
}
```

Fields:

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `title` | string | Yes | Must not be empty |
| `body` | string | Yes | Must not be empty |
| `image` | string | No | Optional string URL/path |

Response `201`:

```json
{
  "_id": "64f...",
  "title": "Article title",
  "body": "Article body",
  "image": "https://example.com/image.jpg",
  "author": "64f...",
  "status": "PENDING",
  "likesCount": 0,
  "commentsCount": 0,
  "createdAt": "2026-08-31T10:00:00.000Z",
  "updatedAt": "2026-08-31T10:00:00.000Z"
}
```

Errors:

| Status | Reason |
| --- | --- |
| `400` | Validation failed |
| `401` | Missing, invalid, or expired token |

### GET `/articles/my-articles`

Returns all articles created by the authenticated user, including `PENDING`, `APPROVED`, and `REJECTED`.

Auth: Required

Response `200`:

```json
[
  {
    "_id": "64f...",
    "title": "Article title",
    "body": "Article body",
    "author": "64f...",
    "status": "PENDING",
    "rejectionReason": null,
    "likesCount": 0,
    "commentsCount": 0,
    "createdAt": "2026-08-31T10:00:00.000Z",
    "updatedAt": "2026-08-31T10:00:00.000Z"
  }
]
```

Errors:

| Status | Reason |
| --- | --- |
| `401` | Missing, invalid, or expired token |

## Comment APIs

### GET `/articles/:articleId/comments`

Returns non-deleted comments for an article, newest first.

Auth: Public

Path parameters:

| Field | Type | Required |
| --- | --- | --- |
| `articleId` | MongoDB ObjectId | Yes |

Response `200`:

```json
[
  {
    "_id": "64f...",
    "article": "64f...",
    "user": {
      "_id": "64f...",
      "name": "John Doe",
      "type": "STUDENT",
      "profileImage": "https://example.com/avatar.jpg"
    },
    "content": "Nice article",
    "isDeleted": false,
    "createdAt": "2026-08-31T10:00:00.000Z",
    "updatedAt": "2026-08-31T10:00:00.000Z"
  }
]
```

### POST `/articles/:articleId/comments`

Creates a comment for an article and increments the article `commentsCount`.

Auth: Required

Request body:

```json
{
  "content": "Nice article"
}
```

Fields:

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `content` | string | Yes | Must not be empty, max 2000 characters |

Response `201`:

```json
{
  "_id": "64f...",
  "article": "64f...",
  "user": {
    "_id": "64f...",
    "name": "John Doe",
    "type": "STUDENT",
    "profileImage": "https://example.com/avatar.jpg"
  },
  "content": "Nice article",
  "isDeleted": false,
  "createdAt": "2026-08-31T10:00:00.000Z",
  "updatedAt": "2026-08-31T10:00:00.000Z"
}
```

Errors:

| Status | Reason |
| --- | --- |
| `400` | Validation failed |
| `401` | Missing, invalid, or expired token |

### DELETE `/comments/:id`

Soft-deletes the authenticated user's own comment and decrements the article `commentsCount`.

Auth: Required

Path parameters:

| Field | Type | Required |
| --- | --- | --- |
| `id` | MongoDB ObjectId | Yes |

Response `200`:

```json
{
  "message": "Comment deleted"
}
```

Errors:

| Status | Reason |
| --- | --- |
| `401` | Missing, invalid, or expired token |
| `404` | Comment not found, already deleted, or not owned by the user |

## Like APIs

### POST `/articles/:articleId/like`

Likes an article as the authenticated user and increments `likesCount`.

Auth: Required

Path parameters:

| Field | Type | Required |
| --- | --- | --- |
| `articleId` | MongoDB ObjectId | Yes |

Response `201`:

```json
{
  "message": "Article liked",
  "likesCount": 1
}
```

Errors:

| Status | Reason |
| --- | --- |
| `401` | Missing, invalid, or expired token |
| `409` | Article already liked by this user |

### DELETE `/articles/:articleId/like`

Removes the authenticated user's like from an article and decrements `likesCount`.

Auth: Required

Path parameters:

| Field | Type | Required |
| --- | --- | --- |
| `articleId` | MongoDB ObjectId | Yes |

Response `200`:

```json
{
  "message": "Article unliked",
  "likesCount": 0
}
```

Errors:

| Status | Reason |
| --- | --- |
| `401` | Missing, invalid, or expired token |
| `404` | Like not found |

## Admin APIs

All admin APIs require a valid JWT for a user with `role: "ADMIN"`.

### GET `/admin/articles/pending`

Returns pending articles for moderation, oldest first.

Auth: Admin required

Response `200`:

```json
[
  {
    "_id": "64f...",
    "title": "Article title",
    "body": "Article body",
    "author": {
      "_id": "64f...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "type": "AUTHOR",
      "profileImage": "https://example.com/avatar.jpg"
    },
    "status": "PENDING",
    "likesCount": 0,
    "commentsCount": 0,
    "createdAt": "2026-08-31T10:00:00.000Z",
    "updatedAt": "2026-08-31T10:00:00.000Z"
  }
]
```

Errors:

| Status | Reason |
| --- | --- |
| `401` | Missing, invalid, or expired token |
| `403` | Authenticated user is not an admin |

### PATCH `/admin/articles/:id/approve`

Approves an article. Approved articles become visible in public article APIs.

Auth: Admin required

Path parameters:

| Field | Type | Required |
| --- | --- | --- |
| `id` | MongoDB ObjectId | Yes |

Response `200`:

```json
{
  "_id": "64f...",
  "title": "Article title",
  "body": "Article body",
  "author": "64f...",
  "status": "APPROVED",
  "rejectionReason": null,
  "likesCount": 0,
  "commentsCount": 0
}
```

Errors:

| Status | Reason |
| --- | --- |
| `401` | Missing, invalid, or expired token |
| `403` | Authenticated user is not an admin |
| `404` | Article not found |

### PATCH `/admin/articles/:id/reject`

Rejects an article and stores the rejection reason.

Auth: Admin required

Request body:

```json
{
  "reason": "Content does not meet publishing guidelines"
}
```

Response `200`:

```json
{
  "_id": "64f...",
  "title": "Article title",
  "body": "Article body",
  "author": "64f...",
  "status": "REJECTED",
  "rejectionReason": "Content does not meet publishing guidelines",
  "likesCount": 0,
  "commentsCount": 0
}
```

Errors:

| Status | Reason |
| --- | --- |
| `401` | Missing, invalid, or expired token |
| `403` | Authenticated user is not an admin |
| `404` | Article not found |

