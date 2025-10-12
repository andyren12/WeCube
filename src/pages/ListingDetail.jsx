import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Paper,
  ImageList,
  ImageListItem,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormGroup,
  FormHelperText,
} from "@mui/material";
import {
  Edit,
  LocationOn,
  LocalShipping,
  Groups,
  Close,
  Save,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../contexts/AuthContext";

function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    price: "",
    description: "",
    condition: "",
    deliveryOptions: {
      shipping: false,
      meetup: false,
    },
  });

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const docRef = doc(db, "listings", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const listingData = { id: docSnap.id, ...docSnap.data() };
        setListing(listingData);
        setEditData({
          title: listingData.title,
          price: listingData.price.toString(),
          description: listingData.description || "",
          condition: listingData.condition,
          deliveryOptions: listingData.deliveryOptions || {
            shipping: false,
            meetup: false,
          },
        });
      } else {
        console.log("No such document!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (field) => (event) => {
    setEditData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handlePriceChange = (event) => {
    const value = event.target.value;
    if (/^[0-9]*\.?[0-9]*$/.test(value)) {
      setEditData((prev) => ({
        ...prev,
        price: value,
      }));
    }
  };

  const handleDeliveryChange = (option) => (event) => {
    setEditData((prev) => ({
      ...prev,
      deliveryOptions: {
        ...prev.deliveryOptions,
        [option]: event.target.checked,
      },
    }));
  };

  const handleSave = async () => {
    try {
      const isDeliveryValid =
        editData.deliveryOptions.shipping || editData.deliveryOptions.meetup;

      if (
        !editData.title ||
        !editData.price ||
        !editData.condition ||
        !isDeliveryValid
      ) {
        alert("Please fill in all required fields");
        return;
      }

      const docRef = doc(db, "listings", id);
      await updateDoc(docRef, {
        title: editData.title,
        price: parseFloat(editData.price),
        description: editData.description,
        condition: editData.condition,
        deliveryOptions: editData.deliveryOptions,
        updatedAt: new Date(),
      });

      setListing((prev) => ({
        ...prev,
        title: editData.title,
        price: parseFloat(editData.price),
        description: editData.description,
        condition: editData.condition,
        deliveryOptions: editData.deliveryOptions,
        updatedAt: new Date(),
      }));

      setEditMode(false);
      alert("Listing updated successfully!");
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("Failed to update listing");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString();
  };

  const getConditionColor = (condition) => {
    const colors = {
      new: "success",
      "like-new": "success",
      excellent: "info",
      good: "warning",
      fair: "warning",
      used: "default",
    };
    return colors[condition] || "default";
  };

  if (loading) {
    return (
      <Box sx={{ width: "80vw", mx: "auto", p: 3, mt: 2 }}>
        <Typography variant="h4">Loading...</Typography>
      </Box>
    );
  }

  if (!listing) {
    return (
      <Box sx={{ width: "80vw", mx: "auto", p: 3, mt: 2 }}>
        <Typography variant="h4">Listing not found</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  const isOwner = currentUser && currentUser.uid === listing.userId;

  return (
    <Box sx={{ width: "80vw", mx: "auto", p: 3, mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button onClick={() => navigate(-1)} variant="outlined">
          ← Back
        </Button>
        {isOwner && (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleEditToggle}
          >
            Edit Listing
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Images Section */}
        <Grid>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Photos
            </Typography>
            {listing.photos && listing.photos.length > 0 ? (
              <ImageList variant="masonry" cols={2} gap={8}>
                {listing.photos.map((photo, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={`https://wecube.s3.us-east-1.amazonaws.com/${photo.s3Key}`}
                      alt={`Listing photo ${index + 1}`}
                      loading="lazy"
                      style={{
                        borderRadius: 8,
                        width: "100%",
                        height: "auto",
                      }}
                      onError={(e) => {
                        console.error("Failed to load image:", photo.s3Key);
                        e.target.style.display = "none";
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No photos available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Details Section */}
        <Grid>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {listing.title}
            </Typography>

            <Typography
              variant="h3"
              color="primary"
              fontWeight="bold"
              sx={{ mb: 2 }}
            >
              {formatPrice(listing.price)}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                label={listing.condition}
                color={getConditionColor(listing.condition)}
              />
              <Chip
                label={listing.status === "sold" ? "Sold" : "Available"}
                color={listing.status === "sold" ? "default" : "success"}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1">
              {listing.description || "No description provided."}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Delivery Options
            </Typography>
            <Stack direction="row" spacing={2}>
              {listing.deliveryOptions?.shipping && (
                <Chip
                  sx={{ px: 1 }}
                  icon={<LocalShipping />}
                  label="Shipping Available"
                  variant="outlined"
                />
              )}
              {listing.deliveryOptions?.meetup && (
                <Chip
                  sx={{ px: 1 }}
                  icon={<Groups />}
                  label="Competition Meetup"
                  variant="outlined"
                />
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Listed on {formatDate(listing.createdAt)}
              {listing.updatedAt && (
                <> • Updated on {formatDate(listing.updatedAt)}</>
              )}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={editMode}
        onClose={handleEditToggle}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Edit Listing
            <Button onClick={handleEditToggle}>
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={editData.title}
              onChange={handleInputChange("title")}
              required
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Price (USD)"
                  fullWidth
                  value={editData.price}
                  onChange={handlePriceChange}
                  slotProps={{
                    htmlInput: {
                      inputMode: "decimal",
                    },
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={editData.condition}
                    label="Condition"
                    onChange={handleInputChange("condition")}
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
              value={editData.description}
              onChange={handleInputChange("description")}
            />

            <FormControl required>
              <Typography variant="subtitle1" gutterBottom>
                Delivery Options
              </Typography>
              <FormGroup>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1">Shipping</Typography>
                  <Switch
                    checked={editData.deliveryOptions.shipping}
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
                    checked={editData.deliveryOptions.meetup}
                    onChange={handleDeliveryChange("meetup")}
                  />
                </Box>
              </FormGroup>
              {!editData.deliveryOptions.shipping &&
                !editData.deliveryOptions.meetup && (
                  <FormHelperText error>
                    Please select at least one delivery option
                  </FormHelperText>
                )}
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditToggle}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ListingDetail;
