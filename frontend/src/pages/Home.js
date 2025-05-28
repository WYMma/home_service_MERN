import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { categoryApi, businessApi } from '../services/api';
import CategoryCard from '../components/CategoryCard';
import BusinessCard from '../components/BusinessCard';
import HeroBanner from '../components/HeroBanner';
import CategoryGrid from '../components/CategoryGrid';
import HowItWorksSection from '../components/HowItWorksSection';
import FeaturedServicesSection from '../components/FeaturedServicesSection';
import PricingPlansSection from '../components/PricingPlansSection';
import TestimonialsSection from '../components/TestimonialsSection';
import { useRef } from 'react';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const howItWorksRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, businessesRes] = await Promise.all([
          categoryApi.getAll(),
          businessApi.getAll({ featured: true, limit: 6 })
        ]);
        setCategories(categoriesRes.data);
        setFeaturedBusinesses(businessesRes.data.businesses || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setFeaturedBusinesses([]); 
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ 
      bgcolor: '#fff',
      minHeight: '100vh',
      '& > *': {
        mb: 0,
      }
    }}>
      <HeroBanner />
      <Container maxWidth="lg" sx={{ 
        py: 8,
        px: { xs: 2, sm: 3, md: 4 },
        '& > *': {
          mb: 8,
          '&:last-child': {
            mb: 0
          }
        }
      }}>
        <CategoryGrid />
        <Box ref={howItWorksRef} id="how-it-works-wrapper">
          <HowItWorksSection />
        </Box>
        <FeaturedServicesSection />
        <PricingPlansSection />
        <TestimonialsSection />
      </Container>
    </Box>
  );
};

export default Home;
