import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Container,
  useDisclosure,
  useToast,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import ChurchMap from './components/ChurchMap';
import Search from './components/Search';
import ChurchModal from './components/ChurchModal';
import { churchService } from './services/api';

function App() {
  const [churches, setChurches] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [centerLocation, setCenterLocation] = useState(null);
  const [newChurchCoordinates, setNewChurchCoordinates] = useState(null);
  const [searchType, setSearchType] = useState(null);
  
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const toast = useToast();

  // Load initial churches
  useEffect(() => {
    loadChurches();
  }, []);

  const loadChurches = async () => {
    setIsLoading(true);
    try {
      const data = await churchService.getChurches(0, 1000); // Load more churches for map
      setChurches(data);
    } catch (error) {
      toast({
        title: 'Error loading churches',
        description: 'Unable to load church data from the server',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchResults = (results, type) => {
    setSearchResults(results);
    setSearchType(type);
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setSearchType(null);
    setCenterLocation(null);
  };

  const handleChurchSelect = (church) => {
    setSelectedChurch(church);
  };

  const handleAddChurch = (coordinates) => {
    if (isAddingMode) {
      setNewChurchCoordinates(coordinates);
      onAddModalOpen();
      setIsAddingMode(false);
    }
  };

  const handleSaveChurch = () => {
    loadChurches(); // Refresh the churches list
    setNewChurchCoordinates(null);
  };

  const handleCenterMap = (location) => {
    setCenterLocation(location);
  };

  const displayedChurches = searchResults.length > 0 ? searchResults : churches;

  return (
    <Box minHeight="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Container maxW="container.xl" py={4}>
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="brand.600">
                ⛪ Church Locator
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Find churches and places of worship near you
              </Text>
            </VStack>
            
            <HStack spacing={4}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="add-mode" mb="0" fontSize="sm">
                  Add Mode
                </FormLabel>
                <Switch
                  id="add-mode"
                  isChecked={isAddingMode}
                  onChange={(e) => setIsAddingMode(e.target.checked)}
                  colorScheme="green"
                />
              </FormControl>
              
              <Button
                colorScheme="blue"
                onClick={() => {
                  setNewChurchCoordinates(null);
                  onAddModalOpen();
                }}
              >
                Add Church
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={6}>
        <Flex gap={6} height="calc(100vh - 200px)">
          {/* Left Sidebar - Search */}
          <Box width="350px" flexShrink={0}>
            <VStack spacing={4} align="stretch">
              <Search 
                onSearchResults={handleSearchResults}
                onCenterMap={handleCenterMap}
              />
              
              {/* Search Results Info */}
              {searchResults.length > 0 && (
                <Box p={4} bg="white" borderRadius="md" shadow="md">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold">
                      Search Results
                    </Text>
                    <Button size="sm" variant="ghost" onClick={handleClearSearch}>
                      Clear
                    </Button>
                  </HStack>
                  
                  <VStack align="stretch" spacing={2}>
                    <HStack>
                      <Badge colorScheme="blue">
                        {searchResults.length} found
                      </Badge>
                      {searchType && (
                        <Badge variant="outline">
                          {searchType === 'text' ? 'Text Search' : 'Proximity Search'}
                        </Badge>
                      )}
                    </HStack>
                    
                    {searchType === 'proximity' && searchResults.length > 0 && (
                      <Text fontSize="sm" color="gray.600">
                        Sorted by distance
                      </Text>
                    )}
                  </VStack>
                </Box>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <Box p={4} bg="white" borderRadius="md" shadow="md">
                  <HStack>
                    <Spinner size="sm" />
                    <Text>Loading churches...</Text>
                  </HStack>
                </Box>
              )}

              {/* Church count */}
              {!isLoading && (
                <Box p={4} bg="white" borderRadius="md" shadow="md">
                  <Text fontSize="sm" color="gray.600">
                    {displayedChurches.length} churches displayed
                  </Text>
                  {isAddingMode && (
                    <Alert status="info" mt={2} borderRadius="md">
                      <AlertIcon />
                      <Text fontSize="sm">
                        Click on the map to add a new church
                      </Text>
                    </Alert>
                  )}
                </Box>
              )}
            </VStack>
          </Box>

          {/* Right Side - Map */}
          <Box flex={1} borderRadius="md" overflow="hidden" shadow="md">
            <ChurchMap
              churches={displayedChurches}
              onChurchSelect={handleChurchSelect}
              onAddChurch={handleAddChurch}
              isAddingMode={isAddingMode}
              selectedChurch={selectedChurch}
              centerLocation={centerLocation}
            />
          </Box>
        </Flex>
      </Container>

      {/* Add/Edit Church Modal */}
      <ChurchModal
        isOpen={isAddModalOpen}
        onClose={onAddModalClose}
        church={null}
        coordinates={newChurchCoordinates}
        onSave={handleSaveChurch}
      />
    </Box>
  );
}

export default App;
