import React, { useState, useRef, useEffect } from 'react'
import { Send, Trash2, User, Bot } from 'lucide-react'

const ChatInterface = ({ messages, isLoading, onSendMessage, onClearConversation }) => {
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim())
      setInputMessage('')
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Insurance Assistant</h2>
        <button
          onClick={onClearConversation}
          className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
          <span className="text-sm">Clear Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Welcome to InsureBot!</p>
            <p className="text-sm">Ask me anything about insurance policies, claims, or coverage.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className={`rounded-2xl px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.isError
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm">{message.text}</p>
                  <div className={`flex items-center justify-between mt-1 ${
                    message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    <span className="text-xs">{formatTime(message.timestamp)}</span>
                    {message.latency && (
                      <span className="text-xs ml-2">
                        {message.latency}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot size={16} className="text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your insurance question..."
            className="flex-1 input-field"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatInterface 