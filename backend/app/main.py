from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import io
from model import predict_image

# 1. Inisialisasi app CUKUP SEKALI
app = FastAPI()

# 2. Pasang Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Kamu bisa ganti ke ["http://localhost:5173"] agar lebih aman
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- JANGAN menulis app = FastAPI() lagi di sini ---

# 3. Endpoint utama
@app.get("/")
def home():
    return {"message": "RoadScan AI Backend Running 🚀"}

# 4. Endpoint untuk prediksi
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # baca file gambar
        contents = await file.read()

        # kirim ke model AI
        label, confidence = predict_image(io.BytesIO(contents))

        return {
            "prediction": label,
            "confidence": confidence
        }

    except Exception as e:
        return {"error": str(e)}