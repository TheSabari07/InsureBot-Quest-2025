import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Play, Square } from 'lucide-react'

const VoiceChat = ({ onVoiceMessage, isConnected, isLoading }) => {
  const [isListening, setIsListening] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioUrl, setAudioUrl] = useState(null)
  const [error, setError] = useState('')
  
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setError('')
      }

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        setTranscript(finalTranscript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setError('Speech recognition failed. Please try again.')
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        if (transcript.trim()) {
          onVoiceMessage(transcript, true)
          setTranscript('')
        }
      }
    } else {
      setError('Speech recognition not supported in this browser.')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [transcript, onVoiceMessage])

  const startListening = () => {
    if (recognitionRef.current && !isLoading) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const playAudio = async (text) => {
    if (!text.trim() || isPlaying) return

    try {
      setIsPlaying(true)
      setError('')

      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        if (audioRef.current) {
          audioRef.current.src = url
          audioRef.current.play()
        }
      } else {
        throw new Error('Failed to generate speech')
      }
    } catch (err) {
      console.error('TTS error:', err)
      setError('Failed to generate speech. Please try again.')
    } finally {
      setIsPlaying(false)
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsPlaying(false)
      }
    }
  }, [])

  return (
    <div className="bg-gray-50 border-t border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!isConnected || isLoading}
            className={`p-3 rounded-full transition-all duration-200 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              {isListening ? 'Listening...' : 'Voice Input'}
            </span>
            {isListening && (
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={isPlaying ? stopAudio : () => playAudio('Hello! I am your insurance assistant. How can I help you today?')}
            disabled={!isConnected || isLoading}
            className={`p-2 rounded-lg transition-colors ${
              isPlaying
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPlaying ? <Square size={16} /> : <Volume2 size={16} />}
          </button>
          <span className="text-xs text-gray-500">Test Voice</span>
        </div>
      </div>

      {transcript && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">You said:</span> {transcript}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <audio ref={audioRef} className="hidden" />
    </div>
  )
}

export default VoiceChat 