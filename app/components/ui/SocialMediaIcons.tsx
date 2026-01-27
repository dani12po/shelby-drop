/**
 * Professional Web3 Social Media Footer
 * Clean branding with social media icons
 */

'use client';

import React, { useState } from 'react';
import { X, Github, Facebook, Instagram } from 'lucide-react';

const socialLinks = [
  {
    name: 'X (Twitter)',
    url: 'https://x.com/Iq_dani26',
    icon: X,
  },
  {
    name: 'GitHub',
    url: 'https://github.com/dani12po',
    icon: Github,
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/Qolandani26',
    icon: Facebook,
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/imamqolandanii/',
    icon: Instagram,
  },
];

export function SocialMediaIcons() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-sm">
      <div className="flex items-center justify-center px-6 py-3">
        {/* Branding */}
        <div className="flex items-center gap-2 text-white/60 text-xs">
          <span>Built with</span>
          <span className="text-red-500">❤️</span>
          <span>by</span>
          <span className="text-white/80 font-medium">Dani.xyz</span>
          <span className="mx-2 text-white/40">|</span>
        </div>

        {/* Social Media Icons */}
        <div className="flex items-center gap-3">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-all duration-300 ${
                  isHovered ? 'opacity-100 scale-110' : 'opacity-60'
                } hover:opacity-100`}
                title={social.name}
              >
                <Icon 
                  size={20} 
                  className="text-white hover:text-blue-400 transition-colors"
                />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
