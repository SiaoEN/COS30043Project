# ShayneStyles Backend

REST API for the ShayneStyles frontend built with Express and MongoDB.

## Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.

3. For Render, also set:

- `PUBLIC_API_URL` to the backend public URL
- `FRONTEND_URLS` to the deployed frontend URL
- `UPLOAD_DIR` only if you attach persistent storage for uploads

4. Start the server:

```bash
npm run dev
```

## MongoDB Connection Notes

- If you use MongoDB Atlas, make sure your current IP is added to the Atlas network access list.
- If `mongodb+srv://` fails with a DNS/SRV error, try the standard connection string from Atlas or use a local MongoDB instance.
- For local development, `mongodb://127.0.0.1:27017/shaynestyles` is the recommended URI.

## Product Photos

- Send product create/update requests as `multipart/form-data`.
- Use the file field name `image` to upload a product photo.
- The backend stores uploads in `backend/uploads/` by default and returns a public URL using `PUBLIC_API_URL` when it is set.
- On Render, the filesystem is ephemeral unless you mount persistent storage.

## Default Admin

- Run `npm run seed:admin` to create the default admin user in MongoDB.
- Default credentials:
	- email: `admin@shaynestyles.com`
	- password: `admin`
- You can override them with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` in `backend/.env`.

## Authentication

- `POST /api/auth/register` creates a regular `user` account.
- `POST /api/auth/login` returns a JWT and the user role.
- `GET /api/auth/me` returns the current logged-in user when you send `Authorization: Bearer <token>`.
- Product create/update/delete endpoints are restricted to `admin` users.

## Endpoints

- `GET /api/health` - health check
- `GET /api/auth/register` - create user account
- `POST /api/auth/login` - log in and get a JWT
- `GET /api/auth/me` - current user profile
- `GET /api/products` - list products
- `GET /api/products/:id` - get product by id
- `POST /api/products` - create product (admin only)
- `PUT /api/products/:id` - update product (admin only)
- `DELETE /api/products/:id` - delete product (admin only)
