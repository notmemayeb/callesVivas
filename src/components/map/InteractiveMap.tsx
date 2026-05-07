"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MADRID_CENTER, DEFAULT_ZOOM, CATEGORY_CONFIG } from "@/lib/constants";
import type { MacroCategoryKey } from "@/lib/constants";
import { Locate, ThumbsUp, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MapIncident {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  macroCategory: MacroCategoryKey;
  status: string;
  votesCount: number;
  thumbnailUrl?: string | null;
}

interface HoveredState {
  incident: MapIncident;
  x: number;
  y: number;
}

interface InteractiveMapProps {
  incidents?: MapIncident[];
  selectedCategories?: MacroCategoryKey[];
  votedIds?: Set<string>;
  followedIds?: Set<string>;
  onIncidentClick?: (id: string) => void;
  onMapLongPress?: (lat: number, lng: number) => void;
  onVote?: (id: string) => void;
  onFollow?: (id: string) => void;
}

const SOURCE_ID = "incidents";
const CLUSTER_LAYER = "clusters";
const CLUSTER_COUNT_LAYER = "cluster-count";
const UNCLUSTERED_LAYER = "unclustered-point";

export function InteractiveMap({
  incidents = [],
  selectedCategories = [],
  votedIds = new Set(),
  followedIds = new Set(),
  onIncidentClick,
  onMapLongPress,
  onVote,
  onFollow,
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hovered, setHovered] = useState<HoveredState | null>(null);
  const hoveredRef = useRef<HoveredState | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const popupHovered = useRef(false);
  const onIncidentClickRef = useRef(onIncidentClick);
  onIncidentClickRef.current = onIncidentClick;
  const onMapLongPressRef = useRef(onMapLongPress);
  onMapLongPressRef.current = onMapLongPress;
  const incidentsRef = useRef(incidents);
  incidentsRef.current = incidents;

  const scheduleHide = useCallback(() => {
    hideTimer.current = setTimeout(() => {
      if (!popupHovered.current) {
        hoveredRef.current = null;
        setHovered(null);
      }
    }, 150);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const updatePopupPosition = useCallback(() => {
    const m = map.current;
    const h = hoveredRef.current;
    if (!m || !h) return;
    const point = m.project([h.incident.longitude, h.incident.latitude]);
    setHovered({ ...h, x: point.x, y: point.y });
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn("NEXT_PUBLIC_MAPBOX_TOKEN is not set");
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [MADRID_CENTER.lng, MADRID_CENTER.lat],
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.current.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    map.current.on("load", () => {
      const m = map.current!;

      m.addSource(SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      m.addLayer({
        id: CLUSTER_LAYER,
        type: "circle",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            10,
            "#f1f075",
            30,
            "#f28cb1",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            18,
            10,
            24,
            30,
            32,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      m.addLayer({
        id: CLUSTER_COUNT_LAYER,
        type: "symbol",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#1a1a2e",
        },
      });

      m.addLayer({
        id: UNCLUSTERED_LAYER,
        type: "circle",
        source: SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      m.on("click", CLUSTER_LAYER, (e) => {
        const features = m.queryRenderedFeatures(e.point, {
          layers: [CLUSTER_LAYER],
        });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = m.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom == null) return;
          const geometry = features[0].geometry;
          if (geometry.type === "Point") {
            m.easeTo({
              center: geometry.coordinates as [number, number],
              zoom,
            });
          }
        });
      });

      m.on("click", UNCLUSTERED_LAYER, (e) => {
        const feature = e.features?.[0];
        if (feature?.properties?.id) {
          onIncidentClickRef.current?.(feature.properties.id);
        }
      });

      m.on("mouseenter", CLUSTER_LAYER, () => {
        m.getCanvas().style.cursor = "pointer";
      });
      m.on("mouseleave", CLUSTER_LAYER, () => {
        m.getCanvas().style.cursor = "";
      });

      m.on("mouseenter", UNCLUSTERED_LAYER, (e) => {
        m.getCanvas().style.cursor = "pointer";
        cancelHide();
        const feature = e.features?.[0];
        if (!feature || feature.geometry.type !== "Point") return;
        const id = feature.properties?.id;
        const incident = incidentsRef.current.find((i) => i.id === id);
        if (!incident) return;
        const point = m.project([incident.longitude, incident.latitude]);
        const state: HoveredState = { incident, x: point.x, y: point.y };
        hoveredRef.current = state;
        setHovered(state);
      });

      m.on("mouseleave", UNCLUSTERED_LAYER, () => {
        m.getCanvas().style.cursor = "";
        scheduleHide();
      });

      m.on("move", updatePopupPosition);

      setMapLoaded(true);
    });

    let longPressTimer: ReturnType<typeof setTimeout>;
    map.current.on("mousedown", (e) => {
      longPressTimer = setTimeout(() => {
        onMapLongPressRef.current?.(e.lngLat.lat, e.lngLat.lng);
      }, 700);
    });
    map.current.on("mouseup", () => clearTimeout(longPressTimer));
    map.current.on("dragstart", () => clearTimeout(longPressTimer));

    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const filtered =
      selectedCategories.length > 0
        ? incidents.filter((i) => selectedCategories.includes(i.macroCategory))
        : incidents;

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: filtered.map((incident) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [incident.longitude, incident.latitude],
        },
        properties: {
          id: incident.id,
          title: incident.title,
          macroCategory: incident.macroCategory,
          color: CATEGORY_CONFIG[incident.macroCategory].color,
          votesCount: incident.votesCount,
        },
      })),
    };

    const source = map.current.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geojson);
    }
  }, [incidents, selectedCategories, mapLoaded]);

  const handleLocate = useCallback(() => {
    if (!map.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 15,
          duration: 1500,
        });
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} className="w-full h-full" />

      {hovered && (() => {
        const liveIncident = incidents.find((i) => i.id === hovered.incident.id) ?? hovered.incident;
        return (
        <div
          className="absolute z-50"
          style={{
            left: hovered.x,
            top: hovered.y,
            transform: "translate(-50%, -100%) translateY(-16px)",
          }}
          onMouseEnter={() => {
            popupHovered.current = true;
            cancelHide();
          }}
          onMouseLeave={() => {
            popupHovered.current = false;
            scheduleHide();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-card rounded-xl shadow-xl border border-border overflow-hidden w-56">
            {liveIncident.thumbnailUrl && (
              <img
                src={liveIncident.thumbnailUrl}
                alt=""
                className="w-full h-28 object-cover"
              />
            )}
            <div className="p-3 space-y-2">
              <p className="font-semibold text-sm leading-tight line-clamp-2">
                {liveIncident.title}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ThumbsUp size={12} />
                <span>{liveIncident.votesCount} votos</span>
              </div>
              <div className="flex gap-1.5">
                {(() => {
                  const hasVoted = votedIds.has(liveIncident.id);
                  const hasFollowed = followedIds.has(liveIncident.id);
                  return (
                    <>
                      <Button
                        size="sm"
                        variant={hasVoted ? "default" : "outline"}
                        className="flex-1 gap-1 h-7 text-xs"
                        onClick={() => onVote?.(liveIncident.id)}
                      >
                        <ThumbsUp size={12} fill={hasVoted ? "currentColor" : "none"} />
                        {hasVoted ? "Votado" : "Votar"}
                      </Button>
                      <Button
                        size="sm"
                        variant={hasFollowed ? "default" : "outline"}
                        className="flex-1 gap-1 h-7 text-xs"
                        onClick={() => onFollow?.(liveIncident.id)}
                      >
                        <Bell size={12} fill={hasFollowed ? "currentColor" : "none"} />
                        {hasFollowed ? "Siguiendo" : "Seguir"}
                      </Button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
          <div
            className="w-3 h-3 bg-card border-b border-r border-border rotate-45 mx-auto -mt-1.5"
          />
        </div>
        );
      })()}

      <Button
        variant="outline"
        size="icon"
        className="absolute bottom-4 left-4 z-10 h-10 w-10 bg-card shadow-md"
        onClick={handleLocate}
      >
        <Locate size={18} />
      </Button>
    </div>
  );
}
