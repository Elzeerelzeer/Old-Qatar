import React from 'react';
import { CharacterGender, Direction } from '../types';

interface CharacterAvatarProps {
  gender: CharacterGender;
  direction?: Direction;
  isMoving?: boolean;
  isCelebrating?: boolean;
  className?: string;
  size?: number; // size in px
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  gender,
  direction = 'down',
  isMoving = false,
  isCelebrating = false,
  className = '',
  size = 58,
}) => {
  const isBoy = gender === 'boy';
  const isBack = direction === 'up';
  const isLeft = direction === 'left';
  const isRight = direction === 'right';

  return (
    <div
      className={`relative inline-flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size * 1.3}px`,
        transform: isLeft ? 'scaleX(-1)' : 'scaleX(1)',
        transition: 'transform 0.12s ease-out',
      }}
    >
      {/* Soft Ground Contact Shadow */}
      <div
        className={`absolute bottom-0 rounded-full transition-all duration-200 pointer-events-none ${
          isCelebrating
            ? 'w-[42%] h-[5px] bg-[#1a0e08]/20 blur-[2px] translate-y-3'
            : isMoving
            ? 'w-[68%] h-[8px] bg-[#1a0e08]/35 blur-[1.5px] scale-x-95 animate-pulse'
            : 'w-[72%] h-[9px] bg-[#1a0e08]/40 blur-[1.5px]'
        }`}
      />

      {/* Stylized 3D Vector Character Graphic */}
      <svg
        viewBox="0 0 100 130"
        className={`w-full h-full drop-shadow-md transition-transform duration-150 ${
          isCelebrating
            ? '-translate-y-3 animate-bounce'
            : isMoving
            ? 'translate-y-[-2px]'
            : 'animate-[wiggle_4s_ease-in-out_infinite]'
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Thobe 3D Shading Gradients */}
          <linearGradient id="charThobeGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FAF8F5" />
            <stop offset="85%" stopColor="#E5E0D8" />
            <stop offset="100%" stopColor="#CFC8BD" />
          </linearGradient>

          <linearGradient id="charThobeShadow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C4BDB0" />
            <stop offset="40%" stopColor="#E8E3DB" />
            <stop offset="100%" stopColor="#BEB5A5" />
          </linearGradient>

          {/* Skin Tones */}
          <linearGradient id="charSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCD5B5" />
            <stop offset="60%" stopColor="#F5BD93" />
            <stop offset="100%" stopColor="#E29F6E" />
          </linearGradient>

          {/* Qatari Maroon Backpack */}
          <linearGradient id="charMaroonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A81D46" />
            <stop offset="50%" stopColor="#8A1538" />
            <stop offset="100%" stopColor="#560A20" />
          </linearGradient>

          {/* Gold Trim */}
          <linearGradient id="charGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE58F" />
            <stop offset="50%" stopColor="#E6C280" />
            <stop offset="100%" stopColor="#B38634" />
          </linearGradient>

          {/* Girl's Traditional Green / Gold Brocade Dress */}
          <linearGradient id="charGirlDressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B4D3E" />
            <stop offset="60%" stopColor="#143D31" />
            <stop offset="100%" stopColor="#0B261E" />
          </linearGradient>

          {/* Black Silk Bukhnuq */}
          <linearGradient id="charBukhnuqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2D2D30" />
            <stop offset="50%" stopColor="#1E1E21" />
            <stop offset="100%" stopColor="#101012" />
          </linearGradient>

          {/* Footwear */}
          <linearGradient id="charShoeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#693B1E" />
            <stop offset="100%" stopColor="#3B1C0B" />
          </linearGradient>
        </defs>

        {/* ---------------------------------------------------- */}
        {/* WALKING FEET / SHOES                                */}
        {/* ---------------------------------------------------- */}
        <g id="char-feet">
          {/* Left Foot */}
          <ellipse
            cx={isMoving ? 41 + (direction === 'left' ? -3 : 2) : 42}
            cy={122 + (isMoving ? -2 : 0)}
            rx="7"
            ry="4.5"
            fill="url(#charShoeGrad)"
            stroke="#271207"
            strokeWidth="1.2"
          />
          {/* Right Foot */}
          <ellipse
            cx={isMoving ? 59 + (direction === 'right' ? 3 : -2) : 58}
            cy={122 + (isMoving ? 2 : 0)}
            rx="7"
            ry="4.5"
            fill="url(#charShoeGrad)"
            stroke="#271207"
            strokeWidth="1.2"
          />
        </g>

        {/* ---------------------------------------------------- */}
        {/* BOY CHARACTER (الثوب الأبيض والغترة والعقال)           */}
        {/* ---------------------------------------------------- */}
        {isBoy && (
          <g id="char-boy">
            {/* Thobe Lower Hem & Body */}
            <path
              d="M 32 62 Q 50 58 68 62 L 74 118 Q 50 124 26 118 Z"
              fill="url(#charThobeGrad)"
              stroke="#D1C8BA"
              strokeWidth="1.5"
            />

            {/* Thobe Vertical Center Crease (كسرة الثوب الأصيلة) */}
            <line
              x1="50"
              y1="64"
              x2="50"
              y2="120"
              stroke="url(#charThobeShadow)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Thobe Collar & Placket (المخبى والياقة القطرية) */}
            <rect
              x="47"
              y="60"
              width="6"
              height="24"
              rx="2"
              fill="#EDE7DE"
              stroke="#D1C8BA"
              strokeWidth="1"
            />
            <circle cx="50" cy="65" r="1" fill="#8A1538" />
            <circle cx="50" cy="72" r="1" fill="#8A1538" />
            <circle cx="50" cy="79" r="1" fill="#8A1538" />

            {/* Thobe Sleeves / Arms */}
            {/* Left Arm */}
            <path
              d="M 32 62 Q 22 75 28 88 Q 33 90 36 84 Q 32 74 38 66 Z"
              fill="url(#charThobeGrad)"
              stroke="#D1C8BA"
              strokeWidth="1.2"
            />
            {/* Left Hand */}
            <circle cx="28" cy="89" r="4.5" fill="url(#charSkinGrad)" />

            {/* Right Arm */}
            <path
              d="M 68 62 Q 78 75 72 88 Q 67 90 64 84 Q 68 74 62 66 Z"
              fill="url(#charThobeGrad)"
              stroke="#D1C8BA"
              strokeWidth="1.2"
            />
            {/* Right Hand */}
            <circle cx="72" cy="89" r="4.5" fill="url(#charSkinGrad)" />

            {/* Qatari Maroon Crossbody Backpack (الحقيبة العنابية التراثية) */}
            {/* Strap across chest */}
            <path
              d="M 33 62 L 67 92"
              stroke="url(#charMaroonGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 33 62 L 67 92"
              stroke="url(#charGoldGrad)"
              strokeWidth="0.8"
              strokeDasharray="2,2"
            />
            {/* Maroon Bag Body */}
            <rect
              x="62"
              y="82"
              width="18"
              height="20"
              rx="4"
              fill="url(#charMaroonGrad)"
              stroke="#FFE58F"
              strokeWidth="1.5"
              transform="rotate(-10 62 82)"
            />
            {/* Bag Golden Emblem */}
            <circle cx="71" cy="92" r="3" fill="url(#charGoldGrad)" />

            {/* Neck */}
            <rect x="45" y="47" width="10" height="12" rx="3" fill="url(#charSkinGrad)" />

            {/* Head & Face */}
            <ellipse cx="50" cy="38" rx="16" ry="18" fill="url(#charSkinGrad)" />

            {/* Facial Features (if front or side) */}
            {!isBack && (
              <g id="boy-face">
                {/* Cheerful Eyebrows */}
                <path d="M 40 31 Q 44 29 47 31" stroke="#3D2010" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 53 31 Q 56 29 60 31" stroke="#3D2010" strokeWidth="1.8" strokeLinecap="round" />
                {/* Friendly Eyes */}
                <ellipse cx="44" cy="36" rx="2.4" ry="3" fill="#241208" />
                <circle cx="43" cy="35" r="1" fill="#FFFFFF" />
                <ellipse cx="56" cy="36" rx="2.4" ry="3" fill="#241208" />
                <circle cx="55" cy="35" r="1" fill="#FFFFFF" />
                {/* Nose */}
                <path d="M 50 36 L 49 41 L 52 41" stroke="#D18758" strokeWidth="1.4" strokeLinecap="round" />
                {/* Warm Smile */}
                <path d="M 46 45 Q 50 49 54 45" stroke="#8A1538" strokeWidth="1.8" strokeLinecap="round" />
                {/* Rosy Cheeks */}
                <ellipse cx="39" cy="41" rx="3" ry="1.8" fill="#F87171" opacity="0.4" />
                <ellipse cx="61" cy="41" rx="3" ry="1.8" fill="#F87171" opacity="0.4" />
              </g>
            )}

            {/* White Ghutra (الغترة البيضاء ذات الأطراف المنسدلة) */}
            <path
              d="M 32 28 Q 50 14 68 28 Q 78 40 76 60 Q 72 70 66 64 Q 68 45 62 36 Q 50 32 38 36 Q 32 45 34 64 Q 28 70 24 60 Q 22 40 32 28 Z"
              fill="url(#charThobeGrad)"
              stroke="#D4CEBE"
              strokeWidth="1.5"
            />

            {/* Black Agal with Double Rings (العقال الأسود القطري الأصيل) */}
            <ellipse cx="50" cy="24" rx="16" ry="6" fill="#1C1A1A" stroke="#000000" strokeWidth="2.5" />
            <ellipse cx="50" cy="22" rx="15" ry="5.5" fill="#282828" stroke="#101010" strokeWidth="2" />
            {/* Dangling Agal Cord (كركوشة العقال من الخلف) */}
            <path d="M 50 26 Q 51 34 50 42" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="43" r="2" fill="#8A1538" />
          </g>
        )}

        {/* ---------------------------------------------------- */}
        {/* GIRL CHARACTER (البخنق التراثي بالزري والزي القطري)   */}
        {/* ---------------------------------------------------- */}
        {!isBoy && (
          <g id="char-girl">
            {/* Traditional Emerald Green & Gold Dress */}
            <path
              d="M 30 62 Q 50 58 70 62 L 76 118 Q 50 124 24 118 Z"
              fill="url(#charGirlDressGrad)"
              stroke="#0A241C"
              strokeWidth="1.5"
            />
            {/* Gold Brocade Hem Trim */}
            <path
              d="M 25 116 Q 50 122 75 116"
              stroke="url(#charGoldGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Sleeves */}
            {/* Left Arm */}
            <path
              d="M 30 62 Q 22 75 28 88 Q 33 90 36 84 Q 30 74 36 66 Z"
              fill="url(#charGirlDressGrad)"
              stroke="#0A241C"
              strokeWidth="1.2"
            />
            <circle cx="28" cy="89" r="4.5" fill="url(#charSkinGrad)" />

            {/* Right Arm */}
            <path
              d="M 70 62 Q 78 75 72 88 Q 67 90 64 84 Q 70 74 64 66 Z"
              fill="url(#charGirlDressGrad)"
              stroke="#0A241C"
              strokeWidth="1.2"
            />
            <circle cx="72" cy="89" r="4.5" fill="url(#charSkinGrad)" />

            {/* Qatari Maroon Bag with Gold Cord */}
            <path
              d="M 32 62 L 68 90"
              stroke="url(#charGoldGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <rect
              x="62"
              y="82"
              width="18"
              height="20"
              rx="4"
              fill="url(#charMaroonGrad)"
              stroke="#FFE58F"
              strokeWidth="1.5"
              transform="rotate(-10 62 82)"
            />
            <circle cx="71" cy="92" r="3" fill="url(#charGoldGrad)" />

            {/* Neck */}
            <rect x="45" y="47" width="10" height="12" rx="3" fill="url(#charSkinGrad)" />

            {/* Head & Face */}
            <ellipse cx="50" cy="38" rx="15" ry="17" fill="url(#charSkinGrad)" />

            {/* Facial Features (if front or side) */}
            {!isBack && (
              <g id="girl-face">
                {/* Elegant Eyebrows */}
                <path d="M 41 31 Q 45 29 48 31" stroke="#3D2010" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M 52 31 Q 55 29 59 31" stroke="#3D2010" strokeWidth="1.6" strokeLinecap="round" />
                {/* Big Expressive Eyes with Eyelashes */}
                <ellipse cx="44" cy="36" rx="2.6" ry="3.2" fill="#241208" />
                <circle cx="43" cy="35" r="1.2" fill="#FFFFFF" />
                <ellipse cx="56" cy="36" rx="2.6" ry="3.2" fill="#241208" />
                <circle cx="55" cy="35" r="1.2" fill="#FFFFFF" />
                {/* Gentle Smile */}
                <path d="M 46 45 Q 50 49 54 45" stroke="#8A1538" strokeWidth="1.8" strokeLinecap="round" />
                {/* Rosy Cheeks */}
                <ellipse cx="38" cy="41" rx="3.5" ry="2" fill="#FB7185" opacity="0.45" />
                <ellipse cx="62" cy="41" rx="3.5" ry="2" fill="#FB7185" opacity="0.45" />
              </g>
            )}

            {/* Authentic Qatari Bukhnuq (البخنق الأسود المطرز بالزري الذهبي) */}
            <path
              d="M 28 32 Q 50 12 72 32 Q 80 50 75 80 Q 64 92 50 96 Q 36 92 25 80 Q 20 50 28 32 Z"
              fill="url(#charBukhnuqGrad)"
              stroke="#111113"
              strokeWidth="1.5"
            />
            {/* Oval Face Opening with Gold Zari Border (تطريز الزري الذهبي حول الوجه) */}
            <ellipse
              cx="50"
              cy="38"
              rx="15"
              ry="18"
              fill="none"
              stroke="url(#charGoldGrad)"
              strokeWidth="2.5"
            />
            {/* Bukhnuq Center Gold Zari Stripe down to chest (المرش والزري في صدر البخنق) */}
            <path
              d="M 50 56 L 50 94"
              stroke="url(#charGoldGrad)"
              strokeWidth="2.5"
              strokeDasharray="2,2"
              strokeLinecap="round"
            />
            {/* Outer Border Gold Zari Scallop */}
            <path
              d="M 28 78 Q 50 98 72 78"
              stroke="url(#charGoldGrad)"
              strokeWidth="1.8"
              fill="none"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
