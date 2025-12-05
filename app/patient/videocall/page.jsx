"use client"

import React, { useState } from 'react';
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

export default function VideoCallPage() {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");

  const [messages, setMessages] = useState([
    { sender: 'doctor', text: 'สวัสดีครับ ได้ยินหมอชัดเจนไหมครับ?', time: '14:00' },
    { sender: 'me', text: 'ได้ยินครับคุณหมอ', time: '14:01' },
  ]);
  const [inputText, setInputText] = useState("");

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-100">
      
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

        <div className="flex-1 flex items-center justify-center bg-slate-900 relative">
          {/* Placeholder for Video Stream */}
          <div className="text-center">
            <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-slate-700">
               <AvatarFallback className="text-4xl bg-slate-800 text-slate-500">Video</AvatarFallback>
            </Avatar>
            <p className="text-slate-500 animate-pulse">กำลังรับสัญญาณภาพ...</p>
          </div>

          <div className="absolute bottom-24 right-6 w-48 h-36 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden z-20">
             {!isCameraOff ? (
               <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                 <span className="text-xs text-slate-400">Your Video</span>
               </div>
             ) : (
               <div className="w-full h-full bg-slate-800 flex items-center justify-center flex-col">
                 <VideoOff className="h-6 w-6 text-red-500 mb-1"/>
                 <span className="text-xs text-slate-500">กล้องปิดอยู่</span>
               </div>
             )}
             <div className="absolute bottom-2 left-2 text-[10px] bg-black/50 px-2 py-0.5 rounded text-white">
               คุณ
             </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-700 shadow-2xl">
          <ControlButton 
            active={isMuted} 
            onClick={() => setIsMuted(!isMuted)} 
            onIcon={<MicOff />} 
            offIcon={<Mic />} 
            danger={isMuted}
          />
          <ControlButton 
            active={isCameraOff} 
            onClick={() => setIsCameraOff(!isCameraOff)} 
            onIcon={<VideoOff />} 
            offIcon={<Video />} 
            danger={isCameraOff}
          />
          
          <div className="w-px h-8 bg-slate-700 mx-2"></div>

          <Button 
            size="lg" 
            className="rounded-full h-12 w-16 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>

          <div className="w-px h-8 bg-slate-700 mx-2"></div>

          <ControlButton 
            active={false} 
            onClick={() => {}} 
            offIcon={<Settings />} 
          />
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
    className={`rounded-full h-12 w-12 transition-all duration-200 ${
      !danger && active ? 'bg-slate-700 text-white' : ''
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