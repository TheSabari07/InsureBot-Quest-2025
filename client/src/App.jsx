import React, { useState, useEffect, useRef } from 'react'
import VoiceChat from './components/VoiceChat'
import ChatInterface from './components/ChatInterface'
import Header from './components/Header'
import './App.css'

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkServerHealth()
  }, [])

  const checkServerHealth = async () => {
    try {
      const response = await fetch('/api/health')
      if (response.ok) {
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Server connection failed:', error)
      setIsConnected(false)
    }
  }

  const handleNewMessage = async (message, isVoice = false) => {
    if (!message.trim()) return

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
      isVoice
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          conversationId
        })
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          latency: data.latency
        }

        setMessages(prev => [...prev, botMessage])
        setConversationId(data.conversationId)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearConversation = () => {
    setMessages([])
    setConversationId(null)
  }

  return (
    <div className="app">
      <Header isConnected={isConnected} />
      
      <main className="main-content">
        <div className="chat-container">
          <ChatInterface 
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleNewMessage}
            onClearConversation={clearConversation}
          />
          
          <VoiceChat 
            onVoiceMessage={handleNewMessage}
            isConnected={isConnected}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  )
}

export default App 