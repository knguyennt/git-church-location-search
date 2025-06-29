import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Badge,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { churchService } from '../services/api';

const Search = ({ onSearchResults, onCenterMap }) => {
  const [textQuery, setTextQuery] = useState('');
  const [isTextSearching, setIsTextSearching] = useState(false);
  
  const [proximityData, setProximityData] = useState({
    latitude: '',
    longitude: '',
    radius: 10,
  });
  const [isProximitySearching, setIsProximitySearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const toast = useToast();

  const handleTextSearch = async () => {
    if (!textQuery.trim()) {
      toast({
        title: 'Please enter a search term',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setIsTextSearching(true);
    try {
      const results = await churchService.searchChurches(textQuery);
      onSearchResults(results, 'text');
      toast({
        title: 'Search completed',
        description: `Found ${results.length} churches`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Search failed',
        description: 'Unable to search churches',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTextSearching(false);
    }
  };

  const handleProximitySearch = async () => {
    if (!proximityData.latitude || !proximityData.longitude) {
      toast({
        title: 'Please enter coordinates',
        description: 'Both latitude and longitude are required',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setIsProximitySearching(true);
    try {
      const results = await churchService.findNearbyChurches(
        parseFloat(proximityData.latitude),
        parseFloat(proximityData.longitude),
        proximityData.radius
      );
      
      onSearchResults(results, 'proximity');
      onCenterMap({
        lat: parseFloat(proximityData.latitude),
        lng: parseFloat(proximityData.longitude),
      });
      
      toast({
        title: 'Proximity search completed',
        description: `Found ${results.length} churches within ${proximityData.radius}km`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Proximity search failed',
        description: 'Unable to find nearby churches',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProximitySearching(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProximityData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setIsGettingLocation(false);
        toast({
          title: 'Location obtained',
          description: 'Current location has been set',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: 'Location error',
          description: 'Unable to get your current location',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleKeyPress = (e, searchType) => {
    if (e.key === 'Enter') {
      if (searchType === 'text') {
        handleTextSearch();
      } else if (searchType === 'proximity') {
        handleProximitySearch();
      }
    }
  };

  return (
    <Box p={4} bg="white" borderRadius="md" shadow="md">
      <VStack spacing={6} align="stretch">
        {/* Text Search */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={3}>
            🔍 Search Churches
          </Text>
          <HStack>
            <Input
              placeholder="Search by name, denomination, or address..."
              value={textQuery}
              onChange={(e) => setTextQuery(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'text')}
            />
            <Button
              colorScheme="blue"
              onClick={handleTextSearch}
              isLoading={isTextSearching}
              loadingText="Searching..."
              minW="100px"
            >
              Search
            </Button>
          </HStack>
        </Box>

        <Divider />

        {/* Proximity Search */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={3}>
            📍 Find Nearby Churches
          </Text>
          
          <VStack spacing={3} align="stretch">
            <HStack>
              <FormControl>
                <FormLabel fontSize="sm">Latitude</FormLabel>
                <NumberInput
                  value={proximityData.latitude}
                  onChange={(value) => setProximityData(prev => ({ ...prev, latitude: value }))}
                  precision={6}
                  min={-90}
                  max={90}
                >
                  <NumberInputField 
                    placeholder="14.0583"
                    onKeyPress={(e) => handleKeyPress(e, 'proximity')}
                  />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Longitude</FormLabel>
                <NumberInput
                  value={proximityData.longitude}
                  onChange={(value) => setProximityData(prev => ({ ...prev, longitude: value }))}
                  precision={6}
                  min={-180}
                  max={180}
                >
                  <NumberInputField 
                    placeholder="108.2772"
                    onKeyPress={(e) => handleKeyPress(e, 'proximity')}
                  />
                </NumberInput>
              </FormControl>
            </HStack>

            <HStack>
              <FormControl>
                <FormLabel fontSize="sm">Radius (km)</FormLabel>
                <NumberInput
                  value={proximityData.radius}
                  onChange={(value) => setProximityData(prev => ({ ...prev, radius: value }))}
                  min={0.1}
                  max={100}
                  precision={1}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <Button
                colorScheme="green"
                onClick={getCurrentLocation}
                isLoading={isGettingLocation}
                loadingText="Getting..."
                size="sm"
                mt={6}
              >
                Use My Location
              </Button>
            </HStack>

            <Button
              colorScheme="purple"
              onClick={handleProximitySearch}
              isLoading={isProximitySearching}
              loadingText="Finding..."
            >
              Find Nearby Churches
            </Button>
          </VStack>
        </Box>

        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">
            Use text search to find churches by name or denomination. 
            Use proximity search to find churches near a specific location.
          </Text>
        </Alert>
      </VStack>
    </Box>
  );
};

export default Search;
