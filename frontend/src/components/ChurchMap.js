import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Divider,
  useDisclosure,
} from '@chakra-ui/react';
import ChurchModal from './ChurchModal';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom church icon
const churchIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8B4513" width="24" height="24">
      <path d="M12 2L8 6v3H6v11h4v-6h4v6h4V9h-2V6l-4-4z"/>
      <path d="M12 0v4M10 8h4"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Component to handle map clicks for adding new churches
function MapClickHandler({ onMapClick, isAddingMode }) {
  useMapEvents({
    click: (e) => {
      if (isAddingMode && onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

// Component to center map on specific location
function MapController({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 15);
    }
  }, [center, map]);

  return null;
}

// Component to handle automatic popup opening for selected church
function PopupController({ selectedChurch, churches }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedChurch && churches.length > 0) {
      // Find the church in the current churches list
      const church = churches.find(c => c.id === selectedChurch.id);
      if (church && church.latitude && church.longitude) {
        // Close all existing popups first
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            layer.closePopup();
          }
        });
        
        // Find the marker for this church and open its popup
        setTimeout(() => {
          map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
              const latlng = layer.getLatLng();
              if (Math.abs(latlng.lat - church.latitude) < 0.0001 && 
                  Math.abs(latlng.lng - church.longitude) < 0.0001) {
                layer.openPopup();
              }
            }
          });
        }, 100);
      }
    }
  }, [selectedChurch, churches, map]);

  return null;
}

const ChurchMap = ({ 
  churches = [], 
  onChurchSelect, 
  onAddChurch, 
  isAddingMode = false,
  selectedChurch = null,
  centerLocation = null 
}) => {
  const [selectedChurchData, setSelectedChurchData] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const mapRef = useRef();

  // Default center (Vietnam)
  const defaultCenter = [14.0583, 108.2772];
  const defaultZoom = 6;

  const handleMarkerClick = (church) => {
    setSelectedChurchData(church);
    if (onChurchSelect) {
      onChurchSelect(church);
    }
  };

  const handleMapClick = (latlng) => {
    if (isAddingMode && onAddChurch) {
      onAddChurch({
        latitude: latlng.lat,
        longitude: latlng.lng,
      });
    }
  };

  const handleEditChurch = (church) => {
    setSelectedChurchData(church);
    onOpen();
  };

  return (
    <Box height="100%" position="relative">
      <MapContainer
        center={centerLocation ? [centerLocation.lat, centerLocation.lng] : defaultCenter}
        zoom={centerLocation ? 15 : defaultZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={handleMapClick} isAddingMode={isAddingMode} />
        <MapController center={centerLocation} />
        <PopupController selectedChurch={selectedChurch} churches={churches} />
        
        {churches.map((church) => (
          <Marker
            key={church.id}
            position={[church.latitude, church.longitude]}
            icon={churchIcon}
            eventHandlers={{
              click: () => handleMarkerClick(church),
            }}
          >
            <Popup>
              <VStack align="stretch" spacing={2} maxW="250px">
                <Text fontWeight="bold" fontSize="md">
                  {church.name || 'Unnamed Church'}
                </Text>
                
                {church.denomination && (
                  <Badge colorScheme="blue" variant="subtle">
                    {church.denomination}
                  </Badge>
                )}
                
                {church.address && (
                  <Text fontSize="sm" color="gray.600">
                    📍 {church.address}
                  </Text>
                )}
                
                {church.phone && (
                  <Text fontSize="sm">
                    📞 {church.phone}
                  </Text>
                )}
                
                {church.website && (
                  <Text fontSize="sm">
                    🌐 <a href={church.website} target="_blank" rel="noopener noreferrer">
                      Website
                    </a>
                  </Text>
                )}
                
                {church.distance_meters && (
                  <Text fontSize="sm" color="green.600">
                    📏 {(church.distance_meters / 1000).toFixed(2)} km away
                  </Text>
                )}

                <Divider />
                
                <HStack>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={() => handleEditChurch(church)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      if (mapRef.current) {
                        mapRef.current.setView([church.latitude, church.longitude], 16);
                      }
                    }}
                  >
                    Center
                  </Button>
                </HStack>
              </VStack>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selectedChurchData && (
        <ChurchModal
          isOpen={isOpen}
          onClose={onClose}
          church={selectedChurchData}
          onSave={() => {
            onClose();
            // Refresh churches list if needed
          }}
        />
      )}
    </Box>
  );
};

export default ChurchMap;
