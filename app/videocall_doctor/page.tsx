'use client';
import { useEffect, useState } from 'react';

export default function VideoCallDoctorPage() {
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
    const enableCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          console.error("MediaDevices API not found. Are you on HTTPS/localhost?");
          return;
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    enableCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []); 
  
    return (
        <div>
      <h1>Camera Test</h1>
      {stream ? <video autoPlay ref={video => { if (video) video.srcObject = stream }} /> : <p>Loading camera...</p>}
    </div>
    );
}