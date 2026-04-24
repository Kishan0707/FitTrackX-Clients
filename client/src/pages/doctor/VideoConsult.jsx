/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaPaperPlane,
  FaExpand,
  FaCompress,
  FaComment,
  FaTimes,
  FaUser,
  FaClock,
} from "react-icons/fa";
import { BsCameraVideoFill } from "react-icons/bs";
import { IoMdSettings } from "react-icons/io";
import DashboardLayout from "../../layout/DashboardLayout";

export default function VideoConsult() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const localRef = useRef();
  const remoteRef = useRef();
  const peerRef = useRef();
  const chatEndRef = useRef();

  const [appointment, setAppointment] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState("connecting");
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    fetchAppointment();
  }, []);

  useEffect(() => {
    let interval;
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchAppointment = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/appointment/${appointmentId}`,
      );
      const data = await res.json();
      setAppointment(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!appointment) return;

    const s = io("http://localhost:5000", {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    setSocket(s);
    startCall(s, appointment.roomId);

    return () => s.disconnect();
  }, [appointment]);

  const startCall = async (socket, roomId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      localRef.current.srcObject = stream;

      const iceServers = await fetch(
        "http://localhost:5000/api/webrtc/ice",
      ).then((r) => r.json());

      const peer = new RTCPeerConnection({ iceServers });
      peerRef.current = peer;

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.ontrack = (e) => {
        remoteRef.current.srcObject = e.streams[0];
        setCallStatus("connected");
      };

      socket.emit("join-call", { roomId });

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit("offer", { offer, roomId });

      socket.on("offer", async (offer) => {
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("answer", { answer, roomId });
      });

      socket.on("answer", async (answer) => {
        await peer.setRemoteDescription(answer);
      });

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            candidate: e.candidate,
            roomId,
          });
        }
      };

      socket.on("ice-candidate", async (candidate) => {
        await peer.addIceCandidate(candidate);
      });

      socket.on("chat", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on("call-ended", () => {
        endCall();
      });

      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setTimeout(() => {
            new Notification("🎥 Call Started", {
              body: "Video consultation is now active",
            });
          }, 1000);
        }
      });
    } catch (err) {
      console.error("Call start error:", err);
      setCallStatus("error");
    }
  };

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff((prev) => !prev);
    }
  }, [localStream]);

  const sendMessage = () => {
    if (!text.trim()) return;

    socket?.emit("chat", {
      roomId: appointment?.roomId,
      message: text,
      sender: "doctor",
      timestamp: Date.now(),
    });

    setMessages((prev) => [...prev, { message: text, sender: "doctor" }]);
    setText("");
  };

  const endCall = useCallback(() => {
    localStream?.getTracks().forEach((track) => track.stop());
    peerRef.current?.close();
    socket?.emit("end-call", { roomId: appointment?.roomId });
    navigate("/doctor");
  }, [localStream, socket, appointment, navigate]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <DashboardLayout>
      <div className='relative h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'>
        {/* Animated Background */}
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-orange-500/10 blur-3xl'></div>
          <div className='absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-blue-500/10 blur-3xl'></div>
          <div className='absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-3xl'></div>
        </div>

        {/* Main Content */}
        <div className='relative z-10 flex h-full flex-col p-4'>
          {/* Header Bar */}
          <div className='mb-4 flex items-center justify-between rounded-2xl border border-slate-800/50 bg-slate-900/50 p-4 backdrop-blur-xl'>
            <div className='flex items-center gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25'>
                <BsCameraVideoFill className='text-2xl text-white' />
              </div>
              <div>
                <h1 className='text-xl font-bold text-white'>
                  Video Consultation
                </h1>
                <div className='flex items-center gap-2 text-sm text-slate-400'>
                  <FaClock className='text-xs' />
                  <span>{formatTime(callDuration)}</span>
                  <span className='mx-2'>•</span>
                  <span className='capitalize'>
                    {appointment?.type || "Consultation"}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div
                className={`flex items-center gap-2 rounded-full px-4 py-2 ${
                  callStatus === "connected" ? "bg-green-500/20 text-green-400"
                  : callStatus === "connecting" ?
                    "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
                }`}>
                <div
                  className={`h-2 w-2 rounded-full ${
                    callStatus === "connected" ? "bg-green-400 animate-pulse"
                    : callStatus === "connecting" ?
                      "bg-yellow-400 animate-pulse"
                    : "bg-red-400"
                  }`}></div>
                <span className='text-sm font-medium capitalize'>
                  {callStatus}
                </span>
              </div>

              <button
                onClick={toggleFullscreen}
                className='rounded-xl bg-slate-800/50 p-3 text-slate-300 transition hover:bg-slate-800 hover:text-white'>
                {isFullscreen ?
                  <FaCompress />
                : <FaExpand />}
              </button>
            </div>
          </div>

          {/* Video Area */}
          <div className='relative flex-1 overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-950'>
            {/* Remote Video (Full) */}
            <video
              ref={remoteRef}
              autoPlay
              className='h-full w-full object-cover'
              style={{ transform: "scaleX(-1)" }}
            />

            {/* Remote Video Placeholder */}
            {callStatus !== "connected" && (
              <div className='absolute inset-0 flex items-center justify-center bg-slate-950'>
                <div className='text-center'>
                  <div className='mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-700 animate-pulse'>
                    <FaUser className='text-6xl text-slate-600' />
                  </div>
                  <p className='text-lg font-semibold text-slate-400'>
                    {callStatus === "connecting" ?
                      "Connecting..."
                    : "Waiting for patient to join"}
                  </p>
                  <div className='mt-4 flex justify-center gap-1'>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className='h-2 w-2 animate-bounce rounded-full bg-orange-500'
                        style={{ animationDelay: `${i * 0.15}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Local Video (PiP) */}
            <div className='group absolute bottom-4 right-4 h-48 w-36 overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-900 shadow-2xl transition-all duration-300 hover:scale-110 hover:border-orange-500'>
              <video
                ref={localRef}
                autoPlay
                muted
                className={`h-full w-full object-cover ${isVideoOff ? "hidden" : ""}`}
                style={{ transform: "scaleX(-1)" }}
              />
              {isVideoOff && (
                <div className='flex h-full items-center justify-center bg-slate-800'>
                  <FaVideoSlash className='text-4xl text-slate-600' />
                </div>
              )}
              <div className='absolute bottom-2 left-2 rounded-lg bg-black/50 px-2 py-1 backdrop-blur'>
                <p className='text-xs text-white'>You</p>
              </div>
            </div>

            {/* Chat Toggle Button */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className='absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-slate-800/90 px-4 py-3 text-white backdrop-blur transition hover:bg-slate-700'>
              <FaComment />
              <span className='text-sm font-medium'>Chat</span>
              {messages.length > 0 && (
                <span className='flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold'>
                  {messages.length}
                </span>
              )}
            </button>
          </div>

          {/* Controls Bar */}
          <div className='mt-4 flex items-center justify-center gap-3'>
            <button
              onClick={toggleMute}
              className={`group relative rounded-2xl p-4 transition-all duration-300 ${
                isMuted ?
                  "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "bg-slate-800/50 text-white hover:bg-slate-800"
              }`}>
              {isMuted ?
                <FaMicrophoneSlash size={20} />
              : <FaMicrophone size={20} />}
              <span className='absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded-lg bg-slate-800 px-2 py-1 text-xs text-white transition group-hover:scale-100'>
                {isMuted ? "Unmute" : "Mute"}
              </span>
            </button>

            <button
              onClick={toggleVideo}
              className={`group relative rounded-2xl p-4 transition-all duration-300 ${
                isVideoOff ?
                  "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "bg-slate-800/50 text-white hover:bg-slate-800"
              }`}>
              {isVideoOff ?
                <FaVideoSlash size={20} />
              : <FaVideo size={20} />}
              <span className='absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded-lg bg-slate-800 px-2 py-1 text-xs text-white transition group-hover:scale-100'>
                {isVideoOff ? "Turn On" : "Turn Off"}
              </span>
            </button>

            <button
              onClick={endCall}
              className='group relative rounded-2xl bg-gradient-to-r from-red-500 to-red-600 p-4 text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-110 hover:from-red-600 hover:to-red-700'>
              <FaPhoneSlash size={20} />
              <span className='absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded-lg bg-slate-800 px-2 py-1 text-xs text-white transition group-hover:scale-100'>
                End Call
              </span>
            </button>

            <button className='group relative rounded-2xl bg-slate-800/50 p-4 text-white transition-all duration-300 hover:bg-slate-800'>
              <IoMdSettings size={20} />
              <span className='absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded-lg bg-slate-800 px-2 py-1 text-xs text-white transition group-hover:scale-100'>
                Settings
              </span>
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div
          className={`absolute right-0 top-0 z-20 flex h-full w-96 transform flex-col rounded-l-2xl border-l border-slate-800/50 bg-slate-900/95 backdrop-blur-xl transition-transform duration-500 ${
            isChatOpen ? "translate-x-0" : "translate-x-full"
          }`}>
          {/* Chat Header */}
          <div className='flex items-center justify-between border-b border-slate-800 p-4'>
            <h3 className='text-lg font-bold text-white'>Chat</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className='rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white'>
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div className='flex-1 space-y-3 overflow-y-auto p-4'>
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === "doctor" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    m.sender === "doctor" ?
                      "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                    : "bg-slate-800 text-slate-200"
                  }`}>
                  <p className='text-sm'>{m.message}</p>
                  <p className='mt-1 text-right text-xs opacity-70'>
                    {m.timestamp ?
                      new Date(m.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className='border-t border-slate-800 p-4'>
            <div className='flex gap-2'>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder='Type a message...'
                className='flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none'
              />
              <button
                onClick={sendMessage}
                className='rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-white transition hover:from-orange-600 hover:to-orange-700'>
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>

        {/* Overlay when chat is open */}
        {isChatOpen && (
          <div
            className='absolute inset-0 z-10 bg-black/20 backdrop-blur-sm'
            onClick={() => setIsChatOpen(false)}></div>
        )}
      </div>
    </DashboardLayout>
  );
}
