# MoodMirror

Real-time AI-powered emotion detection web app using webcam feed. Built with FastAPI and React, featuring instant facial expression analysis and emotion tracking visualization.

![MoodMirror](https://img.shields.io/badge/Project-MoodMirror-brightgreen)
![Python](https://img.shields.io/badge/Backend-Python%20FastAPI-blue)
![React](https://img.shields.io/badge/Frontend-React-61dafb)

## Features

- 🎥 Real-time webcam integration
- 🧠 AI-powered emotion detection
- 📊 Live emotion tracking and visualization
- 📈 Confidence scoring for detected emotions
- 📱 Responsive web interface
- ⚡ Fast processing with optimized image handling
- 📊 Data export capabilities
- 📝 Detailed emotion history tracking

## Tech Stack

### Backend
- FastAPI (Python web framework)
- FER (Facial Emotion Recognition)
- OpenCV (Image processing)
- NumPy (Numerical computations)
- Pydantic (Data validation)

### Frontend
- React.js
- Chart.js (Data visualization)
- Webcam integration
- Modern UI components

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Unix/MacOS:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

### POST /predict
Analyzes facial emotions from a base64 encoded image.

**Request Body:**
```json
{
    "image": "base64_encoded_image_string"
}
```

**Response:**
```json
{
    "faces": [
        {
            "dominant_emotion": "happy",
            "confidence": 0.95,
            "emotions": {
                "angry": 0.02,
                "happy": 0.95,
                "sad": 0.01,
                "neutral": 0.02
            },
            "box": [50, 50, 100, 100]
        }
    ],
    "timestamp": "2025-08-05T12:00:00",
    "processing_time": 0.153
}
```

## Development

- The backend uses FastAPI for efficient API handling and FER for emotion detection
- Frontend is built with React for responsive UI and real-time updates
- Image processing is optimized for webcam feed
- Error handling and logging implemented for debugging
- CORS enabled for frontend-backend communication

## Error Handling

The application includes comprehensive error handling for:
- Invalid image formats
- Low resolution images
- Connection issues
- Processing errors
- Missing data

## Future Enhancements

- [ ] User authentication
- [ ] Emotion trends analysis
- [ ] Multiple face tracking
- [ ] Custom emotion models
- [ ] Enhanced visualization options
- [ ] Mobile app version

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
