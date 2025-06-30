import React, { useEffect, useState } from "react";
import axios from "axios";
// @mui components
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
// Material Dashboard components
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import { jwtDecode } from "jwt-decode";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState([0, 0, 0, 0, 0]);
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get("token") || localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      console.log("Token saved to localStorage:", token);

      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);

        const userRoleFromToken = decodedToken.role || "guest";
        console.log("User Role from Token:", userRoleFromToken);

        localStorage.setItem("role", userRoleFromToken);

        if (userRoleFromToken !== "admin") {
          console.warn("Unauthorized access. Redirecting to presentation page.");
          window.location.href = "http://localhost:3000/presentation";
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    } else {
      localStorage.removeItem("token");
      console.warn("Unauthorized access. Redirecting to presentation page.");
      window.location.href = "http://localhost:3000/presentation";
    }
  }, [token]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3001/products");
      setProducts(response.data);
      setTotalProducts(response.data.length);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get("http://localhost:3001/reviews");
      const {
        reviews: reviewList,
        totalReviews,
        averageRating,
        ratingDistribution,
      } = response.data;

      setReviews(reviewList || []);
      setTotalReviews(totalReviews || 0);
      setAverageRating(parseFloat(averageRating).toFixed(2)); // convert string to float & format
      setRatingDistribution(ratingDistribution || [0, 0, 0, 0, 0]);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchReviews();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <ComplexStatisticsCard
              color="primary"
              icon="store"
              title="Total Products"
              count={totalProducts}
              percentage={{
                color: "success",
                amount: "+5%",
                label: "since last month",
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <ComplexStatisticsCard
              color="dark"
              icon="star_rate"
              title="Total Reviews"
              count={totalReviews}
              percentage={{
                color: "success",
                amount: "+10%",
                label: "since last week",
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <ComplexStatisticsCard
              color="success"
              icon="grade"
              title="Average Rating"
              count={averageRating}
              percentage={{
                color: "warning",
                amount: "+2%",
                label: "since last week",
              }}
            />
          </Grid>
        </Grid>

        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ReportsLineChart
                color="info"
                title="Reviews by Rating"
                description="Rating distribution for reviews"
                date="updated 5 mins ago"
                chart={{
                  labels: [1, 2, 3, 4, 5],
                  datasets: {
                    label: "Ratings",
                    data: ratingDistribution,
                    borderColor: "#3f51b5",
                    backgroundColor: "rgba(63, 81, 181, 0.2)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                  },
                }}
              />
            </Grid>
          </Grid>
        </MDBox>

        <MDBox mt={4.5}>
          <Typography variant="h6">Latest Reviews</Typography>
          <MDBox mt={2}>
            <Grid container spacing={3}>
              {reviews.slice(0, 5).map((review) => (
                <Grid item xs={12} md={6} lg={4} key={review._id}>
                  <Typography variant="body1">
                    <strong>Product:</strong> {review.product?.emri || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Rating:</strong> {review.rating} / 5
                  </Typography>
                  <Typography variant="body2">
                    <strong>Comment:</strong> {review.comment || review.koment || "No comment"}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    User: {review.user ? `${review.user.emri} ${review.user.mbiemri}` : "Anonymous"}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </MDBox>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
