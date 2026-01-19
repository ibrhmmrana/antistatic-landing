"use client";

import { Sparkles, Zap, Search, Globe, MessageSquare, Image as ImageIcon } from "lucide-react";

interface AIAgentLoadingScreenProps {
  businessName: string;
}

export default function AIAgentLoadingScreen({ businessName }: AIAgentLoadingScreenProps) {
  const agents = [
    { icon: Search, label: "Search Visibility Agent", color: "text-blue-500" },
    { icon: Globe, label: "Website Analysis Agent", color: "text-green-500" },
    { icon: MessageSquare, label: "Social Media Agent", color: "text-purple-500" },
    { icon: ImageIcon, label: "Visual Content Agent", color: "text-orange-500" },
    { icon: Zap, label: "Performance Agent", color: "text-yellow-500" },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-6 text-center">
        {/* Main Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping" />
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-6">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Deploying AI Agents
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Analyzing <span className="font-semibold text-blue-600">{businessName}</span>'s online presence
        </p>

        {/* Agent List */}
        <div className="space-y-4 mb-8">
          {agents.map((agent, idx) => {
            const Icon = agent.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200 shadow-sm"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${idx * 200}ms forwards`,
                  opacity: 0,
                }}
              >
                <div className={`${agent.color} flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{agent.label}</div>
                  <div className="text-sm text-gray-500">Initializing...</div>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
            );
          })}
        </div>

        {/* Status Message */}
        <p className="text-sm text-gray-500">
          Our AI agents are scanning every aspect of your online presence
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
