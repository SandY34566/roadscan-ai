import tensorflow as tf
import numpy as np
from PIL import Image

# load model (punya kamu dari Colab)
model = tf.keras.models.load_model("../model/model.h5", compile=False)

# ⚠️ SESUAIKAN DENGAN TRAINING KAMU
classes = ["Baik", "Sedang", "Rusak"]

def predict_image(image_bytes):
    # buka gambar
    image = Image.open(image_bytes).convert("RGB")

    # resize (WAJIB sama dengan training)
    image = image.resize((224, 224))

    # ubah ke array
    img = np.array(image) / 255.0
    img = np.expand_dims(img, axis=0)

    # prediksi
    prediction = model.predict(img)

    # ambil hasil tertinggi
    index = np.argmax(prediction)
    confidence = float(np.max(prediction))

    return classes[index], round(confidence * 100, 2)
