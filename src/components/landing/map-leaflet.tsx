"use client"

import { useEffect, useRef } from "react"
import type { Map as LeafletMap } from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapLeafletProps {
  lat: number
  lng: number
  zoom?: number
  height?: string
}

export function MapLeaflet({ lat, lng, zoom = 15, height = "300px" }: MapLeafletProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<LeafletMap | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    const container = mapRef.current

    async function initMap() {
      const L = await import("leaflet")

      const map = L.map(container, {
        center: [lat, lng],
        zoom,
        scrollWheelZoom: false,
        attributionControl: true,
        zoomControl: false,
      })

      L.control.zoom({ position: "bottomright" }).addTo(map)

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      const icon = L.divIcon({
        html: `<div style="width:28px;height:28px;background:rgb(0,212,255);border:3px solid white;border-radius:50%;box-shadow:0 2px 12px rgba(0,212,255,0.5);"></div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      L.marker([lat, lng], { icon }).addTo(map)

      mapInstance.current = map

      setTimeout(() => map.invalidateSize(), 100)
    }

    initMap()

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [lat, lng, zoom])

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height, minHeight: height }}
    />
  )
}
