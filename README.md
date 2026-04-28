# 🎵 Tune Tailor

Tune Tailor is an AI-powered music recommendation engine that analyzes your emotional sentiment and generates personalized soundtracks using Spotify.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

*   **Node.js** (v18 or higher)
*   **npm** (comes with Node.js)

---

### 🛠️ Installation & Setup

#### 1. Clone the repository
```bash
git clone https://github.com/your-username/Tune-Tailor.git
cd Tune-Tailor
```

#### 2. Backend Setup (Server)
```bash
cd server
npm install
```
*   Create a `.env` file in the `server` directory.
*   Add the following variables (you'll need a [Spotify Developer](https://developer.spotify.com/) account):
    ```env
    SPOTIFY_CLIENT_ID=your_spotify_id
    SPOTIFY_CLIENT_SECRET=your_spotify_secret
    SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
    PORT=5000
    ```

#### 3. Frontend Setup (Client)
```bash
cd ../client
npm install
```
*   Create a `.env.local` file in the `client` directory.
*   Add your [Supabase](https://supabase.com/) credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

---

### 🏃 Running the Application

You need to run **both** the server and the client at the same time.

#### Start the Backend (from the `server` folder)
```bash
npm run dev
```
The server will run on `http://localhost:5000`.

#### Start the Frontend (from the `client` folder)
```bash
npm run dev
```
The application will be available at `http://localhost:5173` (or `http://localhost:3000` if configured).

---

### 🎨 Technologies Used
*   **Frontend:** React, Vite, Tailwind CSS, Lucide React
*   **Backend:** Node.js, Express, TensorFlow.js (for ML analysis)
*   **Database/Auth:** Supabase
*   **API:** Spotify Web API
