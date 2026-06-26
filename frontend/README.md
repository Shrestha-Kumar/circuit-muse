# Circuit Muse — Verilog AI Code Generator

> Fine-tuned Qwen 2.5 VL 7B model for RTL and Verilog design, served via Google Colab + Cloudflare Tunnel with a React frontend.

---

## 🗂️ Repository Structure

```
circuit-muse/
├── src/
│   ├── hooks/
│   │   └── useVerilogGenerator.ts   ← API call logic (update URL here)
│   ├── config.ts                    ← API base URL config
│   └── ...
├── public/
├── vite.config.ts
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Google account with access to the shared Google Drive folder
- Git installed

---

## Part 1 — Run the Backend on Google Colab

### Step 1: Open the Colab Notebook

1. Go to [Google Colab](https://colab.research.google.com)
2. Click **File → Open Notebook → Google Drive**
3. Navigate to the shared Drive folder and open **`verilog_backend.ipynb`**

### Step 2: Connect to GPU Runtime

1. Click **Runtime → Change runtime type**
2. Set **Hardware accelerator** to **T4 GPU**
3. Click **Save**
4. Click **Connect** (top right)

### Step 3: Mount Google Drive

Run the first cell — it will ask for permission to access your Drive:

```python
from google.colab import drive
drive.mount('/content/drive')
```

Click the link → select your Google account → copy the authorization code → paste it back.

### Step 4: Run the Backend Cell

Run the main backend cell. Wait for this output (takes ~2-3 minutes to load the model):

```
✅ Model loaded
✅ Flask running on port 5000
⏳ Waiting for tunnel URL...

🚀 YOUR API URL: https://xxxx-xxxx-xxxx.trycloudflare.com
   Health check:  https://xxxx-xxxx-xxxx.trycloudflare.com/health
   Generate:      https://xxxx-xxxx-xxxx.trycloudflare.com/generate  (POST)

📋 Paste this in your frontend: https://xxxx-xxxx-xxxx.trycloudflare.com
```

**Copy the Cloudflare URL** — you will need it in Part 2.

### Step 5: Verify the Backend is Working

Open this URL in a new browser tab (replace with your actual URL):

```
https://xxxx-xxxx-xxxx.trycloudflare.com/health
```

You should see:
```json
{"status": "ok", "model": "qwen-verilog-stage4"}
```

> ⚠️ **Keep the Colab tab open** during use. The tunnel closes if the runtime is disconnected or idle for too long.

---

## Part 2 — Run the Frontend Locally

### Step 1: Clone the Repository

```bash
git clone https://github.com/Shrestha-Kumar/circuit-muse.git
cd circuit-muse
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set the Cloudflare URL

You have two options:

#### Option A — Edit `src/hooks/useVerilogGenerator.ts` (recommended)

Open the file and find this line (around line 40):

```typescript
const apiUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://PASTE-YOUR-URL-HERE.trycloudflare.com";
```

Replace `https://PASTE-YOUR-URL-HERE.trycloudflare.com` with your actual Cloudflare URL:

```typescript
const apiUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://xxxx-xxxx-xxxx.trycloudflare.com";
```

#### Option B — Create a `.env` file in the project root

```bash
# Create .env file
echo 'VITE_API_BASE_URL=https://xxxx-xxxx-xxxx.trycloudflare.com' > .env
echo 'VITE_USE_DEMO_MODE=false' >> .env
```

Or manually create `.env` with:

```env
VITE_API_BASE_URL=https://xxxx-xxxx-xxxx.trycloudflare.com
VITE_USE_DEMO_MODE=false
```

### Step 4: Start the Development Server

```bash
npm run dev
```

Open your browser at:
```
http://localhost:8080
```

---

## Part 3 — Deploy to GitHub Pages (Optional)

If you want to share the live URL instead of running locally:

### Step 1: Update the URL in `useVerilogGenerator.ts`

Same as Option A above — paste your Cloudflare URL as the fallback.

### Step 2: Build and Deploy

```bash
npm run deploy
```

Wait for `Published` to appear. Your live site will be at:

```
https://shrestha-kumar.github.io/circuit-muse/
```

> ⚠️ The Cloudflare URL changes every time Colab restarts. After each restart, update the URL in `useVerilogGenerator.ts` and run `npm run deploy` again.

---

## 🔄 Every Time Colab Restarts

Each Colab session gives a new Cloudflare URL. Follow these steps:

**1. Re-run the backend cell in Colab → copy the new URL**

**2. Update `src/hooks/useVerilogGenerator.ts`:**

```typescript
// Find this line and update the URL:
const apiUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://NEW-URL-HERE.trycloudflare.com";  // ← paste new URL
```

**3. If running locally:** The Vite dev server picks up the change automatically.

**4. If deployed on GitHub Pages:**
```bash
npm run deploy
```

---

## 📁 Key Files Reference

| File | Purpose | When to edit |
|------|---------|--------------|
| `src/hooks/useVerilogGenerator.ts` | All API call logic, URL config, response parsing | Every Colab restart — update the fallback URL |
| `src/config.ts` | Central config (if present) | Optional — can store URL here instead |
| `.env` | Environment variables | Alternative to editing the .ts file |
| `vite.config.ts` | Vite build config, base path for GitHub Pages | Only if changing deploy target |

---

## 🛠️ Troubleshooting

### Pink "Demo Mode" badge appears
The frontend couldn't reach the backend. Check:
- Is the Colab runtime still running? (check the Colab tab)
- Is the Cloudflare URL updated in `useVerilogGenerator.ts`?
- Open `https://your-url.trycloudflare.com/health` — does it return `{"status":"ok"}`?

### Blank white screen on GitHub Pages
The base path may be misconfigured. Check `vite.config.ts` has:
```typescript
base: '/circuit-muse/',
```
Then redeploy:
```bash
npm run deploy
```

### "Backend replied, but output was empty"
The model response field name mismatch. Check `useVerilogGenerator.ts` has:
```typescript
const rawOutput = data.output || data.code || data.response || data.generated_text || "";
```

### Timeout after 2 minutes
The T4 GPU may be under load. Try:
- Shorter prompts
- Reducing `max_tokens` in `useVerilogGenerator.ts`
- Restarting the Colab runtime and rerunning the backend cell

### Colab disconnects during demo
Move your mouse in the Colab tab every few minutes, or run this cell to prevent idle disconnect:
```python
import time
while True:
    time.sleep(30)
    print(".", end="", flush=True)
```

---

## 🤖 Model Details

| Property | Value |
|----------|-------|
| Base model | Qwen 2.5 VL 7B Instruct |
| Fine-tuning method | LoRA (PEFT) via Unsloth |
| Training stages | 4 progressive stages |
| Dataset | 204 industry-level Verilog examples |
| Trainable parameters | 47.5M / 8.3B (0.57%) |
| Quantization | 4-bit (QLoRA) |
| Hardware | NVIDIA T4 (Google Colab) |

### Strengths
- Synchronous FIFO generation with correct full/empty detection
- Sequential logic (counters, flip-flops, shift registers)
- AXI4-Lite handshake assertions
- RTL debug and explanation tasks
- Round-robin arbiter design

### Known Limitations
- Asynchronous FIFO (Gray code CDC) needs more training data
- Complex multi-domain debug reasoning
- Latch inference fix (adds sensitivity list instead of default)

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [Unsloth](https://github.com/unslothai/unsloth) — fast LoRA fine-tuning
- [Qwen](https://github.com/QwenLM/Qwen) — base model
- [Lovable](https://lovable.dev) — frontend scaffolding
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) — free HTTPS tunnel