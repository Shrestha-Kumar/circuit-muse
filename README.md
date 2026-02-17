# Circuit Muse — Verilog AI Code Generator

> Fine-tuned Qwen 2.5 VL 7B model for RTL and Verilog design. Use it via the web frontend or directly in Google Colab.

---

## 🏆 Built at KrackHack 2026 — Powered by Smolify

This project was built at KrackHack 2026, sponsored by **Smolify** — a platform that enables developers to rapidly create and deploy Small Language Models (SLMs) without needing massive compute or large datasets.

### What is Smolify?

Smolify makes it fast and accessible to fine-tune small, efficient language models for domain-specific tasks. Instead of training from scratch or paying for GPT-4 API calls, Smolify provides the tooling, infrastructure, and curated datasets to go from idea to a working specialized model in hours.

For this hackathon, Smolify provided:
- 🗂️ **A curated Verilog dataset** → [smolify/smolified-krackhack26verilog](https://huggingface.co/datasets/smolify/smolified-krackhack26verilog)
- 🤖 **A baseline SLM** → [RedNinja6440/verilog-slm-krackhack26](https://huggingface.co/spaces/RedNinja6440/verilog-slm-krackhack26)

### Why We Trained Our Own Model on Top

The Smolify baseline SLM is intentionally compact and fast — excellent for general tasks. However, Verilog is a low-level hardware description language with extremely precise syntax and semantics where a small generalist brain consistently struggles with:

- **FIFO pointer logic** — correct full/empty detection using the extra MSB technique
- **AXI4-Lite protocol** — AW and W channels must be accepted independently or deadlock occurs
- **Clock domain crossing** — requires Gray-coded pointers and two-flop synchronizers, not direct 2FF sync of binary buses
- **SystemVerilog assertions** — formal property syntax that must be logically correct, not just syntactically valid

These are not surface-level coding patterns. They require deep understanding of hardware timing, metastability, and protocol specifications. The baseline SLM, while a great starting point, could not reliably generate synthesizable, bug-free RTL for these hardware-specific patterns.

So we took the Smolify dataset as our foundation, extended it with **204 hand-curated industry-level RTL examples** covering generation, debugging, explanation, and formal verification tasks, then fine-tuned **Qwen 2.5 VL 7B** using QLoRA across 4 progressive training stages — producing a model that understands hardware semantics, not just Verilog syntax.

| Capability | Smolify Baseline SLM | CircuitMuse |
|---|---|---|
| Model size | Small (compact) | 7B (4-bit QLoRA) |
| Dataset | Smolify curated | Smolify + 204 custom RTL examples |
| FIFO full/empty logic | Inconsistent | ✅ Correct MSB-based detection |
| AXI protocol ordering | Basic | ✅ Full channel independence |
| SVA assertions | Limited | ✅ Correct formal properties |
| CDC synchronization | Missing | ✅ Gray code + 2FF synchronizers |
| Sequential logic | Good | ✅ Excellent |

---

## 🗂️ Repository Structure

```
circuit-muse/
├── frontend/                          ← React web app
│   ├── src/
│   │   ├── hooks/
│   │   │   └── useVerilogGenerator.ts ← API call logic (update URL here)
│   │   └── ...
│   ├── vite.config.ts
│   └── package.json
├── notebooks/
│   ├── verilog_backend.ipynb          ← Flask API + Cloudflare tunnel (run this for web frontend)
│   └── finetune_stage*.ipynb          ← Fine-tuning notebooks showing our training pipeline
├── python/
│   └── inference.py                   ← Standalone Colab inference script
└── README.md
```

---

## 🤖 Usage Method 1 — Standalone Colab Inference (No Frontend Needed)

The simplest way to use the model. Run one script in Colab and type prompts directly.

### Step 1: Open Google Colab

Go to [colab.research.google.com](https://colab.research.google.com)

### Step 2: Set Runtime to GPU

- Click **Runtime → Change runtime type**
- Set **Hardware accelerator** to **T4 GPU**
- Click **Save → Connect**

### Step 3: Upload the Script

- Click **File → Upload notebook** and upload `python/inference.py`
  **OR** copy-paste the script contents into a new notebook cell

### Step 4: Run the Cell

The script will:
1. Mount your Google Drive
2. Install dependencies (~2 min)
3. Load model weights from Drive (~3 min)
4. Start an interactive prompt loop

### Step 5: Generate Verilog

When you see:
```
✅ Model loaded and ready
Enter instruction (or "quit" to exit):
```

Type any hardware description and press Enter:
```
Enter instruction: Design a parameterizable synchronous FIFO with depth and width parameters.
```

The model streams Verilog output directly to the cell output.

### Example Prompts That Work Well

```
Design a simple 4-bit synchronous counter with active-low reset.
Design a D flip-flop with synchronous reset and enable.
Design a parameterizable synchronous FIFO with depth and width parameters.
Design a 4-bit up/down counter with synchronous load and asynchronous reset.
Write a SystemVerilog assertion to verify AXI valid never deasserts before ready.
Explain why non-blocking assignments must be used in sequential always blocks.
The following counter overflows silently. Add saturation logic: if (en) cnt <= cnt + 1;
Design a 4-client round-robin arbiter with rotating priority pointer.
```

> ⚠️ **Required:** Model weights must be in your Google Drive at:
> `/content/drive/MyDrive/qwen_verilog_stage4_final/`
>
> Download the weights from the [shared Drive folder](https://drive.google.com/drive/folders/16soGM1-rpTdfOdUTXE8jxqdbKV1aLsFw?usp=drive_link) and add them to your Drive before running.

---

## 🌐 Usage Method 2 — Web Frontend + Colab Backend

Use the full web interface with syntax highlighting, copy button, and live generation.

### Part A — Get the Model Weights into Your Google Drive

> ⚠️ **This step is required before running the backend. The model weights are ~7GB and must be in your own Google Drive for Colab to load them.**

#### Step 1: Open the shared Drive folder

Click here → [Shared Drive Folder](https://drive.google.com/drive/folders/16soGM1-rpTdfOdUTXE8jxqdbKV1aLsFw?usp=drive_link)

#### Step 2: Add the weights folder to your own Drive

1. Inside the shared folder, find the folder named **`qwen_verilog_stage4_final`**
2. Right-click on it → click **"Add shortcut to Drive"**
   **OR** right-click → **"Make a copy"** to copy it fully to your Drive
3. Make sure it appears in **My Drive** (not just Shared with me) at the path:
   ```
   My Drive/qwen_verilog_stage4_final/
   ```

> 💡 **Tip:** Use "Add shortcut" to save Drive storage space — it links to the original without copying the full 7GB.

---

### Part B — Start the Colab Backend

#### Step 1: Open the Backend Notebook

You can open the backend notebook directly from this repository — no Drive access needed for the code:

**Option 1 — From GitHub (recommended):**
1. Go to [Google Colab](https://colab.research.google.com)
2. Click **File → Open Notebook → GitHub**
3. Paste: `https://github.com/Shrestha-Kumar/circuit-muse`
4. Select `notebooks/verilog_backend.ipynb`
5. Click **Open**

**Option 2 — From Google Drive:**
1. Go to [Google Colab](https://colab.research.google.com)
2. Click **File → Open Notebook → Google Drive**
3. Navigate to the [shared Drive folder](https://drive.google.com/drive/folders/16soGM1-rpTdfOdUTXE8jxqdbKV1aLsFw?usp=drive_link) and open `verilog_backend.ipynb`

#### Step 2: Set Runtime to GPU

- **Runtime → Change runtime type → T4 GPU → Save → Connect**

#### Step 3: Mount Your Drive and Run the Backend Cell

The notebook will first mount your Google Drive:
```python
from google.colab import drive
drive.mount('/content/drive')
```

Click the authorization link → select your Google account → allow access.

Then run the main backend cell. Wait for this output (~3-4 minutes to load model):

```
✅ Model loaded
✅ Flask running on port 5000
⏳ Waiting for tunnel URL...

🚀 YOUR API URL: https://xxxx-xxxx-xxxx.trycloudflare.com
   Health check:  https://xxxx-xxxx-xxxx.trycloudflare.com/health
   Generate:      https://xxxx-xxxx-xxxx.trycloudflare.com/generate  (POST)

📋 Paste this in your frontend: https://xxxx-xxxx-xxxx.trycloudflare.com
```

**Copy the Cloudflare URL.**

#### Step 4: Verify Backend is Running

Open this in a new browser tab:
```
https://xxxx-xxxx-xxxx.trycloudflare.com/health
```

Should return:
```json
{"status": "ok", "model": "qwen-verilog-stage4"}
```

---

### Part C — Run the Frontend

#### Step 1: Clone the Repository

```bash
git clone https://github.com/Shrestha-Kumar/circuit-muse.git
cd circuit-muse/frontend
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Set the Cloudflare URL

Open `src/hooks/useVerilogGenerator.ts` and find this line (~line 40):

```typescript
const apiUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://PASTE-YOUR-URL-HERE.trycloudflare.com";
```

Replace with your actual Cloudflare URL:

```typescript
const apiUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://xxxx-xxxx-xxxx.trycloudflare.com";
```

#### Step 4: Start the App

```bash
npm run dev
```

Open browser at `http://localhost:8080`

---

### Part D — Deploy to GitHub Pages (Share Live Link)

#### Step 1: Update the URL in `useVerilogGenerator.ts`

Same as Part C Step 3 above.

#### Step 2: Deploy

```bash
cd frontend
npm run deploy
```

Wait for `Published`. Live site:
```
https://shrestha-kumar.github.io/circuit-muse/
```

---

## 🔄 Every Time Colab Restarts

Each session gives a **new** Cloudflare URL. Do this every restart:

**1.** Re-run the backend cell in Colab → copy the new URL

**2.** Update `frontend/src/hooks/useVerilogGenerator.ts`:
```typescript
const apiUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://NEW-URL-HERE.trycloudflare.com"; // ← update this line
```

**3.** If running locally: Vite hot-reloads automatically

**4.** If on GitHub Pages:
```bash
cd frontend
npm run deploy
```

> 💡 The model weights in your Drive do **not** need to be re-downloaded. Only the Cloudflare URL changes each session.

---

## 🧪 Fine-Tuning Notebooks

The `notebooks/` folder includes our training pipeline notebooks so you can see exactly how CircuitMuse was built or reproduce the training yourself.

The fine-tuning was done in 4 progressive stages:
- **Stage 1-2:** Base Verilog generation on the Smolify dataset
- **Stage 3-4:** Extended training on 204 custom RTL examples with increasing difficulty — generation, debug, explain-why, and SVA assertion tasks

Each stage used QLoRA (4-bit quantization) via Unsloth on a free T4 GPU, training only 0.57% of parameters (47.5M of 8.3B) for efficient domain adaptation.

> ⚠️ To reproduce training, you will need the model weights and dataset in your Google Drive. Weights are in the [shared Drive folder](https://drive.google.com/drive/folders/16soGM1-rpTdfOdUTXE8jxqdbKV1aLsFw?usp=drive_link) and the base dataset is at [smolify/smolified-krackhack26verilog](https://huggingface.co/datasets/smolify/smolified-krackhack26verilog).

---

## 📁 Key Files

| File | Purpose | When to edit |
|------|---------|--------------|
| `frontend/src/hooks/useVerilogGenerator.ts` | API URL + response parsing | Every Colab restart |
| `notebooks/verilog_backend.ipynb` | Flask backend + Cloudflare tunnel | Never — just run it |
| `notebooks/finetune_stage*.ipynb` | Training pipeline reference | Only if reproducing training |
| `python/inference.py` | Standalone Colab inference | Never — just run it |
| `frontend/vite.config.ts` | Build config + GitHub Pages base path | Only if changing deploy target |
| `frontend/.env` | Optional env vars (gitignored) | Alternative to editing .ts file |

---

## 🛠️ Troubleshooting

### Pink "Demo Mode" badge appears
Frontend can't reach the backend. Check:
- Is the Colab runtime still running?
- Is the URL updated in `useVerilogGenerator.ts`?
- Does `https://your-url.trycloudflare.com/health` return `{"status":"ok"}`?

### Model not found error in Colab
```
OSError: /content/drive/MyDrive/qwen_verilog_stage4_final not found
```
The weights are not in your Drive at the correct path. Go back to **Part A** and make sure the folder is added to **My Drive** (not just Shared with me).

### Blank white screen on GitHub Pages
Check `frontend/vite.config.ts` has:
```typescript
base: '/circuit-muse/',
```
Then:
```bash
cd frontend && npm run deploy
```

### "Backend replied, but output was empty"
Check `useVerilogGenerator.ts` has:
```typescript
const rawOutput = data.output || data.code || data.response || data.generated_text || "";
```

### Timeout after 2 minutes
T4 GPU under load. Try shorter prompts or restart the Colab runtime.

### Colab disconnects during demo
Run this in a separate cell to prevent idle disconnect:
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
| Fine-tuning | LoRA via Unsloth |
| Training stages | 4 progressive stages |
| Dataset | Smolify baseline + 204 custom RTL examples |
| Trainable params | 47.5M / 8.3B (0.57%) |
| Quantization | 4-bit QLoRA |
| Hardware | NVIDIA T4 (Google Colab) |

### Strengths
- Synchronous FIFO with correct full/empty detection
- Sequential logic (counters, flip-flops, registers)
- AXI4-Lite handshake assertions
- RTL debug and explanation
- Round-robin arbiter design

### Known Limitations
- Asynchronous FIFO (Gray code CDC)
- Complex multi-clock-domain debug
- Latch inference correction

---

## 📝 License

MIT

## 🙏 Acknowledgements

- [Smolify](https://huggingface.co/spaces/RedNinja6440/verilog-slm-krackhack26) — hackathon sponsor, baseline SLM and dataset
- [smolify/smolified-krackhack26verilog](https://huggingface.co/datasets/smolify/smolified-krackhack26verilog) — base Verilog dataset
- [Unsloth](https://github.com/unslothai/unsloth) — fast LoRA fine-tuning
- [Qwen](https://github.com/QwenLM/Qwen) — base model
- [Lovable](https://lovable.dev) — frontend scaffolding
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) — free HTTPS tunnel
