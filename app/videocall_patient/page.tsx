'use client' // จำเป็นมาก เพราะ WebRTC ใช้ window/navigator

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client'; // import เพิ่ม

export default function VideoCallPatientPage() {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const [isCallButtonDisabled, setIsCallButtonDisabled] = useState(true);
    const [isHangupButtonDisabled, setIsHangupButtonDisabled] = useState(true);
    const [isMuted, setIsMuted] = useState(true); // เริ่มต้นเป็น true (ปิดเสียง)
    const [incomingOffer, setIncomingOffer] = useState<RTCSessionDescriptionInit | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const ROOM_ID = "room-123"; //อันนี้เป็นเลขห้อง (fix ไว้ก่อนเพื่อ test)
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

    const peerConnectionConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            {
                urls: 'turn:global.relay.metered.ca:80',
                username: '3b0efcf4646682be82fda725',
                credential: 'yo7yr1EvL5Ob1g8r',
            },
        ]
    };

    useEffect(() => {
        //ต้องต่อพอร์ต Server Port 3001
        socketRef.current = io(SOCKET_URL);

        //จอยห้องตอนเปิดเว็ป
        socketRef.current.emit("join_room", ROOM_ID);

        //ถ้าหมอโทรมาจะได้ offer มา
        socketRef.current.on("offer", (offer) => {
            console.log("Received Offer via Socket");
            setIncomingOffer(offer);
        });
        //รับ ICE มา เอาไว้หาเส้นทางเชื่อมต่อ
        socketRef.current.on("candidate", async (candidate) => {
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });
        console.log("peerConnectionConfig:", peerConnectionConfig);

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);
    //เปิดกล้องตัวเอง
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


    // วางสาย
    const handleHangup = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        setIsCallButtonDisabled(false);
        setIsHangupButtonDisabled(true);
        console.log('Call ended.');
    };

    // รับสาย
    const handleAnswer = async () => {
        if (!incomingOffer) return;
        console.log('Answering call...');
        peerConnectionRef.current = new RTCPeerConnection(peerConnectionConfig);
        peerConnectionRef.current.ontrack = (event) => {
            console.log("ได้รับภาพจากฝั่งหมอแล้ว", event.streams[0]);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            } else {
                console.error("หา remoteVideoRef ไม่เจอ");
            }
        };

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

        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current?.emit("candidate", { candidate: event.candidate, roomId: ROOM_ID });
            }
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                peerConnectionRef.current?.addTrack(track, localStreamRef.current as MediaStream);
            });
        }

        try {

            //ไม่แน่ใจแต่เหมือนว่าจะเป็นการจำ offer ของหมอ
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(incomingOffer));

            //สร้าง Answer ของฝั่งคนไข้
            const answer = await peerConnectionRef.current.createAnswer();

            //เซ็ต Answer เป็น Local Description
            await peerConnectionRef.current.setLocalDescription(answer);

            //ส่ง Answer กลับไปหาหมอ
            socketRef.current?.emit("answer", { answer, roomId: ROOM_ID });
            console.log("Sending Answer back:", answer);

            setIncomingOffer(null);
            setIsHangupButtonDisabled(false);

        } catch (err) {
            console.error("Error answering call:", err);
        }
    };
    const toggleAudio = () => {
        if (remoteVideoRef.current) {
            // สลับค่า muted ของ Video Tag (จริง)
            remoteVideoRef.current.muted = !remoteVideoRef.current.muted;
            // อัปเดต State เพื่อเปลี่ยนหน้าตาปุ่ม
            setIsMuted(remoteVideoRef.current.muted);
        }
    };
    //ปิดกล้องตอนปิดหน้าเว็บ
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
                {/*หน้าจอเรา*/}
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

                {/*หน้าจออีกฝั่ง*/}
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
            <button
                onClick={toggleAudio}
                className="absolute bottom-2 right-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-full opacity-70 hover:opacity-100 flex items-center gap-1"
            >
                {isMuted ? (
                    <>🔇 เปิดเสียง</>
                ) : (
                    <>🔊 ปิดเสียง</>
                )}
            </button>
            <div className="flex gap-2">
                {/* เปิดกล้อง */}
                <button
                    onClick={handleStart}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                >
                    Start
                </button>
                {/* วางสาย */}
                <button
                    onClick={handleHangup}
                    disabled={isHangupButtonDisabled}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
                >
                    Hang Up
                </button>
            </div>
            {/* รับสาย */}
            {incomingOffer && (
                <div className="flex items-center gap-2 bg-yellow-100 p-2 rounded border border-yellow-300">
                    <span className="text-sm font-bold text-yellow-800 animate-pulse">
                        📞 Incoming Call...
                    </span>
                    <button
                        onClick={handleAnswer}
                        className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Answer
                    </button>
                </div>
            )}
        </div>
    );
}