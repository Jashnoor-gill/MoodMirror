import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: 'user',
};

function App() {
  const webcamRef = useRef(null);
  const [detecting, setDetecting] = useState(false);
  const [emotion, setEmotion] = useState('');
  const intervalRef = useRef(null);

  const captureAndSend = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          const response = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: imageSrc }),
          });
          if (response.ok) {
            const data = await response.json();
            setEmotion(data.emotion || '');
          } else {
            setEmotion('Error');
          }
        } catch (error) {
          setEmotion('Error');
        }
      }
    }
  };

  const startDetection = () => {
    setDetecting(true);
    setEmotion('');
    intervalRef.current = setInterval(captureAndSend, 2000);
  };

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
      <div style={{ position: 'relative', width: 640, height: 480 }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={{ width: 640, height: 480, borderRadius: 8 }}
        />
        {emotion && (
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 0,
              width: '100%',
              textAlign: 'center',
              color: 'white',
              fontSize: 32,
              fontWeight: 'bold',
              textShadow: '2px 2px 8px #000',
            }}
          >
            {emotion}
          </div>
        )}
      </div>
      <button
        onClick={startDetection}
        disabled={detecting}
        style={{ marginTop: 24, padding: '12px 32px', fontSize: 18, borderRadius: 6 }}
      >
        Start Detection
      </button>
    </div>
  );
}

export default App; 