/**
 * Social Media Icons Component
 * Clean, professional Web3 style social media links
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
    <div className="fixed bottom-4 right-4 z-40">
      <div 
        className="flex items-center gap-2 p-2 bg-black/50 backdrop-blur-sm rounded-lg border border-white/10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {socialLinks.map((social) => {
          const Icon = social.icon;
          return (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-all duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-70'
              } hover:scale-110`}
              title={social.name}
            >
              <Icon 
                size={18} 
                className="text-white hover:text-blue-400 transition-colors"
              />
            </a>
          );
        })}
      </div>
    </div>
  );
}
