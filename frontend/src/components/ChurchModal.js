import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  Select,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { churchService } from '../services/api';

const ChurchModal = ({ isOpen, onClose, church = null, onSave, coordinates = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    denomination: '',
    religion: 'christian',
    amenity: 'place_of_worship',
    building: 'church',
    address: '',
    phone: '',
    website: '',
    description: '',
    latitude: '',
    longitude: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef();

  const isEdit = !!church;

  useEffect(() => {
    if (church) {
      setFormData({
        name: church.name || '',
        denomination: church.denomination || '',
        religion: church.religion || 'christian',
        amenity: church.amenity || 'place_of_worship',
        building: church.building || 'church',
        address: church.address || '',
        phone: church.phone || '',
        website: church.website || '',
        description: church.description || '',
        latitude: church.latitude || '',
        longitude: church.longitude || '',
      });
    } else if (coordinates) {
      setFormData(prev => ({
        ...prev,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }));
    }
  }, [church, coordinates]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };

      if (isEdit) {
        await churchService.updateChurch(church.id, data);
        toast({
          title: 'Church Updated',
          description: 'Church information has been successfully updated.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await churchService.createChurch(data);
        toast({
          title: 'Church Added',
          description: 'New church has been successfully added.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onSave();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'An error occurred while saving the church.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await churchService.deleteChurch(church.id);
      toast({
        title: 'Church Deleted',
        description: 'Church has been successfully deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSave();
      onClose();
      onDeleteClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the church.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      denomination: '',
      religion: 'christian',
      amenity: 'place_of_worship',
      building: 'church',
      address: '',
      phone: '',
      website: '',
      description: '',
      latitude: '',
      longitude: '',
    });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>{isEdit ? 'Edit Church' : 'Add New Church'}</ModalHeader>
            <ModalCloseButton />
            
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter church name"
                  />
                </FormControl>

                <HStack width="100%">
                  <FormControl>
                    <FormLabel>Latitude</FormLabel>
                    <NumberInput
                      value={formData.latitude}
                      onChange={(value) => handleInputChange('latitude', value)}
                      precision={6}
                      min={-90}
                      max={90}
                    >
                      <NumberInputField placeholder="Latitude" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Longitude</FormLabel>
                    <NumberInput
                      value={formData.longitude}
                      onChange={(value) => handleInputChange('longitude', value)}
                      precision={6}
                      min={-180}
                      max={180}
                    >
                      <NumberInputField placeholder="Longitude" />
                    </NumberInput>
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Denomination</FormLabel>
                  <Select
                    value={formData.denomination}
                    onChange={(e) => handleInputChange('denomination', e.target.value)}
                    placeholder="Select denomination"
                  >
                    <option value="catholic">Catholic</option>
                    <option value="protestant">Protestant</option>
                    <option value="orthodox">Orthodox</option>
                    <option value="evangelical">Evangelical</option>
                    <option value="lutheran">Lutheran</option>
                    <option value="baptist">Baptist</option>
                    <option value="methodist">Methodist</option>
                    <option value="pentecostal">Pentecostal</option>
                    <option value="anglican">Anglican</option>
                    <option value="presbyterian">Presbyterian</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter address"
                  />
                </FormControl>

                <HStack width="100%">
                  <FormControl>
                    <FormLabel>Phone</FormLabel>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Website</FormLabel>
                    <Input
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="Enter website URL"
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter description"
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                {isEdit && (
                  <Button colorScheme="red" variant="outline" onClick={onDeleteOpen}>
                    Delete
                  </Button>
                )}
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={isLoading}
                  loadingText={isEdit ? 'Updating...' : 'Adding...'}
                >
                  {isEdit ? 'Update' : 'Add'} Church
                </Button>
              </HStack>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Church
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ChurchModal;
