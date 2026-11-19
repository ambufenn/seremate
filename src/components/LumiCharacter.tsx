import { motion } from 'motion/react';
import type { LumiMood } from '../types/reproguard';

interface LumiCharacterProps {
  mood?: LumiMood;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandLogoMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="12" fill="#EA6A27" />
      <path
        d="M20 30.5C20 30.5 11.2 25.1 11.2 17.7C11.2 14.3 13.8 11.8 16.9 11.8C18.4 11.8 19.6 12.6 20 13.5C20.4 12.6 21.6 11.8 23.1 11.8C26.2 11.8 28.8 14.3 28.8 17.7C28.8 25.1 20 30.5 20 30.5Z"
        stroke="#FDFBF7"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.4 18.8L18.9 21.2L23.8 16.3"
        stroke="#FDFBF7"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LumiCharacter({
  mood = 'calm',
  size = 'md',
  className = '',
}: LumiCharacterProps) {
  const dimensions =
    size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-32 h-32' : 'w-20 h-20';

  const auraColor =
    mood === 'empathetic'
      ? '#EFEAFE'
      : mood === 'celebrating'
      ? '#E5F2E9'
      : mood === 'thinking'
      ? '#FFF0E5'
      : '#FFF0E5';

  const petalColor =
    mood === 'celebrating' ? '#63A87E' : mood === 'empathetic' ? '#9B82EA' : '#B7A4F4';

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center select-none ${dimensions} ${className}`}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      aria-label={`Lumi character feeling ${mood}`}
    >
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft warm ambient aura */}
        <circle cx="60" cy="60" r="54" fill={auraColor} />

        {/* Subtle botanical leaves at base */}
        <path
          d="M44 96C34 94 28 86 30 78C38 78 46 84 48 93"
          fill="#63A87E"
          fillOpacity="0.88"
        />
        <path
          d="M76 96C86 94 92 86 90 78C82 78 74 84 72 93"
          fill="#44835E"
          fillOpacity="0.88"
        />
        <path
          d="M60 88V101"
          stroke="#44835E"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Soft blossom petals framing Lumi's glowing face */}
        <circle cx="60" cy="30" r="18" fill={petalColor} />
        <circle cx="35" cy="46" r="17" fill={petalColor} fillOpacity="0.92" />
        <circle cx="85" cy="46" r="17" fill={petalColor} fillOpacity="0.92" />
        <circle cx="42" cy="72" r="16" fill={petalColor} fillOpacity="0.86" />
        <circle cx="78" cy="72" r="16" fill={petalColor} fillOpacity="0.86" />

        {/* Inner tangerine warm lantern core */}
        <circle cx="60" cy="54" r="24" fill="#F28544" />
        <circle cx="60" cy="52" r="21" fill="#F8A163" />

        {/* Soft cheek warmth */}
        <ellipse cx="46" cy="57" rx="4.2" ry="2.6" fill="#EA6A27" fillOpacity="0.45" />
        <ellipse cx="74" cy="57" rx="4.2" ry="2.6" fill="#EA6A27" fillOpacity="0.45" />

        {/* Expressive eyes based on mood */}
        {mood === 'celebrating' ? (
          <>
            <path
              d="M46 50C47.5 47 51 47 52.5 50"
              stroke="#241F1B"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M67.5 50C69 47 72.5 47 74 50"
              stroke="#241F1B"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </>
        ) : mood === 'empathetic' ? (
          <>
            <circle cx="49" cy="50" r="3" fill="#241F1B" />
            <circle cx="71" cy="50" r="3" fill="#241F1B" />
            <circle cx="50" cy="48.8" r="1" fill="#FDFBF7" />
            <circle cx="72" cy="48.8" r="1" fill="#FDFBF7" />
            <path d="M45 44.5L52 43" stroke="#241F1B" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M75 44.5L68 43" stroke="#241F1B" strokeWidth="1.8" strokeLinecap="round" />
          </>
        ) : mood === 'thinking' ? (
          <>
            <circle cx="49" cy="49.5" r="2.8" fill="#241F1B" />
            <circle cx="71" cy="49.5" r="2.8" fill="#241F1B" />
            <circle cx="50" cy="48.5" r="1" fill="#FDFBF7" />
            <circle cx="72" cy="48.5" r="1" fill="#FDFBF7" />
          </>
        ) : (
          <>
            <circle cx="49" cy="50" r="3.1" fill="#241F1B" />
            <circle cx="71" cy="50" r="3.1" fill="#241F1B" />
            <circle cx="50.1" cy="48.7" r="1.1" fill="#FDFBF7" />
            <circle cx="72.1" cy="48.7" r="1.1" fill="#FDFBF7" />
          </>
        )}

        {/* Mouth expression */}
        {mood === 'empathetic' ? (
          <path
            d="M55 58.5C57.5 60.5 62.5 60.5 65 58.5"
            stroke="#241F1B"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
        ) : mood === 'thinking' ? (
          <path
            d="M56 59H64"
            stroke="#241F1B"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
        ) : mood === 'celebrating' ? (
          <path
            d="M53.5 56.5C55.5 62.5 64.5 62.5 66.5 56.5"
            stroke="#241F1B"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M54.5 57.5C56.8 61 63.2 61 65.5 57.5"
            stroke="#241F1B"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        )}
      </svg>
    </motion.div>
  );
}
