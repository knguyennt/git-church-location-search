import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Divider,
  Icon,
  Tooltip,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { MdLocationOn, MdPhone, MdWeb, MdDirections } from 'react-icons/md';

const NearbyChurchesList = ({ 
  churches, 
  onChurchClick, 
  selectedChurch,
  searchCenter 
}) => {
  const formatDistance = (distanceMeters) => {
    if (!distanceMeters) return '';
    
    if (distanceMeters < 1000) {
      return `${Math.round(distanceMeters)}m`;
    } else {
      return `${(distanceMeters / 1000).toFixed(1)}km`;
    }
  };

  const handleChurchClick = (church) => {
    if (onChurchClick) {
      onChurchClick(church);
    }
  };

  const getDirectionsUrl = (church) => {
    if (church.latitude && church.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${church.latitude},${church.longitude}`;
    }
    return null;
  };

  if (!churches || churches.length === 0) {
    return (
      <Box p={4} bg="white" borderRadius="md" shadow="md">
        <Text color="gray.500" textAlign="center">
          No nearby churches found
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text fontWeight="bold" mb={3} color="gray.700">
        Nearby Churches ({churches.length})
      </Text>
      
      <VStack spacing={3} align="stretch" maxH="400px" overflowY="auto">
        {churches.map((church, index) => (
          <Card
            key={church.id}
            size="sm"
            variant={selectedChurch?.id === church.id ? "filled" : "outline"}
            cursor="pointer"
            onClick={() => handleChurchClick(church)}
            _hover={{
              shadow: "md",
              borderColor: "blue.300"
            }}
            transition="all 0.2s"
          >
            <CardBody p={3}>
              <VStack align="stretch" spacing={2}>
                {/* Header with name and distance */}
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="semibold" fontSize="sm" noOfLines={2}>
                      {church.name || 'Unnamed Church'}
                    </Text>
                    {church.denomination && (
                      <Badge size="sm" colorScheme="blue" variant="subtle">
                        {church.denomination}
                      </Badge>
                    )}
                  </VStack>
                  
                  {church.distance_meters && (
                    <VStack align="end" spacing={1}>
                      <HStack spacing={1}>
                        <Icon as={MdLocationOn} color="red.500" boxSize={3} />
                        <Text fontSize="xs" fontWeight="medium" color="red.600">
                          {formatDistance(church.distance_meters)}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        #{index + 1}
                      </Text>
                    </VStack>
                  )}
                </HStack>

                {/* Address */}
                {church.address && (
                  <Text fontSize="xs" color="gray.600" noOfLines={2}>
                    📍 {church.address}
                  </Text>
                )}

                {/* Contact info and actions */}
                <HStack justify="space-between" align="center">
                  <HStack spacing={3}>
                    {church.phone && (
                      <Tooltip label={`Call ${church.phone}`}>
                        <Box>
                          <Icon 
                            as={MdPhone} 
                            color="green.500" 
                            boxSize={3} 
                            cursor="pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`tel:${church.phone}`);
                            }}
                          />
                        </Box>
                      </Tooltip>
                    )}
                    
                    {church.website && (
                      <Tooltip label="Visit website">
                        <Box>
                          <Icon 
                            as={MdWeb} 
                            color="blue.500" 
                            boxSize={3} 
                            cursor="pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(church.website, '_blank');
                            }}
                          />
                        </Box>
                      </Tooltip>
                    )}
                  </HStack>

                  {/* Directions button */}
                  {getDirectionsUrl(church) && (
                    <Tooltip label="Get directions">
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="blue"
                        leftIcon={<MdDirections />}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(getDirectionsUrl(church), '_blank');
                        }}
                      >
                        Directions
                      </Button>
                    </Tooltip>
                  )}
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  );
};

export default NearbyChurchesList;
