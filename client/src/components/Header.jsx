import React from 'react'
import { Shield, Wifi, WifiOff } from 'lucide-react'

const Header = ({ isConnected }) => {
  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-white" />
            <h1 className="text-xl font-bold text-white">InsureBot Quest 2025</h1>
          </div>
          
          <div className="flex items-center">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              isConnected 
                ? 'bg-green-500/20 text-green-100' 
                : 'bg-red-500/20 text-red-100'
            }`}>
              {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 