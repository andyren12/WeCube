import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import {
  TrendingUp,
  Inventory,
  AttachMoney,
  ShoppingCart,
  Edit,
  Delete,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalSales: 0,
    totalEarnings: 0,
  });
  const [userListings, setUserListings] = useState([]);
  const [pastSales, setPastSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      const listingsQuery = query(
        collection(db, "listings"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const listingsSnapshot = await getDocs(listingsQuery);
      const listings = listingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUserListings(listings);
      console.log(listings);

      const totalListings = listings.length;
      const activeListings = listings.filter((listing) => !listing.sold).length;

      const mockSales = [
        {
          id: 1,
          title: "Gan 356 X 3x3",
          price: 45.99,
          soldDate: new Date("2024-10-01"),
          buyer: "john_doe",
        },
        {
          id: 2,
          title: "MoYu WeiLong WR M",
          price: 32.5,
          soldDate: new Date("2024-10-05"),
          buyer: "speedcuber123",
        },
      ];

      const totalSales = mockSales.length;

      const totalEarnings = mockSales.reduce(
        (sum, sale) => sum + sale.price,
        0
      );

      setStats({
        totalListings,
        activeListings,
        totalSales,
        totalEarnings,
      });

      setPastSales(mockSales);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
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
      <Box sx={{ width: "60vw", mx: "auto", p: 3, mt: 2 }}>
        <Typography variant="h4">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "80vw", mx: "auto", p: 3, mt: 2 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your listings and track your sales performance
      </Typography>

      <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
        <Card sx={{ flex: "1 1 200px", minWidth: 200 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
                p: 2,
              }}
            >
              <Inventory sx={{ fontSize: 24 }} />
              <Typography variant="h5" fontWeight="bold">
                {stats.totalListings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Listings
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: "1 1 200px", minWidth: 200 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
                p: 2,
              }}
            >
              <TrendingUp sx={{ fontSize: 24 }} />
              <Typography variant="h5" fontWeight="bold">
                {stats.activeListings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Listings
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: "1 1 200px", minWidth: 200 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
                p: 2,
              }}
            >
              <ShoppingCart sx={{ fontSize: 24 }} />
              <Typography variant="h5" fontWeight="bold">
                {stats.totalSales}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Sales
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: "1 1 200px", minWidth: 200 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
                p: 2,
              }}
            >
              <AttachMoney sx={{ fontSize: 24 }} />
              <Typography variant="h5" fontWeight="bold">
                {formatPrice(stats.totalEarnings)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Earnings
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Grid container spacing={3}>
        <Grid>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                My Listings
              </Typography>
              <Button variant="contained" href="/sell">
                Create New Listing
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell>Date Listed</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Typography
                            variant="body2"
                            title={listing.title}
                            sx={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              cursor: "pointer",
                              textDecoration: "none",
                              "&:hover": {
                                color: "primary.main",
                              },
                            }}
                            onClick={() => navigate(`/listing/${listing.id}`)}
                          >
                            {listing.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{formatPrice(listing.price)}</TableCell>
                      <TableCell>
                        <Chip
                          label={listing.condition}
                          color={getConditionColor(listing.condition)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(listing.createdAt)}</TableCell>
                      <TableCell>
                        <Chip
                          label={listing.sold ? "Sold" : "Active"}
                          color={listing.sold ? "default" : "success"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => navigate(`/listing/${listing.id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<Delete />}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {userListings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No listings yet. Create your first listing!
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Past Sales Section */}
        <Grid>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Recent Sales
            </Typography>

            <Stack spacing={2}>
              {pastSales.map((sale, index) => (
                <Box key={sale.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {sale.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sold to {sale.buyer}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(sale.soldDate)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      color="success.main"
                      fontWeight="bold"
                    >
                      {formatPrice(sale.price)}
                    </Typography>
                  </Box>
                  {index < pastSales.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
              {pastSales.length === 0 && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No sales yet. Start selling to see your transaction history!
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
