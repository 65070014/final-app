'use client'
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
export default function VideoCallDoctorPage() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [isCallButtonDisabled, setIsCallButtonDisabled] = useState(true);
  const [isHangupButtonDisabled, setIsHangupButtonDisabled] = useState(true);
  const [incomingOffer, setIncomingOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
  const ROOM_ID = "room-123";
  const peerConnectionConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      {
        urls: 'turn:global.relay.metered.ca:80',
        username: '3b0efcf4646682be82fda725',
        credential: 'yo7yr1EvL5Ob1g8r',
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: "3b0efcf4646682be82fda725",
        credential: "yo7yr1EvL5Ob1g8r",
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: "3b0efcf4646682be82fda725",
        credential: "yo7yr1EvL5Ob1g8r",
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: "3b0efcf4646682be82fda725",
        credential: "yo7yr1EvL5Ob1g8r",
      },
    ]
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("join_room", ROOM_ID);
    socketRef.current.on("answer", async (answer) => {
      console.log("Received Answer via Socket");
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });
    socketRef.current.on("candidate", async (candidate) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);
  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsCallButtonDisabled(false);
    } catch (error) {
      console.error('Error opening camera:', error);
    }
  };

  //โทร
  const handleCall = async () => {
    setIsCallButtonDisabled(true);
    setIsHangupButtonDisabled(false);

    console.log('Starting call...');

    //สร้าง Peer
    peerConnectionRef.current = new RTCPeerConnection(peerConnectionConfig);
    peerConnectionRef.current.oniceconnectionstatechange = () => {
      const state = peerConnectionRef.current?.iceConnectionState;
      console.log("ICE Connection State Changed:", state);

      if (state === 'failed' || state === 'disconnected') {
        console.error("Disconnected");
      }
      if (state === 'connected') {
        console.log("Connected");
      }
    };

    peerConnectionRef.current.onsignalingstatechange = () => {
      if (peerConnectionRef.current) {
        console.log("Signaling State:", peerConnectionRef.current.signalingState);
      }
    };
    //เอาจอคนไข้มาใส่ไว้
    peerConnectionRef.current.ontrack = (event) => {
      console.log("ได้รับภาพจากฝั่งคนไข้แล้ว", event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      } else {
        console.error("หา remoteVideoRef ไม่เจอ");
      }
    };

    //ICE เจอ ip ฝั่งนี้แล้วก็ส่ง candidate ไปหาอีกฝั่งผ่าน socket
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("candidate", { candidate: event.candidate, roomId: ROOM_ID });
        console.log('New ICE candidate:', event.candidate);
      }
    };

    //เอากล้องเราใส่เข้าไปตอนโทร
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnectionRef.current?.addTrack(track, localStreamRef.current as MediaStream);
      });
    }

    //สร้าง Offer จำไว้แล้วก็ส่งผ่าน socket     
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socketRef.current?.emit("offer", { offer, roomId: ROOM_ID });
    } catch (err) {
      console.error(err);
    }
  };

  // ปุ่ม Hang Up: วางสาย
  const handleHangup = () => {
    // ปิด Connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Reset ปุ่ม
    setIsCallButtonDisabled(false);
    setIsHangupButtonDisabled(true);
    console.log('Call ended.');
  };

  // Cleanup: ปิดกล้องเมื่อปิดหน้าเว็บ
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Realtime communication with WebRTC</h1>

      <div className="flex gap-4 mb-4">
        {/* เปิดกล้องตัวเอง */}
        <div className="border border-gray-300 rounded overflow-hidden">
          <p className="bg-gray-100 p-2 text-center">Local Video</p>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-[300px] h-[225px] bg-black"
          />
        </div>

        {/* กล้องคนอีกฝั่ง */}
        <div className="border border-gray-300 rounded overflow-hidden">
          <p className="bg-gray-100 p-2 text-center">Remote Video</p>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted
            className="w-[300px] h-[225px] bg-black"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleStart}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          Start
        </button>

        <button
          onClick={handleCall}
          disabled={isCallButtonDisabled}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Call
        </button>

        <button
          onClick={handleHangup}
          disabled={isHangupButtonDisabled}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
        >
          Hang Up
        </button>
      </div>
    </div>
  );
}