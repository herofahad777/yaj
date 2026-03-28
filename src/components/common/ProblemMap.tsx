import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ProblemMapProps {
  problems: Problem[];
  onProblemClick?: (slug: string) => void;
}

interface Problem {
  slug: string;
  emoji: string;
  title: string;
  category: string;
  urgent: boolean;
  verified: boolean;
  location: string;
  locationCoords?: {
    lat: number;
    lng: number;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  medical: "#EF4444",
  water: "#3B82F6",
  food: "#F97316",
  shelter: "#8B5CF6",
  education: "#EAB308",
  disaster: "#EF4444",
  legal: "#6B7280",
  other: "#10B981",
};

function createColoredIcon(color: string, emoji: string, isUrgent: boolean) {
  const html = `
    <div style="
      width: 40px;
      height: 40px;
      background: ${color};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      border: 3px solid white;
      ${isUrgent ? 'animation: pulse 1s infinite;' : ''}
    ">
      <span style="transform: rotate(45deg); font-size: 18px;">${emoji}</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: "custom-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
}

function MapBoundsUpdater({ problems }: { problems: Problem[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (problems.length > 0) {
      const validProblems = problems.filter(p => p.locationCoords);
      if (validProblems.length > 0) {
        const bounds = L.latLngBounds(
          validProblems.map(p => [p.locationCoords!.lat, p.locationCoords!.lng] as [number, number])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [problems, map]);
  
  return null;
}

export function ProblemMap({ problems, onProblemClick }: ProblemMapProps) {
  const defaultCenter: [number, number] = [19.076, 72.8777];
  const defaultZoom = 10;

  const validProblems = problems.filter(p => p.locationCoords);

  return (
    <div className="problem-map">
      <style>{`
        .problem-map {
          height: 60vh;
          margin: 1rem;
          border-radius: var(--rad);
          overflow: hidden;
          border: 1px solid var(--bd);
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 12px;
          min-width: 200px;
        }
        .map-popup {
          font-family: var(--body);
        }
        .map-popup-emoji {
          font-size: 28px;
          margin-bottom: 8px;
        }
        .map-popup-title {
          font-family: var(--font);
          font-size: 14px;
          font-weight: 600;
          color: var(--t);
          margin-bottom: 8px;
          line-height: 1.4;
        }
        .map-popup-meta {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .map-popup-location {
          font-size: 12px;
          color: var(--t2);
          margin-bottom: 12px;
        }
        .map-popup-btn {
          width: 100%;
          padding: 10px;
          background: var(--g);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .map-popup-btn:hover {
          background: var(--gd);
        }
        @media (max-width: 768px) {
          .problem-map {
            height: 50vh;
            margin: 0.5rem;
          }
        }
      `}</style>
      
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsUpdater problems={validProblems} />
        
        {validProblems.map((problem) => {
          const color = CATEGORY_COLORS[problem.category] || CATEGORY_COLORS.other;
          return (
            <Marker
              key={problem.slug}
              position={[problem.locationCoords!.lat, problem.locationCoords!.lng]}
              icon={createColoredIcon(color, problem.emoji, problem.urgent)}
            >
              <Popup>
                <div className="map-popup">
                  <div className="map-popup-emoji">{problem.emoji}</div>
                  <div className="map-popup-title">{problem.title}</div>
                  <div className="map-popup-meta">
                    <span style={{
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: CATEGORY_COLORS[problem.category] + "20",
                      color: CATEGORY_COLORS[problem.category],
                      textTransform: "capitalize",
                    }}>
                      {problem.category}
                    </span>
                    {problem.urgent && (
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background: "#FEE2E2",
                        color: "#EF4444",
                      }}>
                        Urgent
                      </span>
                    )}
                    {problem.verified && (
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background: "#D1FAE5",
                        color: "#059669",
                      }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="map-popup-location">📍 {problem.location}</div>
                  <button 
                    className="map-popup-btn"
                    onClick={() => onProblemClick?.(problem.slug)}
                  >
                    View Details →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
