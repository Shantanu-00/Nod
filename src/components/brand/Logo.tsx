import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  // Height presets maintaining the brand's 2.32:1 aspect ratio with confident prominence
  const sizeClasses = {
    sm: 'h-8 w-[74px]',
    md: 'h-10 w-[93px]',
    lg: 'h-12 w-[112px]'
  }[size];

  return (
    <Link 
      href="/" 
      className={`inline-flex items-center group cursor-pointer select-none text-brand-text hover:text-black transition-colors ${className}`}
      aria-label="NOD Home - Accessible Community Platform"
    >
      <svg 
        viewBox="0 0 836 360" 
        className={`${sizeClasses} transition-transform duration-200 group-hover:scale-[1.03] overflow-visible`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Lime Green Nod Marks above O (concentric acoustic/nod wave signals) */}
        <g 
          className="text-[#84CC16] transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:translate-x-0.5"
          stroke="currentColor" 
          strokeWidth="19" 
          strokeLinecap="round"
        >
          {/* Outer Wave Arc */}
          <path 
            d="M 477.7 13.0 A 210 210 0 0 1 586.6 77.1" 
            className="opacity-95 group-hover:opacity-100"
          />
          {/* Inner Wave Arc */}
          <path 
            d="M 477.9 52.3 A 172 172 0 0 1 556.3 100.3" 
            className="opacity-100"
          />
        </g>

        {/* Letter N: Bold, rounded geometric sans matching brand mascot */}
        <path 
          d="M 40.5 91.2 L 50.5 92.9 L 58.5 97.9 L 201.5 244.6 L 202.9 244.2 L 202.9 113.2 L 204.4 106.2 L 207.1 101.2 L 212.5 95.8 L 224.5 91.3 L 241.5 91.9 L 248.5 95.2 L 254.0 100.2 L 257.5 106.8 L 259.0 113.2 L 259.0 321.2 L 256.8 330.2 L 250.8 338.2 L 240.5 343.4 L 230.5 343.9 L 221.5 342.5 L 212.5 337.3 L 68.5 189.8 L 67.4 192.2 L 67.5 321.2 L 65.9 329.2 L 62.5 334.9 L 57.5 339.6 L 46.5 343.8 L 29.5 343.4 L 22.5 340.4 L 17.6 336.2 L 14.2 331.2 L 12.0 323.2 L 12.0 112.2 L 15.1 103.2 L 20.2 97.2 L 30.5 91.9 L 40.5 91.2 Z" 
          fill="currentColor" 
        />

        {/* Letter O: Mascot Face Circle */}
        <circle 
          cx="430.5" 
          cy="217.7" 
          r="135.9" 
          fill="currentColor" 
        />

        {/* Mascot Eyes: Vertical Capsule Pills (white in light mode, dark in dark mode) */}
        <g className="fill-brand-surface dark:fill-brand-bg transition-colors">
          <rect 
            x="361.7" 
            y="182.4" 
            width="38.6" 
            height="73.4" 
            rx="19.3" 
          />
          <rect 
            x="460.8" 
            y="182.4" 
            width="38.4" 
            height="73.4" 
            rx="19.2" 
          />
        </g>

        {/* Letter D: Bold geometric sans with rounded inner counter */}
        <path 
          d="M 621.5 91.0 L 698.5 90.9 L 718.5 92.9 L 738.5 98.0 L 757.5 106.1 L 774.5 116.9 L 790.2 131.2 L 805.0 150.2 L 815.8 172.2 L 822.9 199.2 L 823.8 227.2 L 820.7 247.2 L 813.8 268.2 L 800.9 291.2 L 787.5 306.9 L 768.5 322.6 L 754.5 330.6 L 740.5 336.5 L 727.5 340.4 L 707.5 343.6 L 620.5 343.9 L 610.5 340.6 L 603.1 333.2 L 600.2 326.2 L 599.9 322.2 L 599.9 112.2 L 602.0 104.2 L 606.3 98.2 L 614.5 92.8 L 621.5 91.0 Z M 657.5 144.8 L 656.0 147.2 L 656.0 289.2 L 658.5 290.8 L 703.5 290.5 L 719.5 287.4 L 731.5 282.3 L 745.5 272.4 L 753.5 263.4 L 760.0 253.2 L 765.9 237.2 L 767.9 223.2 L 766.8 204.2 L 763.8 192.2 L 758.0 179.2 L 751.9 170.2 L 741.5 159.8 L 732.5 153.8 L 721.5 148.7 L 703.5 144.9 L 657.5 144.8 Z" 
          fill="currentColor" 
          fillRule="evenodd" 
        />
      </svg>
    </Link>
  );
}

