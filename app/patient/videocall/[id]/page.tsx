"use client"

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  MessageSquare, Settings, Layout, Users,
  Send, Activity, Heart, Info, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { io, Socket } from 'socket.io-client';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function VideoCallPage() {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const params = useParams();
  const { id: roomId } = params;

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const ROOM_ID = roomId;
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
  const TURN_USERNAME = process.env.NEXT_PUBLIC_METERED_USERNAME;
  const TURN_PASSWORD = process.env.NEXT_PUBLIC_METERED_PASSWORD;
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const router = useRouter();

  const toggleMic = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    router.push('/patient/treatment_record');
  };

  const peerConnectionConfig = {
    iceServers: [
      {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:standard.relay.metered.ca:80",
        username: TURN_USERNAME,
        credential: TURN_PASSWORD,
      },
      {
        urls: "turn:standard.relay.metered.ca:80?transport=tcp",
        username: TURN_USERNAME,
        credential: TURN_PASSWORD,
      },
      {
        urls: "turn:standard.relay.metered.ca:443",
        username: TURN_USERNAME,
        credential: TURN_PASSWORD,
      },
      {
        urls: "turns:standard.relay.metered.ca:443?transport=tcp",
        username: TURN_USERNAME,
        credential: TURN_PASSWORD,
      },
    ]
  };

  useEffect(() => {
    if (!ROOM_ID) return;

    // 🔒 สร้างตัวแปร Local เพื่อคุมการเกิด/ดับ ของ Effect รอบนี้โดยเฉพาะ
    const socket = io(SOCKET_URL);
    const pc = new RTCPeerConnection(peerConnectionConfig);

    // อัปเดต Ref ให้คนอื่นใช้ (แต่เราจะไม่ใช้ Ref ในการ Cleanup)
    socketRef.current = socket;
    peerConnectionRef.current = pc;

    const initWebRTC = async () => {
      try {
        // 1. Prepare Stream
        let stream = localStreamRef.current;
        if (!stream) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          localStreamRef.current = stream;
        }
        if (pc.signalingState === 'closed') {
          console.warn("⚠️ Connection closed while loading camera. Aborting.");
          return;
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // ใส่ Stream เข้า PC
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // 2. Setup Events
        socket.emit("join_room", ROOM_ID); // ใช้ตัวแปร socket local

        // ---------------- Events ----------------

        // เมื่อมีคนอื่นเข้ามา -> เราเป็นคนโทร (Offerer)
        socket.on("user_joined", async (userId) => {
          // 🛡️ กันตัวเอง: ถ้า userId คือตัวเราเอง ให้ข้าม (เผื่อ Server เอ๋อ)
          if (userId === socket.id) return;

          console.log("🔔 User Joined -> I am calling.");

          // เช็คว่า PC พร้อมไหม
          if (pc.signalingState !== "stable") return;

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { offer, roomId: ROOM_ID });
        });

        // เมื่อได้รับ Offer -> เราเป็นคนรับ (Answerer)
        socket.on("offer", async (offer) => {
          // 🛡️ ถ้าเราเป็นคนโทรออกเองอยู่แล้ว (Glare) ให้หยุด หรือ Reset
          if (pc.signalingState !== "stable") {
            console.warn("⚠️ Collision detected. Ignore/Reset.");
            return;
          }

          console.log("📩 Received Offer -> Answering.");
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { answer, roomId: ROOM_ID });
        });

        socket.on("answer", async (answer) => {
          console.log("✅ Received Answer");
          if (pc.signalingState !== "stable") { // เช็คก่อน set
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socket.on("candidate", async (candidate) => {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        // PC Events
        pc.ontrack = (event) => {
          console.log("🎥 Stream Received");
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setHasRemoteVideo(true);
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("candidate", { candidate: event.candidate, roomId: ROOM_ID });
          }
        };

      } catch (err) {
        console.error(err);
      }
    };

    initWebRTC();

    // 🧹 CLEANUP (จุดสำคัญที่สุด!)
    return () => {
      console.log("🧹 Cleanup old connection...");

      // สั่งปิดตัวแปร Local ที่สร้างในรอบนี้แน่ๆ
      socket.disconnect();
      pc.close();

      // (Optional) ล้าง Ref
      // socketRef.current = null;
    };
  }, [ROOM_ID]);

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden font-sans text-slate-100">

      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/70 to-transparent flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-1 rounded-lg backdrop-blur-md">
              <Avatar className="h-10 w-10 border-2 border-green-500">
                <AvatarImage src="/doctor.png" />
                <AvatarFallback className="text-slate-900 font-bold bg-white">DR</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="font-bold text-lg text-white drop-shadow-md">นพ. วิชัย ใจดี</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-500/80 text-white hover:bg-green-500 border-0">
                  Online
                </Badge>
                <span className="text-xs text-slate-300 drop-shadow-md">00:12:45</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 bg-slate-900 w-full">

          {/* -------------------- 1. ฝั่งคู่สนทนา (Remote) -------------------- */}
          <div className="flex-1 aspect-video relative bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            {/* <div className="absolute inset-0 flex items-center justify-center -z-10">
              <p className="text-slate-500 animate-pulse">กำลังรับสัญญาณภาพ...</p>
              </div> */}

            <video
              ref={remoteVideoRef}
              autoPlay
              onCanPlay={() => setHasRemoteVideo(true)}
              onWaiting={() => setHasRemoteVideo(false)}
              playsInline
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-white text-sm">
              คู่สนทนา
            </div>
          </div>

          {/* -------------------- 2. ฝั่งเรา (Local) -------------------- */}
          <div
            className="relative bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg w-full aspect-video md:absolute md:w-[260px] md:bottom-6 md:right-6 md:z-20 lg:w-[320px] lg:bottom-8 lg:right-8">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : 'block'}`}
            />

            {isCameraOff && (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center flex-col">
                <VideoOff className="h-12 w-12 text-red-500 mb-2" />
                <span className="text-sm text-slate-500">กล้องปิดอยู่</span>
              </div>
            )}

            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-white text-sm">
              คุณ
            </div>
          </div>

        </div>

        {/* Bottom Control Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-700 shadow-2xl">
          <ControlButton
            active={isMuted}
            onClick={toggleMic}
            onIcon={<MicOff />}
            offIcon={<Mic />}
            danger={isMuted}
          />
          <ControlButton
            active={isCameraOff}
            onClick={toggleCamera}
            onIcon={<VideoOff />}
            offIcon={<Video />}
            danger={isCameraOff}
          />

          <div className="w-px h-8 bg-slate-700 mx-2"></div>

          <Button
            size="lg"
            onClick={endCall}
            className="rounded-full h-12 w-16 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>

        </div>

      </div>

    </div>
  );
}

// Helper Components
const ControlButton = ({ active, onClick, onIcon, offIcon, danger }) => (
  <Button
    variant={danger ? "destructive" : "secondary"}
    size="icon"
    className={`rounded-full h-12 w-12 transition-all duration-200 ${!danger && active ? 'bg-slate-700 text-white' : ''
      } ${!danger && !active ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : ''}`}
    onClick={onClick}
  >
    {active ? onIcon : offIcon}
  </Button>
);

const VitalBox = ({ label, value, unit }) => (
  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="font-bold text-lg text-white">{value} <span className="text-[10px] text-slate-500 font-normal">{unit}</span></p>
  </div>
);