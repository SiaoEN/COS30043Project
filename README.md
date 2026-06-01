# ShayneStyles

Frontend: Vue 3 + Vite.

Backend: Express + MongoDB in `backend/`.

## Render Deployment

Use two Render services from this repo:

1. Backend web service
	 - Root directory: `backend`
	 - Build command: `npm install`
	 - Start command: `npm start`
	 - Env vars:
		 - `MONGODB_URI`
		 - `JWT_SECRET`
		 - `FRONTEND_URLS` set to your Render frontend URL after it is created
		 - `PUBLIC_API_URL` set to the backend public URL
		 - `UPLOAD_DIR` only if you mount persistent storage; otherwise uploaded files will not survive redeploys on Render

2. Frontend static site
	 - Root directory: `.`
	 - Build command: `npm run build`
	 - Publish directory: `dist`
	 - Env vars:
		 - `VITE_API_BASE_URL` set to the backend public URL followed by `/api`

If you want uploaded images or PNGs to persist on Render, use persistent disk or move uploads to cloud storage such as Cloudinary or S3.

## Run Frontend

```bash
npm run dev
```

## Run Backend

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`.
2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Start the API:

```bash
npm run dev
```

## Root Scripts

- `npm run backend:dev`
- `npm run backend:start`
