import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './App.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Webcam video constraints
const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: 'user',
};

function App() {
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Enhanced state management
  const [detecting, setDetecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  // Get available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error getting cameras:', error);
      }
    };
    getCameras();
  }, []);

  // Update statistics whenever emotion history changes
  useEffect(() => {
    if (emotionHistory.length > 0) {
      const stats = emotionHistory.reduce((acc, entry) => {
        acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
        return acc;
      }, {});
      setStatistics(stats);
    }
  }, [emotionHistory]);

  // Function to capture and analyze image
  const captureAndSend = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setLoading(true);
        try {
          const response = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageSrc.split(',')[1] }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.faces.length === 0) {
              setError("No face detected. Please try again.");
              setCurrentEmotion(null);
            } else {
              const dominantFace = data.faces[0];
              setCurrentEmotion({
                emotion: dominantFace.dominant_emotion,
                confidence: dominantFace.confidence,
                timestamp: data.timestamp,
                processingTime: data.processing_time
              });
              setEmotionHistory(prev => [...prev, {
                emotion: dominantFace.dominant_emotion,
                confidence: dominantFace.confidence,
                timestamp: data.timestamp
              }].slice(-50)); // Keep last 50 entries
              setError("");
            }
          } else {
            setError("Server error. Please try again later.");
            setCurrentEmotion(null);
          }
        } catch (error) {
          setError("Network error. Please check your connection.");
          setCurrentEmotion(null);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // Start/Stop detection
  const toggleDetection = () => {
    if (!detecting) {
      setDetecting(true);
      setCurrentEmotion(null);
      intervalRef.current = setInterval(captureAndSend, 2000);
    } else {
      setDetecting(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  // Export data as CSV
  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Emotion,Confidence,Timestamp\n" +
      emotionHistory.map(entry => 
        `${entry.emotion},${entry.confidence},${entry.timestamp}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "emotion_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Chart data
  const chartData = {
    labels: emotionHistory.map((_, index) => `${index + 1}`),
    datasets: [
      {
        label: 'Confidence',
        data: emotionHistory.map(entry => entry.confidence),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="emotion-app">
      <h1 className="title">MoodMirror - Emotion Detection</h1>
      
      <div className="main-container">
        <div className="webcam-section">
          <div className="webcam-wrapper">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                ...videoConstraints,
                deviceId: selectedCamera
              }}
              className="webcam-video"
            />
          </div>

          <div className="controls">
            {availableCameras.length > 1 && (
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="camera-select"
              >
                {availableCameras.map(camera => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${camera.deviceId}`}
                  </option>
                ))}
              </select>
            )}

            <button
              className={`button ${detecting ? 'stop-btn' : 'start-btn'}`}
              onClick={toggleDetection}
            >
              {detecting ? 'Stop Detection' : 'Start Detection'}
            </button>

            {emotionHistory.length > 0 && (
              <button className="button" onClick={exportData}>
                Export Data
              </button>
            )}
          </div>

          {loading && <div className="loading">Processing...</div>}
          {error && <div className="error-message">{error}</div>}
          
          {currentEmotion && (
            <div className="emotion-result">
              <div className="emotion-text">
                Current Emotion: {currentEmotion.emotion}
              </div>
              <div>Confidence: {(currentEmotion.confidence * 100).toFixed(2)}%</div>
              <div>Processing Time: {currentEmotion.processingTime.toFixed(3)}s</div>
            </div>
          )}
        </div>

        <div className="stats-section">
          <h2>Statistics</h2>
          <div className="chart-container">
            <Line data={chartData} options={{ responsive: true }} />
          </div>
          
          <h3>Emotion Distribution</h3>
          <div className="stats-grid">
            {Object.entries(statistics).map(([emotion, count]) => (
              <div key={emotion} className="stat-item">
                <strong>{emotion}:</strong> {count} times
                ({((count / emotionHistory.length) * 100).toFixed(1)}%)
              </div>
            ))}
          </div>

          <h3>Recent History</h3>
          <ul className="history-list">
            {emotionHistory.slice().reverse().map((entry, index) => (
              <li key={index} className="history-item">
                <span>{entry.emotion}</span>
                <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App; 