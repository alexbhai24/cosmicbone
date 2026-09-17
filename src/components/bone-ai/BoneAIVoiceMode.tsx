import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Mic, MicOff } from 'lucide-react';
import { aiService } from '../../services/aiService';

interface BoneAIVoiceModeProps {
  isOpen: boolean;
  onClose: () => void;
  mode: string;
}

export const BoneAIVoiceMode: React.FC<BoneAIVoiceModeProps> = ({ isOpen, onClose, mode }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('Say something...');
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('listening');
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  const startListening = () => {
    if (isMuted) return;
    if (synthesisRef.current) synthesisRef.current.cancel();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Recognition might already be running
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setStatus('listening');
          setTranscript('Say something...');
        };

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setTranscript(currentTranscript);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (status === 'listening' && transcript && transcript !== 'Say something...') {
            handleProcessSpeech(transcript);
          } else if (status === 'listening') {
            setStatus('idle');
            setTranscript('Tap mic to speak');
          }
        };

        recognitionRef.current.onerror = (e: any) => {
          console.warn('[SpeechRec] Error:', e);
          setIsListening(false);
          setStatus('idle');
          setTranscript('Tap mic to speak');
        };

        // Auto-start listening on mount
        try {
          recognitionRef.current.start();
        } catch (err) {
          // ignore
        }
      } else {
        setTranscript('Voice input not supported in this browser');
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (synthesisRef.current) synthesisRef.current.cancel();
    };
  }, [isOpen]);

  const toggleMic = () => {
    if (isMuted) {
      setIsMuted(false);
      setStatus('listening');
      setTranscript('Say something...');
      startListening();
    } else {
      setIsMuted(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (synthesisRef.current) synthesisRef.current.cancel();
      setStatus('idle');
      setTranscript('Microphone muted');
    }
  };

  const handleProcessSpeech = async (text: string) => {
    setStatus('thinking');
    setTranscript('Thinking...');

    try {
      const response = await aiService.sendMessage({
        message: text,
        mode,
        history: [],
      });

      const answer = response.answer;

      // Sanitize text for speech output
      const cleanSpeech = answer
        .replace(/<svg[\s\S]*?<\/svg>/gi, '')
        .replace(/```mermaid[\s\S]*?```/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/###/g, '')
        .replace(/##/g, '')
        .replace(/\$\$(.*?)\$\$/g, ' formula ')
        .replace(/\$(.*?)\$/g, ' formula ')
        .replace(/\[\d+\]/g, '')
        .replace(/[#*_~`]/g, '')
        .trim();

      setTranscript(cleanSpeech.length > 70 ? cleanSpeech.substring(0, 70) + '...' : cleanSpeech);
      setStatus('speaking');

      if (synthesisRef.current && !isMuted) {
        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        const voices = synthesisRef.current.getVoices();

        const naturalVoice =
          voices.find((v) => v.name.includes('Google UK English Female')) ||
          voices.find((v) => v.name.includes('Google US English')) ||
          voices.find((v) => v.lang.startsWith('en'));
        if (naturalVoice) utterance.voice = naturalVoice;

        utterance.rate = 1.05;

        utterance.onend = () => {
          setStatus('idle');
          setTranscript('Say something...');
          setTimeout(() => {
            if (!isMuted) {
              startListening();
            }
          }, 400);
        };

        synthesisRef.current.speak(utterance);
      } else {
        setTimeout(() => {
          setStatus('idle');
          setTranscript('Say something...');
        }, 3000);
      }
    } catch (err) {
      setStatus('idle');
      setTranscript('Could not connect. Tap mic to retry.');
    }
  };

  // Generate 3D spherical particle dots
  const dots = Array.from({ length: 48 }).map((_, i) => {
    const angle = (i / 48) * Math.PI * 2;
    const radius = 22 + (i % 4) * 4;
    return {
      id: i,
      x: Math.cos(angle) * radius + (Math.random() * 4 - 2),
      y: Math.sin(angle) * radius * 0.85 + (Math.random() * 4 - 2),
      size: 2.5 + (i % 3) * 1.2,
      opacity: 0.65 + (i % 4) * 0.1,
    };
  });

  const getOrbAnimation = (): any => {
    switch (status) {
      case 'listening':
        return {
          scale: [0.94, 1.08, 0.96, 1.05, 0.94],
          rotate: [0, 90, 180, 270, 360],
          transition: { duration: 6, repeat: Infinity, ease: 'linear' },
        };
      case 'thinking':
        return {
          scale: [0.9, 1.12, 0.9],
          opacity: [0.7, 1, 0.7],
          transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'speaking':
        return {
          scale: [0.95, 1.22, 1.0, 1.25, 0.95],
          rotate: [0, 180, 360],
          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
        };
      default:
        return {
          scale: [0.96, 1.04, 0.96],
          rotate: [0, 180, 360],
          transition: { duration: 10, repeat: Infinity, ease: 'linear' },
        };
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="relative w-full rounded-[22px] p-3 sm:px-4 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-[#ff8800]/25 overflow-hidden flex items-center justify-between min-h-[92px] select-none"
    >
      {/* Animated Moving Background Color Effect */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 18% 50%, #2e1608 0%, #180d06 50%, #0d0703 100%)',
            'radial-gradient(circle at 82% 50%, #351a09 0%, #1b0e06 50%, #0d0703 100%)',
            'radial-gradient(circle at 50% 25%, #2c1407 0%, #160c05 50%, #0d0703 100%)',
            'radial-gradient(circle at 50% 75%, #361b0a 0%, #190e06 50%, #0d0703 100%)',
            'radial-gradient(circle at 18% 50%, #2e1608 0%, #180d06 50%, #0d0703 100%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-[22px] pointer-events-none"
      />

      {/* Subtle moving warm ambient lighting */}
      <motion.div
        animate={{
          x: [-20, 20, -20],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-gradient-to-r from-amber-600/10 via-orange-500/20 to-amber-600/10 blur-xl pointer-events-none"
      />

      {/* 3 Icons Horizontal Layout */}
      <div className="relative z-10 w-full flex items-center justify-between gap-3">
        {/* Left: Close Button (X) */}
        <button
          type="button"
          onClick={() => {
            if (synthesisRef.current) synthesisRef.current.cancel();
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (e) {}
            }
            onClose();
          }}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#241a14]/90 hover:bg-[#33241b] border border-white/10 active:scale-95 text-[#d4c5bb] hover:text-white flex items-center justify-center transition-all flex-shrink-0 shadow-md"
          title="Close Voice Mode"
          aria-label="Close Voice Mode"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Center: Text + 3D Animated Orange Orb */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-1">
          {/* Top text prompt */}
          <motion.span
            key={transcript}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] sm:text-[13px] font-medium text-[#ffd499] drop-shadow-sm max-w-[200px] sm:max-w-xs truncate mb-1 tracking-wide"
          >
            {transcript}
          </motion.span>

          {/* 3D Animated Particle Orb */}
          <div className="relative w-14 h-12 sm:w-16 sm:h-13 flex items-center justify-center">
            <motion.div
              animate={getOrbAnimation()}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Orb core ambient glow */}
              <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-[#ff4400] to-[#ffaa00] opacity-40 blur-md" />

              {/* Orbiting / breathing particle dots */}
              {dots.map((dot) => (
                <motion.div
                  key={dot.id}
                  className="absolute rounded-full bg-gradient-to-tr from-[#ff5500] via-[#ff8800] to-[#ffbb00] shadow-[0_0_6px_rgba(255,160,50,0.8)]"
                  style={{
                    width: dot.size,
                    height: dot.size,
                    left: `calc(50% + ${dot.x}px)`,
                    top: `calc(50% + ${dot.y}px)`,
                    opacity: dot.opacity,
                  }}
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [dot.opacity, 1, dot.opacity],
                  }}
                  transition={{
                    duration: 2.2 + (dot.id % 4) * 0.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}

              {/* Inner core orange sphere */}
              <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full bg-gradient-to-b from-[#ff9900] via-[#ff6600] to-[#e63300] shadow-[0_0_16px_rgba(255,100,0,0.85)]" />
            </motion.div>
          </div>
        </div>

        {/* Right: Solid Orange-Amber Mic Button */}
        <button
          type="button"
          onClick={toggleMic}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 active:scale-95 shadow-[0_0_18px_rgba(255,140,0,0.45)] hover:scale-105 ${
            isMuted
              ? 'bg-red-500/25 text-red-300 border border-red-500/50'
              : 'bg-gradient-to-b from-[#ffb300] via-[#ff8800] to-[#ff6600] text-[#120903]'
          }`}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? (
            <MicOff className="w-5 h-5 stroke-[2.2]" />
          ) : (
            <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-[#120903] stroke-[2.4]" />
          )}
        </button>
      </div>
    </motion.div>
  );
};


