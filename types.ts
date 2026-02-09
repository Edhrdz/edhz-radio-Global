import React from 'react';

export interface Station {
  id: string;
  name: string;
  genre: string;
  description: string;
  streamUrl: string;
  coverImage: string;
  listeners: number;
  isLive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium: boolean;
  streamKey?: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}