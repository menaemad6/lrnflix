
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  Grid3X3, 
  FileText, 
  Users, 
  Bell,
  ChevronDown,
  Instagram,
  Linkedin,
  Youtube,
  Play,
  ArrowRight
} from 'lucide-react';

const UltraModernLanding = () => {
  const [activeNav, setActiveNav] = useState('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 relative overflow-hidden">
      {/* Top Navigation */}
      <nav className="absolute top-6 right-6 z-50">
        <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
          <button 
            onClick={() => setActiveNav('home')}
            className={`p-2 rounded-full transition-all ${activeNav === 'home' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Home className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setActiveNav('grid')}
            className={`p-2 rounded-full transition-all ${activeNav === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setActiveNav('docs')}
            className={`p-2 rounded-full transition-all ${activeNav === 'docs' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FileText className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setActiveNav('users')}
            className={`p-2 rounded-full transition-all ${activeNav === 'users' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Users className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setActiveNav('notifications')}
            className={`p-2 rounded-full transition-all ${activeNav === 'notifications' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Main Grid Layout */}
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* LEFT COLUMN - Main Hero Panel (65%) */}
        <div className="lg:col-span-2 relative">
          {/* Products Dropdown */}
          <div className="absolute top-0 left-0 z-30">
            <Button
              variant="outline"
              className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border-0 text-gray-700 hover:bg-white"
            >
              Products
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Hero Image with Title Overlay */}
          <div className="relative h-[500px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl">
            {/* Biotech Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iaGV4IiB4PSIwIiB5PSIwIiB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTQgMCBMIDIxIDcgTCAyMSAyMSBMIDE0IDI4IEwgNyAyMSBMIDcgNyBaIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2hleCkiLz48L3N2Zz4=')] opacity-30"></div>
            
            {/* Cellular Structure Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20"></div>
            
            {/* Title Overlay */}
            <div className="absolute top-16 left-8 z-20">
              <h1 className="text-white font-bold leading-tight">
                <div className="text-5xl lg:text-6xl">EcoSynthesis</div>
                <div className="text-5xl lg:text-6xl">Biotech</div>
                <div className="text-5xl lg:text-6xl">Solutions</div>
              </h1>
            </div>

            {/* Floating Research Card */}
            <div className="absolute top-8 right-8 z-20">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                    <div className="w-8 h-8 bg-black rounded-full opacity-20"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Research and</div>
                    <div className="text-sm font-medium text-gray-900">Expertise</div>
                  </div>
                  <button className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Stats Overlay */}
            <div className="absolute bottom-8 left-8 z-20">
              <div className="flex space-x-12">
                <div className="text-white">
                  <div className="text-4xl font-bold">18M</div>
                  <div className="text-sm opacity-80">Biotech Solutions Deployed</div>
                </div>
                <div className="text-white">
                  <div className="text-4xl font-bold">12K</div>
                  <div className="text-sm opacity-80">Sustainable Innovations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="mt-6 space-y-6">
            {/* Description Card */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-6">
                <p className="text-gray-700 text-base leading-relaxed">
                  Our innovative solutions drive advancements in molecular and environmental biotech. From 
                  waste bio-remediation to cutting-edge bio-material development, we empower industries to 
                  integrate sustainable and high-performance technologies.
                </p>
              </CardContent>
            </Card>

            {/* CTA Button */}
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-6 rounded-full text-lg font-semibold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all">
              Discover Solutions
            </Button>

            {/* Social and Team Section */}
            <div className="flex items-center justify-between">
              {/* Social Icons */}
              <div className="flex space-x-4">
                <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
                  <Instagram className="h-5 w-5 text-gray-700" />
                </button>
                <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
                  <Linkedin className="h-5 w-5 text-gray-700" />
                </button>
                <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
                  <Youtube className="h-5 w-5 text-gray-700" />
                </button>
              </div>

              {/* Team Section */}
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white"></div>
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-white"></div>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-gray-700 font-medium">Meet our team</span>
                <button className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Sidebar Panel (35%) */}
        <div className="space-y-6">
          {/* Top Green Card */}
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 rounded-3xl shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">
                Advancing Biotechnology Innovation
              </h2>
              <p className="text-emerald-800 mb-6 leading-relaxed">
                Transforming industries through cutting-edge biotech solutions, 
                we drive sustainability and efficiency for a better future.
              </p>
              <Button 
                variant="outline" 
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-full px-6 py-3"
              >
                Learn More
              </Button>
            </CardContent>
          </Card>

          {/* Video Preview Card */}
          <Card className="bg-gradient-to-br from-gray-100 to-gray-200 border-0 rounded-3xl shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-48 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZm9hbSIgeD0iMCIgeT0iMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxNSIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNmb2FtKSIvPjwvc3ZnPg==')] opacity-30"></div>
                <button className="relative w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Play className="h-6 w-6 text-gray-700 ml-1" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Dark Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-0 rounded-3xl shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Advancing Sustainable Biotech
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Our solutions harness the power of biotechnology to 
                create sustainable innovations, enhancing both environmental 
                impact and industry practices.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UltraModernLanding;
