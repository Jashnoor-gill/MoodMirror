from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fer import FER
import cv2
import numpy as np
import base64
import logging
from typing import Dict, List
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('emotion_detector.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MoodMirror API",
    description="An AI-powered emotion detection API",
    version="1.0.0"
)

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageRequest(BaseModel):
    image: str

class EmotionResponse(BaseModel):
    faces: List[Dict]
    timestamp: str
    processing_time: float

@app.post("/predict", response_model=EmotionResponse)
async def predict_emotion(request: ImageRequest):
    try:
        start_time = datetime.now()
        
        # Input validation
        if not request.image:
            logger.error("Empty image received")
            raise HTTPException(status_code=400, detail="No image data provided")

        # Decode the base64 image
        try:
            image_data = base64.b64decode(request.image)
            np_arr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            if img is None:
                logger.error("Invalid image format")
                raise HTTPException(status_code=400, detail="Invalid image format")
                
            # Check minimum image quality
            if img.shape[0] < 64 or img.shape[1] < 64:
                logger.warning("Image resolution too low")
                raise HTTPException(status_code=400, detail="Image resolution too low")
                
        except Exception as e:
            logger.error(f"Image decoding error: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid image data")

        # Use FER to detect emotion
        detector = FER()
        result = detector.detect_emotions(img)
        
        # Process results
        if result:
            faces = []
            for face in result:
                emotions = face["emotions"]
                dominant_emotion = max(emotions.items(), key=lambda x: x[1])
                face_data = {
                    "dominant_emotion": dominant_emotion[0],
                    "confidence": dominant_emotion[1],
                    "emotions": emotions,
                    "box": face["box"]
                }
                faces.append(face_data)
                
            processing_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"Successfully processed image with {len(faces)} faces detected")
            return {
                "faces": faces,
                "timestamp": datetime.now().isoformat(),
                "processing_time": processing_time
            }
        else:
            logger.warning("No faces detected in the image")
            return {
                "faces": [],
                "timestamp": datetime.now().isoformat(),
                "processing_time": (datetime.now() - start_time).total_seconds()
            }
            
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))