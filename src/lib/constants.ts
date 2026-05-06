import {
  Footprints,
  VolumeX,
  Wrench,
  Building2,
  Bug,
  Accessibility,
  Volume2,
  Lamp,
  Home,
  HeartPulse,
} from "lucide-react";

export const MADRID_CENTER = {
  lat: 40.4168,
  lng: -3.7038,
} as const;

export const DEFAULT_ZOOM = 13;

export const CATEGORY_CONFIG = {
  ACCESSIBILITY: {
    label: "Accesibilidad",
    color: "#3B82F6",
    icon: Accessibility,
    filterIcon: Footprints,
    subcategories: [
      "Aceras",
      "Pasos de peatones",
      "Señalización braille",
      "Carriles bici",
      "Semáforos",
    ],
  },
  NOISE: {
    label: "Ruido",
    color: "#EF4444",
    icon: Volume2,
    filterIcon: VolumeX,
    subcategories: [
      "Bares nocturnos",
      "Obras fuera de horario",
      "Terrazas sin aislamiento",
      "Locales en residencial",
    ],
  },
  STREET_FURNITURE: {
    label: "Mobiliario",
    color: "#F59E0B",
    icon: Lamp,
    filterIcon: Wrench,
    subcategories: ["Farolas", "Bancos", "Contenedores", "Fuentes"],
  },
  HOUSING: {
    label: "Vivienda",
    color: "#8B5CF6",
    icon: Home,
    filterIcon: Building2,
    subcategories: [
      "Pisos turísticos",
      "Edificios en ruinas",
      "Obras pendientes",
      "Fachadas ilegales",
    ],
  },
  HEALTH: {
    label: "Salud",
    color: "#10B981",
    icon: HeartPulse,
    filterIcon: Bug,
    subcategories: ["Basura", "Plagas", "Grafitis", "Jardines descuidados"],
  },
} as const;

export type MacroCategoryKey = keyof typeof CATEGORY_CONFIG;

export const STATUS_CONFIG = {
  DETECTED: {
    label: "Creado",
    color: "#6B7280",
    variant: "outline" as const,
  },
  MODERATION: {
    label: "En moderación",
    color: "#8B5CF6",
    variant: "outline" as const,
  },
  PUBLISHED: {
    label: "Publicado",
    color: "#1A56DB",
    variant: "default" as const,
  },
  IN_CONTACT: {
    label: "En contacto con periódico",
    color: "#F59E0B",
    variant: "default" as const,
  },
  ADMIN_CONTACT: {
    label: "En contacto administrativo",
    color: "#F97316",
    variant: "default" as const,
  },
  MEASURES_ANNOUNCED: {
    label: "Medidas anunciadas",
    color: "#06B6D4",
    variant: "default" as const,
  },
  AWAITING_RESPONSE: {
    label: "En espera",
    color: "#EF4444",
    variant: "default" as const,
  },
  RESOLVED: {
    label: "Resuelto",
    color: "#2D9F4F",
    variant: "default" as const,
  },
  ABANDONED: {
    label: "Abandonado",
    color: "#6B7280",
    variant: "default" as const,
  },
} as const;

export type IncidentStatusKey = keyof typeof STATUS_CONFIG;

export const POINTS = {
  INCIDENT_CREATED: 10,
  VOTE_CAST: 1,
  COMMENT_POSTED: 2,
  INCIDENT_RESOLVED: 50,
} as const;

export const LIMITS = {
  TITLE_MAX_LENGTH: 80,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_PHOTOS: 5,
  MAX_PHOTO_SIZE_MB: 5,
  MAX_VIDEO_SIZE_MB: 20,
  MAX_VIDEO_DURATION_SECONDS: 30,
  MAX_AUDIO_DURATION_SECONDS: 30,
  COMMENTS_PER_PAGE: 20,
  INCIDENTS_PER_PAGE: 20,
} as const;
