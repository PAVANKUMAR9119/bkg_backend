# API Integration Flow

This guide describes how a client app should integrate with the BKG backend.

Base URL:

```text
http://localhost:3000/api
```

## 1. Authentication Flow

### Register

Use this when a user creates a new account.

```http
POST /api/auth/register
Content-Type: application/json
```

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

The API returns the created user without the password.

### Login

After registration, or whenever the user signs in:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

Store the returned `accessToken` securely.

For every protected API call, send:

```http
Authorization: Bearer <accessToken>
```

### Restore Session

When the app starts and already has a token:

```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

If the response is `200`, keep the user logged in. If the response is `401`, clear the local token and show the login screen.

## 2. Public Article Reading Flow

### Load Article Feed

```http
GET /api/articles?page=1&limit=10
```

Use the returned `pagination` object for infinite scroll or paged navigation.

Recommended client behavior:

1. Fetch page `1` on initial load.
2. Render `articles`.
3. If `pagination.page < pagination.totalPages`, allow loading the next page.
4. Append page results when loading more.

Only `APPROVED` articles appear in this API.

### Open Article Detail

```http
GET /api/articles/:id
```

If this returns `404`, show an article-not-found message. A pending or rejected article also returns `404` from the public detail API.

### Load Comments

```http
GET /api/articles/:articleId/comments
```

Call this after loading the article detail. The API returns comments newest first.

## 3. Authenticated User Article Flow

### Create Article

```http
POST /api/articles
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "title": "Article title",
  "body": "Article body",
  "image": "https://example.com/image.jpg"
}
```

New articles are always created as:

```text
PENDING
```

They are not visible in the public feed until an admin approves them.

### Show My Articles

```http
GET /api/articles/my-articles
Authorization: Bearer <accessToken>
```

Use this screen to show the user all their articles and moderation states:

| Status | Meaning | Suggested UI |
| --- | --- | --- |
| `PENDING` | Waiting for admin review | Show "Under review" |
| `APPROVED` | Published publicly | Show "Published" |
| `REJECTED` | Not published | Show "Rejected" and display `rejectionReason` |

## 4. Comment Flow

### Add Comment

```http
POST /api/articles/:articleId/comments
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "content": "Nice article"
}
```

After success:

1. Add the returned comment to the comments list.
2. Increment the visible article comment count locally, or refetch the article.

The server also increments `commentsCount`.

### Delete Comment

```http
DELETE /api/comments/:id
Authorization: Bearer <accessToken>
```

Only the comment owner can delete their comment.

After success:

1. Remove the comment from the local list.
2. Decrement the visible article comment count locally, or refetch the article.

The server soft-deletes the comment and decrements `commentsCount`.

## 5. Like Flow

### Like Article

```http
POST /api/articles/:articleId/like
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "message": "Article liked",
  "likesCount": 1
}
```

After success, update the article's displayed like count with the returned `likesCount`.

If the API returns `409`, the user has already liked the article.

### Unlike Article

```http
DELETE /api/articles/:articleId/like
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "message": "Article unliked",
  "likesCount": 0
}
```

After success, update the article's displayed like count with the returned `likesCount`.

If the API returns `404`, the user had not liked the article.

Note: the current public article response does not include whether the logged-in user has liked each article. The client may need to track optimistic like state locally after user actions, or the backend can be extended with an `isLiked` field.

## 6. Admin Moderation Flow

Admin APIs require a JWT for a user whose `role` is `ADMIN`.

### Load Pending Articles

```http
GET /api/admin/articles/pending
Authorization: Bearer <adminAccessToken>
```

Use this to build the admin moderation queue. Pending articles are returned oldest first.

### Approve Article

```http
PATCH /api/admin/articles/:id/approve
Authorization: Bearer <adminAccessToken>
```

After approval:

1. Remove the article from the pending queue.
2. The article will now appear in `GET /api/articles`.

### Reject Article

```http
PATCH /api/admin/articles/:id/reject
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
```

```json
{
  "reason": "Content does not meet publishing guidelines"
}
```

After rejection:

1. Remove the article from the pending queue.
2. The author can see the rejected article and reason in `GET /api/articles/my-articles`.

## 7. Recommended Client Route Flow

```text
App start
  -> Has token?
    -> Yes: GET /auth/me
      -> 200: enter app
      -> 401: clear token, show login
    -> No: show public feed or login

Public feed
  -> GET /articles
  -> Tap article
    -> GET /articles/:id
    -> GET /articles/:articleId/comments

Logged-in user
  -> Create article
    -> POST /articles
    -> Show pending state
  -> My articles
    -> GET /articles/my-articles

Article engagement
  -> Add comment: POST /articles/:articleId/comments
  -> Delete own comment: DELETE /comments/:id
  -> Like: POST /articles/:articleId/like
  -> Unlike: DELETE /articles/:articleId/like

Admin
  -> GET /admin/articles/pending
  -> PATCH /admin/articles/:id/approve
  -> PATCH /admin/articles/:id/reject
```

## 8. JavaScript Integration Example

```ts
const API_BASE_URL = 'http://localhost:3000/api';

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const contentType = response.headers.get('content-type');
  const data = contentType?.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw data;
  }

  return data as T;
}

export function login(email: string, password: string) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getArticles(page = 1, limit = 10) {
  return apiRequest(`/articles?page=${page}&limit=${limit}`);
}

export function createArticle(
  token: string,
  input: { title: string; body: string; image?: string },
) {
  return apiRequest(
    '/articles',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    token,
  );
}
```

## 9. Important Backend Notes For Frontend Developers

- The API prefix is `/api`, configured globally in `main.ts`.
- CORS is enabled with `origin: true` and `credentials: true`.
- Passwords are never returned by auth APIs.
- Register does not return an access token. Call login after successful registration.
- Article creation does not publish immediately. Admin approval is required.
- Public article APIs only return approved articles.
- Comment delete is a soft delete.
- Like duplication is blocked by a unique article/user relationship.
- Admin access is role-based and requires `role: "ADMIN"` in the authenticated user.

