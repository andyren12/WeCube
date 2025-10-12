import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Grid,
  IconButton,
  Switch,
  FormGroup,
  FormHelperText,
  Fade,
  Grow,
} from "@mui/material";
import { Upload, Close, Check } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../contexts/AuthContext";
import { uploadMultipleImages } from "../utils/s3";

function Sell() {
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState({
    shipping: true,
    meetup: true,
  });
  const [listingData, setListingData] = useState({
    title: "",
    price: "",
    description: "",
    condition: "",
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0); // 0: initial, 1: show check, 2: turn green
  const { currentUser } = useAuth();

  // Handle success animation phases
  useEffect(() => {
    if (showSuccess) {
      setAnimationPhase(0);

      // Phase 1: Show check mark after 300ms
      const timer1 = setTimeout(() => {
        setAnimationPhase(1);
      }, 300);

      // Phase 2: Turn green after 1 second
      const timer2 = setTimeout(() => {
        setAnimationPhase(2);
      }, 1000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [showSuccess]);

  const handlePhotoSelection = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.slice(0, 5 - selectedPhotos.length);

    const photoObjects = newPhotos.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
    }));

    setSelectedPhotos((prev) => [...prev, ...photoObjects]);
  };

  const removePhoto = (photoId) => {
    setSelectedPhotos((prev) => {
      const updated = prev.filter((photo) => photo.id !== photoId);
      const photoToRemove = prev.find((photo) => photo.id === photoId);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.url);
      }
      return updated;
    });
  };

  const handleDeliveryChange = (option) => (event) => {
    setDeliveryOptions((prev) => ({
      ...prev,
      [option]: event.target.checked,
    }));
  };

  const isDeliveryValid = deliveryOptions.shipping || deliveryOptions.meetup;

  const handleInputChange = (field) => (event) => {
    setListingData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handlePriceChange = (event) => {
    const value = event.target.value;
    if (/^[0-9]*\.?[0-9]*$/.test(value)) {
      setListingData((prev) => ({
        ...prev,
        price: value,
      }));
    }
  };

  const handlePublishListing = async () => {
    const isPhotosValid = selectedPhotos.length > 0;
    const isBasicInfoValid =
      listingData.title && listingData.price && listingData.condition;

    if (!isPhotosValid || !isBasicInfoValid || !isDeliveryValid) {
      alert("Please fill in all required fields");
      return;
    }

    if (!currentUser) {
      alert("You must be logged in to create a listing");
      return;
    }

    setIsPublishing(true);

    try {
      const listingId = `listing_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;

      const files = selectedPhotos.map((photo) => photo.file);
      const s3Keys = await uploadMultipleImages(files, listingId);

      const photosForStorage = selectedPhotos.map((photo, index) => ({
        id: photo.id,
        name: photo.file.name,
        size: photo.file.size,
        type: photo.file.type,
        s3Key: s3Keys[index],
        uploadedAt: new Date(),
      }));

      const listingToSave = {
        title: listingData.title,
        price: parseFloat(listingData.price),
        description: listingData.description,
        condition: listingData.condition,
        photos: photosForStorage,
        deliveryOptions,
        status: "active", // New listings start as active
        createdAt: new Date(),
        soldAt: null,
        soldTo: null,
        userId: currentUser.uid,
        listingId, // Store our custom ID for reference
      };

      const docRef = await addDoc(collection(db, "listings"), listingToSave);

      console.log("Listing saved successfully with ID:", docRef.id);

      setShowSuccess(true);

      setTimeout(() => {
        handleClearListing();
        setShowSuccess(false);
        setAnimationPhase(0);
      }, 2000);
    } catch (error) {
      console.error("Error saving listing:", error);

      if (error.message.includes("upload")) {
        alert(`Failed to upload images: ${error.message}`);
      } else {
        alert(`Failed to publish listing: ${error.message}`);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClearListing = () => {
    selectedPhotos.forEach((photo) => {
      URL.revokeObjectURL(photo.url);
    });

    setSelectedPhotos([]);
    setListingData({
      title: "",
      price: "",
      description: "",
      condition: "",
    });
    setDeliveryOptions({
      shipping: true,
      meetup: true,
    });
  };

  return (
    <Box sx={{ width: "60vw", mx: "auto", p: 3, mt: 2 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        List Your Cube
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Fill out the details below to create your listing
      </Typography>

      <Stack spacing={3}>
        <Card
          variant="outlined"
          sx={{ width: "100%", boxShadow: "0 0 8px rgba(0, 0, 0, 0.1)" }}
        >
          {" "}
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="subtitle1"
              component="h2"
              fontWeight="bold"
              sx={{ mb: 1 }}
            >
              Photos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add up to 5 photos of your cube
            </Typography>

            <Grid container spacing={2}>
              {selectedPhotos.map((photo, index) => (
                <Grid key={photo.id}>
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: 120,
                      borderRadius: 1,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "grey.300",
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(0, 0, 0, 0.5)",
                        color: "white",
                        "&:hover": {
                          bgcolor: "rgba(0, 0, 0, 0.7)",
                        },
                      }}
                      onClick={() => removePhoto(photo.id)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}

              {selectedPhotos.length < 5 && (
                <Grid item>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    multiple
                    style={{ display: "none" }}
                    id="photo-upload"
                    onChange={handlePhotoSelection}
                  />
                  <label htmlFor="photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      sx={{
                        width: 120,
                        height: 120,
                        border: "2px dashed",
                        borderColor: "grey.400",
                        borderRadius: 1,
                        color: "grey.600",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        "&:hover": {
                          borderColor: "grey.500",
                          bgcolor: "grey.200",
                        },
                      }}
                    >
                      <Upload sx={{ fontSize: 30 }} />
                      Upload
                    </Button>
                  </label>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{ width: "100%", boxShadow: "0 0 8px rgba(0, 0, 0, 0.1)" }}
        >
          {" "}
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="subtitle1"
              component="h2"
              fontWeight="bold"
              sx={{ mb: 3 }}
            >
              Basic Information
            </Typography>

            <Stack spacing={3}>
              <TextField
                label="Title"
                fullWidth
                placeholder="e.g., Gan 356 X 3x3 Speed Cube"
                variant="outlined"
                value={listingData.title}
                onChange={handleInputChange("title")}
                required
              />

              <Grid container spacing={2}>
                <Grid>
                  <TextField
                    label="Price (USD)"
                    fullWidth
                    placeholder="25.00"
                    variant="outlined"
                    value={listingData.price}
                    onChange={handlePriceChange}
                    slotProps={{
                      htmlInput: {
                        inputMode: "decimal",
                      },
                    }}
                    required
                  />
                </Grid>
                <Grid>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel id="condition-label">Condition</InputLabel>
                    <Select
                      labelId="condition-label"
                      label="Condition"
                      value={listingData.condition}
                      onChange={handleInputChange("condition")}
                      sx={{ minWidth: 120 }}
                      required
                    >
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="like-new">Like New</MenuItem>
                      <MenuItem value="excellent">Excellent</MenuItem>
                      <MenuItem value="good">Good</MenuItem>
                      <MenuItem value="fair">Fair</MenuItem>
                      <MenuItem value="used">Used</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                placeholder="Describe your cube's condition, features, and any included accessories..."
                variant="outlined"
                value={listingData.description}
                onChange={handleInputChange("description")}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{ width: "100%", boxShadow: "0 0 8px rgba(0, 0, 0, 0.1)" }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" component="h2" fontWeight="bold">
              Delivery Options
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose how buyers can receive this item{" "}
            </Typography>

            <FormControl
              sx={{ width: "100%" }}
              error={!isDeliveryValid}
              required
            >
              <FormGroup>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="body1">Shipping</Typography>
                  <Switch
                    checked={deliveryOptions.shipping}
                    onChange={handleDeliveryChange("shipping")}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body1">Competition Meetup</Typography>
                  <Switch
                    checked={deliveryOptions.meetup}
                    onChange={handleDeliveryChange("meetup")}
                  />
                </Box>
              </FormGroup>
              {!isDeliveryValid && (
                <FormHelperText>
                  Please select at least one delivery option
                </FormHelperText>
              )}
            </FormControl>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={handleClearListing}
            sx={{ px: 6, py: 2 }}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handlePublishListing}
            disabled={isPublishing}
            sx={{ px: 6, py: 2 }}
          >
            {isPublishing ? "Publishing..." : "Publish Listing"}
          </Button>
        </Box>
      </Stack>

      <Fade in={showSuccess}>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
              p: 6,
              textAlign: "center",
              maxWidth: 400,
              width: "90%",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* Animated Check Mark Circle */}
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                border: "4px solid",
                borderColor: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px auto",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Grow
                in={animationPhase >= 1}
                timeout={800}
                style={{ transformOrigin: "center" }}
              >
                <Check
                  sx={{
                    fontSize: "4rem",
                    color: "success.main",
                  }}
                />
              </Grow>
            </Box>

            {/* Success Text */}
            <Fade in={animationPhase >= 1} timeout={1000}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                    color: "text.primary",
                  }}
                >
                  Success!
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  Your listing has been published successfully
                </Typography>
              </Box>
            </Fade>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
}

export default Sell;
