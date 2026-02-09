
import React from 'react';
import { Station } from './types';

export const MOCK_STATIONS: Station[] = [
  {
    id: '1',
    name: 'Cyberpunk Beats',
    genre: 'Synthwave',
    description: 'Neon-infused rhythms for the digital age.',
    streamUrl: 'https://streaming.radio.co/s6c547f12e/listen',
    coverImage: 'https://picsum.photos/seed/cyber/400/400',
    listeners: 1240,
    isLive: true
  },
  {
    id: '2',
    name: 'Chill Horizon',
    genre: 'Lo-Fi',
    description: 'Relaxing beats to study or chill to.',
    streamUrl: 'https://streaming.radio.co/s6c547f12e/listen',
    coverImage: 'https://picsum.photos/seed/chill/400/400',
    listeners: 850,
    isLive: true
  },
  {
    id: '3',
    name: 'Techno Pulse',
    genre: 'Electronic',
    description: 'The hardest techno from Berlin underground.',
    streamUrl: 'https://streaming.radio.co/s6c547f12e/listen',
    coverImage: 'https://picsum.photos/seed/techno/400/400',
    listeners: 2100,
    isLive: true
  },
  {
    id: '4',
    name: 'Jazz Lounge',
    genre: 'Jazz',
    description: 'Smooth jazz for elegant evenings.',
    streamUrl: 'https://streaming.radio.co/s6c547f12e/listen',
    coverImage: 'https://picsum.photos/seed/jazz/400/400',
    listeners: 430,
    isLive: false
  }
];

export const PLANS = [
  {
    id: 'free',
    name: 'Gratis',
    price: '$0',
    features: ['1 estación', 'Hasta 50 oyentes', 'Soporte básico', 'Anuncios'],
    buttonText: 'Empezar Gratis',
    highlighted: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$19.99/mes',
    features: ['5 estaciones', 'Oyentes ilimitados', 'Sin anuncios', 'Soporte prioritario', 'Estadísticas avanzadas'],
    buttonText: 'Suscribirse Ahora',
    highlighted: true
  },
  {
    id: 'enterprise',
    name: 'Empresa',
    price: 'Consultar',
    features: ['Estaciones ilimitadas', 'Marca blanca', 'API Access', 'Account Manager'],
    buttonText: 'Contactar',
    highlighted: false
  }
];
