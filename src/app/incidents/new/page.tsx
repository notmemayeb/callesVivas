"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ArrowLeft, ArrowRight, MapPin, Locate, Check, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MADRID_CENTER,
  CATEGORY_CONFIG,
  LIMITS,
  type MacroCategoryKey,
} from "@/lib/constants";

interface FormData {
  latitude: number;
  longitude: number;
  addressText: string;
  title: string;
  description: string;
  categoryId: string;
  macroCategory: MacroCategoryKey | "";
  neighborhoodId: string;
}

interface ValidationErrors {
  [key: string]: string;
}

function validateStep1(form: FormData): ValidationErrors {
  const errors: ValidationErrors = {};
  if (form.latitude === 0 && form.longitude === 0) {
    errors.location = "Selecciona una ubicación en el mapa";
  }
  return errors;
}

function validateStep2(form: FormData): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!form.macroCategory) {
    errors.macroCategory = "Selecciona una categoría";
  }
  if (!form.categoryId) {
    errors.categoryId = "Selecciona una subcategoría";
  }
  if (!form.neighborhoodId) {
    errors.neighborhoodId = "Selecciona un barrio";
  }
  if (form.title.length < 5) {
    errors.title = "El título debe tener al menos 5 caracteres";
  }
  if (form.description.length < 10) {
    errors.description = "La descripción debe tener al menos 10 caracteres";
  }
  return errors;
}

export default function NewIncidentPage() {
  return (
    <Suspense>
      <NewIncidentContent />
    </Suspense>
  );
}

function NewIncidentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [form, setForm] = useState<FormData>({
    latitude: parseFloat(searchParams.get("lat") || "") || MADRID_CENTER.lat,
    longitude: parseFloat(searchParams.get("lng") || "") || MADRID_CENTER.lng,
    addressText: "",
    title: "",
    description: "",
    categoryId: "",
    macroCategory: "",
    neighborhoodId: "",
  });

  const { data: neighborhoods } = trpc.neighborhoods.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const createMutation = trpc.incidents.create.useMutation({
    onSuccess: (incident) => {
      router.push(`/incidents/${incident.id}`);
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  if (status === "unauthenticated") {
    router.push("/signin");
    return null;
  }

  const handleNext = () => {
    if (step === 1) {
      const stepErrors = validateStep1(form);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      const stepErrors = validateStep2(form);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      setErrors({});
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep2(form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      setStep(2);
      return;
    }
    setIsSubmitting(true);
    createMutation.mutate({
      title: form.title,
      description: form.description,
      latitude: form.latitude,
      longitude: form.longitude,
      addressText: form.addressText || undefined,
      categoryId: form.categoryId,
      neighborhoodId: form.neighborhoodId,
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-auto">
        <div className="max-w-lg mx-auto p-4 space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setErrors({});
                step > 1 ? setStep(step - 1) : router.back();
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 flex gap-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full ${
                    s <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Paso {step}/3</span>
          </div>

          {step === 1 && (
            <Step1Location
              form={form}
              setForm={setForm}
              errors={errors}
            />
          )}

          {step === 2 && (
            <Step2Details
              form={form}
              setForm={setForm}
              neighborhoods={neighborhoods || []}
              categories={categories || []}
              errors={errors}
            />
          )}

          {step === 3 && (
            <Step3Review form={form} neighborhoods={neighborhoods || []} />
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => {
                  setErrors({});
                  setStep(step - 1);
                }}
                className="flex-1"
              >
                <ArrowLeft size={16} className="mr-1" /> Anterior
              </Button>
            )}
            {step < 3 && (
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                Siguiente <ArrowRight size={16} className="ml-1" />
              </Button>
            )}
            {step === 3 && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                <Check size={16} className="mr-1" />
                {isSubmitting ? "Enviando..." : "Publicar incidencia"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-destructive mt-1">
      <AlertCircle size={12} />
      {message}
    </p>
  );
}

function Step1Location({
  form,
  setForm,
  errors,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  errors: ValidationErrors;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [form.longitude, form.latitude],
      zoom: 15,
    });

    marker.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([form.longitude, form.latitude])
      .addTo(map.current);

    marker.current.on("dragend", () => {
      const lngLat = marker.current!.getLngLat();
      setForm((prev) => ({
        ...prev,
        latitude: lngLat.lat,
        longitude: lngLat.lng,
      }));
    });

    map.current.on("click", (e) => {
      marker.current!.setLngLat(e.lngLat);
      setForm((prev) => ({
        ...prev,
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng,
      }));
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocate = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.current?.flyTo({ center: [longitude, latitude], zoom: 16 });
        marker.current?.setLngLat([longitude, latitude]);
        setForm((prev) => ({ ...prev, latitude, longitude }));
      },
      () => {}
    );
  }, [setForm]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">¿Dónde está el problema?</h2>
        <p className="text-sm text-muted-foreground">
          Arrastra el marcador o pulsa en el mapa para ajustar la ubicación.
        </p>
      </div>

      <div className="relative h-64 rounded-lg overflow-hidden border border-border">
        <div ref={mapContainer} className="w-full h-full" />
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-2 left-2 z-10 h-8 w-8 bg-card"
          onClick={handleLocate}
        >
          <Locate size={14} />
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin size={12} />
        <span>
          {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
        </span>
      </div>
      <FieldError message={errors.location} />

      <div>
        <Label htmlFor="address">Dirección (opcional)</Label>
        <Input
          id="address"
          placeholder="Ej: Calle Gran Vía 42"
          value={form.addressText}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, addressText: e.target.value }))
          }
        />
      </div>
    </div>
  );
}

function Step2Details({
  form,
  setForm,
  neighborhoods,
  categories,
  errors,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  neighborhoods: { id: string; name: string; slug: string }[];
  categories: { id: string; name: string; macroCategory: string }[];
  errors: ValidationErrors;
}) {
  const subcategories = categories.filter(
    (c) => c.macroCategory === form.macroCategory
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Describe el problema</h2>
        <p className="text-sm text-muted-foreground">
          Elige una categoría y describe lo que has observado.
        </p>
      </div>

      {/* Macro-category selector */}
      <div>
        <Label>Categoría</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {(Object.entries(CATEGORY_CONFIG) as [MacroCategoryKey, typeof CATEGORY_CONFIG[MacroCategoryKey]][]).map(
            ([key, config]) => {
              const Icon = config.icon;
              const isSelected = form.macroCategory === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      macroCategory: key,
                      categoryId: "",
                    }))
                  }
                  className={`flex items-center gap-2 p-3 rounded-lg border text-left text-sm transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <Icon
                    size={18}
                    style={{ color: isSelected ? config.color : undefined }}
                  />
                  <span className={isSelected ? "font-medium" : ""}>
                    {config.label}
                  </span>
                </button>
              );
            }
          )}
        </div>
        <FieldError message={errors.macroCategory} />
      </div>

      {/* Subcategory selector */}
      {subcategories.length > 0 && (
        <div>
          <Label>Subcategoría</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, categoryId: sub.id }))
                }
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  form.categoryId === sub.id
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
          <FieldError message={errors.categoryId} />
        </div>
      )}
      {!form.macroCategory && <FieldError message={errors.categoryId} />}

      {/* Neighborhood */}
      <div>
        <Label htmlFor="neighborhood">Barrio</Label>
        <select
          id="neighborhood"
          value={form.neighborhoodId}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, neighborhoodId: e.target.value }))
          }
          className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Selecciona un barrio</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
        <FieldError message={errors.neighborhoodId} />
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          placeholder="Resumen breve del problema"
          maxLength={LIMITS.TITLE_MAX_LENGTH}
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground mt-1">
          {form.title.length}/{LIMITS.TITLE_MAX_LENGTH}
        </p>
        <FieldError message={errors.title} />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Explica con más detalle lo que has observado..."
          maxLength={LIMITS.DESCRIPTION_MAX_LENGTH}
          rows={4}
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground mt-1">
          {form.description.length}/{LIMITS.DESCRIPTION_MAX_LENGTH}
        </p>
        <FieldError message={errors.description} />
      </div>
    </div>
  );
}

function Step3Review({
  form,
  neighborhoods,
}: {
  form: FormData;
  neighborhoods: { id: string; name: string; slug: string }[];
}) {
  const catConfig = form.macroCategory
    ? CATEGORY_CONFIG[form.macroCategory as MacroCategoryKey]
    : null;
  const neighborhood = neighborhoods.find((n) => n.id === form.neighborhoodId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Revisa tu reporte</h2>
        <p className="text-sm text-muted-foreground">
          Confirma que los datos son correctos antes de publicar.
        </p>
      </div>

      <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
        <div>
          <p className="text-xs text-muted-foreground">Título</p>
          <p className="font-medium">{form.title}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Descripción</p>
          <p className="text-sm">{form.description}</p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Categoría</p>
            <p className="text-sm">{catConfig?.label || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Barrio</p>
            <p className="text-sm">{neighborhood?.name || "—"}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Ubicación</p>
          <p className="text-sm flex items-center gap-1">
            <MapPin size={12} />
            {form.addressText || `${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}`}
          </p>
        </div>
      </div>
    </div>
  );
}
