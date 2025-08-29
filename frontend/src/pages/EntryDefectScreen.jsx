/**
 * EntryDefectScreen - Main Defect Logging Interface
 *
 * This is the primary screen for logging defects in the seat manufacturing process.
 * It provides a comprehensive interface with three main sections:
 *
 * 1. LEFT PANEL (30%): Image selection gallery
 *    - Displays all reference images for the current project
 *    - Allows switching between different seat part views
 *    - Shows part information (part name, number)
 *
 * 2. CENTER PANEL (40%): Interactive defect mapping
 *    - Canvas-based defect visualization using Konva.js
 *    - Click-to-place defect markers
 *    - Automatic zone detection for clicked positions
 *    - Visual feedback for selected positions
 *
 * 3. RIGHT PANEL (35%): Defect entry and management
 *    - Defect form modal for new entries
 *    - Defect list with filtering capabilities
 *    - Real-time defect display and editing
 *
 * Key Features:
 * - Point-in-polygon zone detection
 * - Real-time defect refresh after submissions
 * - Image-specific zone and defect loading
 * - Automatic part metadata association
 * - Responsive three-column layout
 *
 * Data Flow:
 * 1. Load project images on mount
 * 2. Select image → fetch image details and zones
 * 3. Click on image → detect zone and set position
 * 4. Submit defect → refresh defect list and clear position
 *
 * @returns {JSX.Element} The main defect entry interface
 */

import React, { useState, useEffect } from 'react';
import inside from 'point-in-polygon'; // Point-in-polygon detection for zones
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from '@mui/material';

// Services and utilities
import api from '../services/api';
import logger from '../utils/logger';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// Components
import DefectMap from '../components/DefectMap';
import DefectFormModal from '../components/DefectFormModal';
import DefectList from '../components/DefectList';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * EntryDefectScreen Component
 *
 * Manages the main defect logging workflow with state for:
 * - Image selection and metadata
 * - Zone definitions for polygon detection
 * - Click position tracking
 * - Defect form integration
 * - Real-time updates and filtering
 */
export default function EntryDefectScreen() {
  // Router state and navigation
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const selectedProject = location.state?.project || projectId;

  // State Management
  // ================

  // Image and part data
  const [images, setImages] = useState([]); // All project images from API
  const [selectedImage, setSelectedImage] = useState(null); // Currently selected image with metadata
  const [selectedPartId, setSelectedPartId] = useState(null); // Associated part ID
  const [selectedPartName, setSelectedPartName] = useState(''); // Human-readable part name
  const [selectedPartNumber, setSelectedPartNumber] = useState(''); // Manufacturing part number

  // Zone and interaction data
  const [zones, setZones] = useState([]); // Polygon zone definitions for current image
  const [clickPos, setClickPos] = useState(null); // Last clicked position {x, y}
  const [autoZoneId, setAutoZoneId] = useState(null); // Auto-detected zone ID from click

  // UI state and refresh controls
  const [defectRefresh, setDefectRefresh] = useState(0); // Increment to refresh DefectMap/List
  const [loading, setLoading] = useState(true); // Initial project images loading
  const [imageLoading, setImageLoading] = useState(false); // Individual image selection loading

  // Filtering state for defect display
  const [filters, setFilters] = useState({
    build_event_id: '', // Filter by manufacturing event
    defect_type_id: '', // Filter by defect category
  });

  // Effects and Data Loading
  // ========================

  /**
   * Load all project images on component mount or project change
   * Auto-selects the first image if available
   */
  useEffect(() => {
    if (selectedProject) {
      setLoading(true);
      api
        .get(`/images?project_id=${selectedProject}`)
        .then((res) => {
          const imageData = res.data?.data || res.data || [];
          setImages(imageData);
          // Auto-select first image for immediate usability
          if (imageData.length) {
            handleSelectImage(imageData[0]);
          }
        })
        .catch((error) => {
          logger.error('Failed to load images', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedProject]);

  /**
   * Handle image selection with enhanced metadata loading
   * Fetches additional part information and sets up the interface
   *
   * @param {Object} img - Image object from the gallery
   * @param {number} img.id - Image database ID
   * @param {string} img.url - Image file URL
   */
  async function handleSelectImage(img) {
    setImageLoading(true);
    try {
      // Fetch enhanced image metadata including part associations
      const res = await api.get(`/images/${img.id}`);
      const data = res.data?.data || res.data || img;

      // Update selected image and associated part metadata
      setSelectedImage(data);
      setSelectedPartId(data.part_id || null);
      setSelectedPartName(data.part_name || '');
      setSelectedPartNumber(data.part_number || '');
    } catch (err) {
      logger.error('Failed to fetch image details', err);
      // Fallback to basic image data if enhanced fetch fails
      setSelectedImage(img);
      setSelectedPartId(null);
      setSelectedPartName('');
      setSelectedPartNumber('');
    } finally {
      setImageLoading(false);
    }
  }

  /**
   * Load zone definitions whenever the selected image changes
   * Zones are polygon areas that can be clicked for defect placement
   * Handles multiple coordinate formats for backwards compatibility
   */
  useEffect(() => {
    if (!selectedImage) {
      setZones([]);
      return;
    }
    api
      .get(`/images/${selectedImage.id}/zones`)
      .then((res) => {
        const zonesData = res.data?.data || res.data || [];
        const parsed = zonesData.map((z) => {
          /**
           * Zone Coordinate Parsing
           * Handles multiple legacy formats for zone polygon coordinates:
           * - polygon_coords: JSON string format
           * - coords_json: Alternative JSON string format
           * - coords: Direct array format
           * - vertices: Alternative direct array format
           * - geometry.coordinates: GeoJSON-style format
           */
          let raw = [];

          // Try different coordinate formats in order of preference
          if (typeof z.polygon_coords === 'string') {
            try {
              raw = JSON.parse(z.polygon_coords);
            } catch (e) {
              logger.error('Invalid polygon_coords for zone', {
                zoneId: z.id,
                error: e,
              });
            }
          } else if (typeof z.coords_json === 'string') {
            try {
              raw = JSON.parse(z.coords_json);
            } catch (e) {
              logger.error('Invalid coords_json for zone', {
                zoneId: z.id,
                error: e,
              });
            }
          } else if (Array.isArray(z.coords)) {
            raw = z.coords;
          } else if (Array.isArray(z.vertices)) {
            raw = z.vertices;
          } else if (z.geometry && Array.isArray(z.geometry.coordinates)) {
            raw = z.geometry.coordinates[0] || [];
          } else {
            logger.warn('No polygon data for zone', { zoneId: z.id });
          }

          // Normalize all formats to [[x,y], [x,y], ...] array
          const coords = Array.isArray(raw) ? raw.map((p) => [p.x, p.y]) : [];
          return { id: z.id, coords };
        });
        logger.debug('Parsed zones', parsed);
        setZones(parsed);
      })
      .catch((err) => logger.error('Failed to load zones', err));
  }, [selectedImage]);

  // Component Render
  // ================

  // Show loading state while fetching initial project images
  if (loading) {
    return <LoadingSpinner message="Loading project images..." />;
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - var(--navbar-height))' }}>
      {/* LEFT PANEL (30%): Reference Image Selection Gallery */}
      <Box sx={{ width: '30%', bgcolor: 'grey.200', p: 2, overflow: 'auto' }}>
        {/* Navigation back to project selection */}
        <Button
          variant="outlined"
          sx={{ mb: 2, display: 'block', textAlign: 'center' }}
          onClick={() => navigate('/')}
        >
          ← Back to Project Select
        </Button>

        <Typography variant="h6">Image Selection</Typography>

        {/* Image gallery grid - 2 columns for optimal viewing */}
        <Grid container spacing={2} sx={{ paddingTop: '10px' }}>
          {images.map((img) => (
            <Grid item xs={6} key={img.id}>
              <Card>
                <CardActionArea
                  onClick={() => handleSelectImage(img)}
                  disabled={imageLoading} // Prevent multiple selections during load
                >
                  <CardMedia
                    component="img"
                    image={`${process.env.REACT_APP_API_URL}${img.url}`}
                    alt={img.filename}
                    sx={{ height: 200, objectFit: 'contain' }}
                  />
                  <CardContent>
                    <Typography variant="body2" noWrap>
                      {img.filename}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CENTER PANEL (40%): Interactive Canvas-Based Defect Map */}
      <Box
        sx={{
          width: '40%',
          p: 2,
          overflow: 'auto',
          borderRight: '1px solid black',
          borderLeft: '1px solid black',
          bgcolor: 'grey.100',
        }}
      >
        <Typography variant="h6">Defect Map</Typography>
        <Box sx={{ paddingTop: '10px' }}>
          {imageLoading ? (
            /* Loading state during image switching */
            <LoadingSpinner message="Loading image..." minHeight="400px" />
          ) : selectedImage ? (
            /* Main DefectMap component - handles canvas rendering and interactions */
            <DefectMap
              imageId={selectedImage.id}
              imageUrl={selectedImage.url}
              refreshKey={defectRefresh} // Incremented to trigger re-render after defect submission
              filters={filters} // Apply defect type/build event filtering
              maxWidthPercent={0.35} // Canvas sizing for center panel
              maxHeightPercent={0.9}
              onClick={(pos) => {
                // Handle canvas click for defect placement
                setClickPos(pos);

                // Auto-detect zone using point-in-polygon algorithm
                const hit = zones.find(
                  (z) =>
                    z &&
                    Array.isArray(z.coords) &&
                    inside([pos.x, pos.y], z.coords) // Point-in-polygon detection
                );
                setAutoZoneId(hit ? hit.id : null);
              }}
              selectedPosition={clickPos} // Show visual marker for selected position
            />
          ) : (
            /* Empty state when no image is selected */
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              minHeight="400px"
            >
              <Typography variant="body1" color="text.secondary">
                Select an image to view the defect map
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* RIGHT PANEL (35%): Defect Entry Form and Management */}
      <Box
        sx={{
          width: '35%',
          bgcolor: 'background.paper',
          p: 2,
          overflow: 'auto',
        }}
      >
        {selectedImage && (
          <>
            {/* Defect Entry Form - Appears when user clicks on canvas */}
            <DefectFormModal
              initialPosition={clickPos ?? { x: 0, y: 0 }} // Pre-fill with clicked coordinates
              initialZoneId={autoZoneId} // Auto-select detected zone
              zonesUrl={`/images/${selectedImage.id}/zones`} // Data source for zone dropdown
              defectsUrl={`/images/${selectedImage.id}/defects`} // Not used in current implementation
              partId={selectedPartId}
              partName={selectedPartName}
              partNumber={selectedPartNumber}
              onSave={(formData) => {
                /**
                 * Handle defect submission
                 * Creates new defect record and refreshes the interface
                 */
                api
                  .post('/defects', {
                    image_id: selectedImage.id,
                    zone_id: formData.zone_id,
                    x: clickPos.x,
                    y: clickPos.y,
                    cbu: formData.cbu, // Customer Build Unit identifier
                    part_id: selectedPartId,
                    build_event_id: formData.build_event_id,
                    defect_type_id: formData.defect_type_id,
                    photo_url: formData.photo_url,
                  })
                  .then(() => {
                    setClickPos(null); // Clear click marker from canvas
                    setDefectRefresh((r) => r + 1); // Trigger DefectMap and DefectList refresh
                  })
                  .catch((error) => logger.error('Operation failed', error));
              }}
            />

            {/* Defect Management List with Filtering */}
            <DefectList
              imageId={selectedImage.id}
              refreshKey={defectRefresh} // Synchronized with form submission
              filters={filters} // Current filter state
              onFiltersChange={setFilters} // Update filters (also affects DefectMap)
            />
          </>
        )}
      </Box>
    </Box>
  );
}
