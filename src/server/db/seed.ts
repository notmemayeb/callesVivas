import "dotenv/config";
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!.replace(/\?.*$/, ""),
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  {
    name: "Aceras",
    slug: "aceras",
    macroCategory: "ACCESSIBILITY" as const,
    icon: "Wheelchair",
    color: "#3B82F6",
  },
  {
    name: "Pasos de peatones",
    slug: "pasos-peatones",
    macroCategory: "ACCESSIBILITY" as const,
    icon: "Wheelchair",
    color: "#3B82F6",
  },
  {
    name: "Señalización braille",
    slug: "senalizacion-braille",
    macroCategory: "ACCESSIBILITY" as const,
    icon: "Wheelchair",
    color: "#3B82F6",
  },
  {
    name: "Carriles bici",
    slug: "carriles-bici",
    macroCategory: "ACCESSIBILITY" as const,
    icon: "Wheelchair",
    color: "#3B82F6",
  },
  {
    name: "Semáforos",
    slug: "semaforos",
    macroCategory: "ACCESSIBILITY" as const,
    icon: "Wheelchair",
    color: "#3B82F6",
  },
  {
    name: "Bares nocturnos",
    slug: "bares-nocturnos",
    macroCategory: "NOISE" as const,
    icon: "Volume2",
    color: "#EF4444",
  },
  {
    name: "Obras fuera de horario",
    slug: "obras-fuera-horario",
    macroCategory: "NOISE" as const,
    icon: "Volume2",
    color: "#EF4444",
  },
  {
    name: "Terrazas sin aislamiento",
    slug: "terrazas-sin-aislamiento",
    macroCategory: "NOISE" as const,
    icon: "Volume2",
    color: "#EF4444",
  },
  {
    name: "Locales en residencial",
    slug: "locales-residencial",
    macroCategory: "NOISE" as const,
    icon: "Volume2",
    color: "#EF4444",
  },
  {
    name: "Farolas",
    slug: "farolas",
    macroCategory: "STREET_FURNITURE" as const,
    icon: "Lamp",
    color: "#F59E0B",
  },
  {
    name: "Bancos",
    slug: "bancos",
    macroCategory: "STREET_FURNITURE" as const,
    icon: "Lamp",
    color: "#F59E0B",
  },
  {
    name: "Contenedores",
    slug: "contenedores",
    macroCategory: "STREET_FURNITURE" as const,
    icon: "Lamp",
    color: "#F59E0B",
  },
  {
    name: "Fuentes",
    slug: "fuentes",
    macroCategory: "STREET_FURNITURE" as const,
    icon: "Lamp",
    color: "#F59E0B",
  },
  {
    name: "Pisos turísticos",
    slug: "pisos-turisticos",
    macroCategory: "HOUSING" as const,
    icon: "Home",
    color: "#8B5CF6",
  },
  {
    name: "Edificios en ruinas",
    slug: "edificios-ruinas",
    macroCategory: "HOUSING" as const,
    icon: "Home",
    color: "#8B5CF6",
  },
  {
    name: "Obras pendientes",
    slug: "obras-pendientes",
    macroCategory: "HOUSING" as const,
    icon: "Home",
    color: "#8B5CF6",
  },
  {
    name: "Fachadas ilegales",
    slug: "fachadas-ilegales",
    macroCategory: "HOUSING" as const,
    icon: "Home",
    color: "#8B5CF6",
  },
  {
    name: "Basura acumulada",
    slug: "basura-acumulada",
    macroCategory: "HEALTH" as const,
    icon: "HeartPulse",
    color: "#10B981",
  },
  {
    name: "Plagas",
    slug: "plagas",
    macroCategory: "HEALTH" as const,
    icon: "HeartPulse",
    color: "#10B981",
  },
  {
    name: "Grafitis",
    slug: "grafitis",
    macroCategory: "HEALTH" as const,
    icon: "HeartPulse",
    color: "#10B981",
  },
  {
    name: "Jardines descuidados",
    slug: "jardines-descuidados",
    macroCategory: "HEALTH" as const,
    icon: "HeartPulse",
    color: "#10B981",
  },
];

const neighborhoods = [
  { name: "Centro", slug: "centro" },
  { name: "Arganzuela", slug: "arganzuela" },
  { name: "Retiro", slug: "retiro" },
  { name: "Salamanca", slug: "salamanca" },
  { name: "Chamartín", slug: "chamartin" },
  { name: "Tetuán", slug: "tetuan" },
  { name: "Chamberí", slug: "chamberi" },
  { name: "Fuencarral-El Pardo", slug: "fuencarral-el-pardo" },
  { name: "Moncloa-Aravaca", slug: "moncloa-aravaca" },
  { name: "Latina", slug: "latina" },
  { name: "Carabanchel", slug: "carabanchel" },
  { name: "Usera", slug: "usera" },
  { name: "Puente de Vallecas", slug: "puente-de-vallecas" },
  { name: "Moratalaz", slug: "moratalaz" },
  { name: "Ciudad Lineal", slug: "ciudad-lineal" },
  { name: "Hortaleza", slug: "hortaleza" },
  { name: "Villaverde", slug: "villaverde" },
  { name: "Villa de Vallecas", slug: "villa-de-vallecas" },
  { name: "Vicálvaro", slug: "vicalvaro" },
  { name: "San Blas-Canillejas", slug: "san-blas-canillejas" },
  { name: "Barajas", slug: "barajas" },
  // Popular barrios within Centro district
  { name: "Chueca", slug: "chueca" },
  { name: "Malasaña", slug: "malasana" },
  { name: "Lavapiés", slug: "lavapies" },
  { name: "Sol", slug: "sol" },
  { name: "La Latina", slug: "la-latina" },
  { name: "Huertas", slug: "huertas" },
];

async function main() {
  console.log("Seeding categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log(`Seeded ${categories.length} categories.`);

  console.log("Seeding neighborhoods...");
  for (const n of neighborhoods) {
    await prisma.neighborhood.upsert({
      where: { slug: n.slug },
      update: n,
      create: n,
    });
  }
  console.log(`Seeded ${neighborhoods.length} neighborhoods.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
