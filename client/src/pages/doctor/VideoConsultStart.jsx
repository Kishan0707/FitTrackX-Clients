import { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhone,
  FaSignOutAlt,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";
import socket from "../../socket/socket";

const VideoConsultStart = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState("connecting");
  const [error, setError] = useState("");

  // STUN servers for WebRTC
  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    if (!appointmentId || !user) return;

    const startCall = async () => {
      try {
        // 1. Get appointment details
        const aptRes = await API.get(`/doctor/appointments/${appointmentId}`);
        const appointment = aptRes.data.data;

        // 2. Get remote user (patient) ID
        const remoteUserId = appointment.patientId?._id;
        if (!remoteUserId) {
          throw new Error("Patient not found");
        }

        // 3. Request media permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 4. Create RTCPeerConnection
        const pc = new RTCPeerConnection(configuration);
        peerConnectionRef.current = pc;

        // Add local tracks
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream
        pc.ontrack = (event) => {
          remoteStreamRef.current = event.streams[0];
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setCallStatus("connected");
        };

        // ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              target: remoteUserId,
              candidate: event.candidate,
              appointmentId,
            });
          }
        };

        // 5. Connect to signaling server
        socket.emit("join-video-call", {
          appointmentId,
          userId: user._id,
        });

        // 6. Create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // 7. Send offer to remote user via socket
        socket.emit("video-offer", {
          target: remoteUserId,
          offer,
          appointmentId,
        });

        // Listen for answer
        socket.on("video-answer", async ({ answer }) => {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        // Listen for ICE candidates from remote
        socket.on("ice-candidate-received", async ({ candidate }) => {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(candidate),
            );
          }
        });

        // Listen for end call
        socket.on("end-video-call", () => {
          endCall();
        });

        // Call duration timer
        const timer = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);

        return () => {
          clearInterval(timer);
        };
      } catch (err) {
        console.error("Failed to start video call:", err);
        setError("Failed to start video call: " + err.message);
        setCallStatus("failed");
      }
    };

    startCall();

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      socket.off("video-answer");
      socket.off("ice-candidate-received");
      socket.off("end-video-call");
    };
  }, [appointmentId, user]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const endCall = () => {
    // Notify remote user
    const appointment = searchParams.get("appointmentId");
    socket.emit("end-video-call", { appointmentId: appointment || appointmentId });

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    navigate("/doctor/appointments");
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <DashboardLayout>
      <div className='relative h-[calc(100vh-4rem)] bg-slate-950'>
        {/* Remote Video (Fullscreen) */}
        <div className='h-full w-full'>
          {remoteStreamRef.current ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              className='h-full w-full object-cover'
            />
          ) : (
            <div className='flex h-full items-center justify-center'>
              <div className='text-center'>
                <FaVideo className='mx-auto mb-4 text-6xl text-slate-600' />
                <p className='text-slate-500'>
                  {callStatus === "connecting"
                    ? "Connecting to patient..."
                    : "Waiting for video..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className='absolute right-4 bottom-24 h-40 w-56 overflow-hidden rounded-2xl border-2 border-slate-600 bg-slate-900 shadow-lg'>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className={`h-full w-full object-cover ${
              isVideoOff ? "hidden" : ""
            }`}
          />
          {isVideoOff && (
            <div className='flex h-full items-center justify-center bg-slate-800'>
              <FaVideoSlash className='text-3xl text-slate-500' />
            </div>
          )}
        </div>

        {/* Call Info Overlay */}
        {callStatus === "connected" && (
          <div className='absolute left-4 top-4 rounded-lg bg-black/50 px-3 py-1 text-sm text-white'>
            {formatDuration(callDuration)}
          </div>
        )}

        {/* Controls */}
        <div className='absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent p-6'>
          <button
            onClick={toggleMute}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition ${
              isMuted
                ? "bg-red-500 text-white"
                : "bg-slate-700 text-white hover:bg-slate-600"
            }`}>
            {isMuted ? <FaMicrophoneSlash size={24} /> : <FaMicrophone size={24} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition ${
              isVideoOff
                ? "bg-red-500 text-white"
                : "bg-slate-700 text-white hover:bg-slate-600"
            }`}>
            {isVideoOff ? <FaVideoSlash size={24} /> : <FaVideo size={24} />}
          </button>

          <button
            onClick={endCall}
            className='flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700'>
            <FaPhone size={24} className='rotate-135' />
          </button>

          <button className='flex h-14 w-14 items-center justify-center rounded-full bg-slate-700 text-white transition hover:bg-slate-600'>
            {isRemoteMuted ? <FaVolumeMute size={24} /> : <FaVolumeUp size={24} />}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-red-500/90 px-6 py-3 text-white'>
            {error}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VideoConsultStart;
