import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  Divider,
  Button,
  Avatar,
  Stack,
  useMediaQuery,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import { useEffect, useRef, useState, useCallback } from 'react';
import { trainingProgramApi } from '../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChatIcon from '@mui/icons-material/Chat';
import MobileScreenShareIcon from '@mui/icons-material/MobileScreenShare';
import { formatImageUrl } from '../utils/urlUtils';

// Helper to get full image URL
const getImageUrl = (url) => {
  return formatImageUrl(url);
};

const AboutUs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemWidth = isMobile ? 300 : 350;
  const gap = 24;

  const scrollToItem = useCallback((index) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    
    const scrollPosition = index * (itemWidth + gap);
    carousel.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  }, [itemWidth, gap]);

  useEffect(() => {
    const fetchTrainingPrograms = async () => {
      try {
        const response = await trainingProgramApi.getAll();
        setTrainingPrograms(response.data);
        setLoading(false);
      } catch (err) {
        setError('Échec du chargement des programmes de formation');
        setLoading(false);
        console.error('Error fetching training programs:', err);
      }
    };

    fetchTrainingPrograms();
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const scrollInterval = setInterval(() => {
      if (isPaused) return;
      
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % trainingPrograms.length;
        scrollToItem(nextIndex);
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, [isPaused, trainingPrograms.length, scrollToItem]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handlePrev = () => {
    setCurrentIndex(prev => {
      const newIndex = prev === 0 ? trainingPrograms.length - 1 : prev - 1;
      scrollToItem(newIndex);
      return newIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex(prev => {
      const newIndex = (prev + 1) % trainingPrograms.length;
      scrollToItem(newIndex);
      return newIndex;
    });
  };

  const handleDotClick = (dotIndex) => {
    setCurrentIndex(dotIndex);
    scrollToItem(dotIndex);
  };

  const features = [
    {
      icon: <StarIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Découvrez les Meilleurs Prestataires de Services à Proximité',
      desc: 'Trouvez les professionnels les mieux notés et les plus fiables de votre région pour tous vos services à domicile.'
    },
    {
      icon: <MobileScreenShareIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Consultez vos Services Favoris',
      desc: 'Accédez facilement et gérez vos services et prestataires favoris depuis votre tableau de bord.'
    },
    {
      icon: <ChatIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Chat en Direct et Appel',
      desc: 'Connectez-vous instantanément avec les prestataires de services pour des devis, des questions et du support.'
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', pt: 0, pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          width: '100%',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
          py: { xs: 8, md: 12 },
          px: 3,
          textAlign: 'center',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url(/images/bg.jpg) center/cover no-repeat',
            opacity: 0.1,
          }
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant={isMobile ? 'h3' : 'h2'} 
            fontWeight={800} 
            gutterBottom
            sx={{
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
          >
            À PROPOS DE LAGHAZALA
          </Typography>
          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            maxWidth={800} 
            mx="auto" 
            sx={{ 
              opacity: 0.9,
              position: 'relative',
              mb: 4
            }}
          >
            Société Laghazala du désert formations et services est une entreprise tunisienne certifiée de formation et de services informatiques (SARL) fondée en 2021.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            endIcon={<ArrowForwardIcon />}
            size="large"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 700,
              fontSize: isMobile ? '0.875rem' : '1rem',
              boxShadow: theme.shadows[4],
              '&:hover': {
                boxShadow: theme.shadows[6],
              }
            }}
            onClick={() => {
              const section = document.getElementById('carousel');
              if (section) {
                const yOffset = -100;
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
          >
            DÉCOUVRIR NOS PROGRAMMES
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Company Overview */}
        <Box 
          mt={10}
          mb={8}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 4,
            p: { xs: 3, md: 5 },
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h4" 
                color="text.primary" 
                fontWeight={800} 
                gutterBottom
                sx={{ mb: 3 }}
              >
                QUI SOMMES-NOUS
              </Typography>
              <Typography variant="body1" paragraph>
                Basés à Kébili et Gabès, nous sommes officiellement accrédités par le Ministère de l'Emploi et de la Formation Professionnelle (73-064-22) et engagés à autonomiser les individus et les professionnels à travers des expériences d'apprentissage innovantes.
              </Typography>
              <Typography variant="body1" paragraph>
                Notre mission est de combler le fossé entre l'éducation et l'emploi en offrant des formations professionnelles de haute qualité répondant aux besoins du marché.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: '100%',
                  minHeight: 300,
                  backgroundImage: 'url(/images/training-center.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 3,
                  boxShadow: theme.shadows[4]
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Mission & Objectives */}
        <Box 
          mt={10}
          mb={8}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 4,
            p: { xs: 3, md: 5 },
          }}
        >
          <Typography 
            variant="h4" 
            color="primary" 
            fontWeight={800} 
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', mb: 3 }}
          >
            <EmojiObjectsIcon sx={{ mr: 2, fontSize: 'inherit' }} />
            MISSION & OBJECTIFS
          </Typography>
          <Typography variant="body1" mb={4} color="text.secondary">
            Chez Laghazala, nous nous engageons à transformer des vies grâce à l'éducation professionnelle et au développement des compétences.
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                icon: <GroupsIcon color="primary" fontSize="large" />,
                title: "AUTONOMISATION DES JEUNES",
                text: "Renforcer et développer les compétences des jeunes à travers des programmes de formation pratiques et concrets."
              },
              {
                icon: <SchoolIcon color="primary" fontSize="large" />,
                title: "DÉVELOPPEMENT PROFESSIONNEL",
                text: "Accompagner les professionnels dans l'identification de leurs besoins en formation et l'amélioration de leurs pratiques grâce à des solutions personnalisées."
              },
              {
                icon: <EmojiObjectsIcon color="primary" fontSize="large" />,
                title: "INNOVATION",
                text: "Promouvoir la recherche et l'innovation dans le développement professionnel continu avec évaluation d'impact."
              }
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.shadows[6],
                    }
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 56, height: 56 }}>
                      {item.icon}
                    </Avatar>
                  </Box>
                  <Typography variant="h6" fontWeight={800} gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.text}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Training Programs Carousel */}
        <Box 
          id="carousel"
          mt={10}
          mb={8}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            position: 'relative'
          }}
        >
          <Typography 
            variant="h4" 
            color="secondary" 
            fontWeight={800} 
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', mb: 4 }}
          >
            <SchoolIcon sx={{ mr: 2, fontSize: 'inherit' }} />
            NOS PROGRAMMES DE FORMATION
          </Typography>
          <Typography variant="body1" mb={4} color="text.secondary">
            Nous proposons un portefeuille diversifié de programmes professionnels et techniques conçus pour répondre aux besoins du marché :
          </Typography>
          
          {/* Carousel Container */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
              borderRadius: 3,
              '&:hover .carousel-arrow': {
                opacity: 1
              }
            }}
          >
            {/* Navigation Arrows */}
            <IconButton
              className="carousel-arrow"
              onClick={handlePrev}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,1)',
                  color: 'primary.dark',
                },
                transition: 'all 0.2s ease',
                opacity: 0,
                boxShadow: theme.shadows[2],
                width: 40,
                height: 40,
              }}
            >
              <ChevronLeft fontSize="medium" />
            </IconButton>

            <IconButton
              className="carousel-arrow"
              onClick={handleNext}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,1)',
                  color: 'primary.dark',
                },
                transition: 'all 0.2s ease',
                opacity: 0,
                boxShadow: theme.shadows[2],
                width: 40,
                height: 40,
              }}
            >
              <ChevronRight fontSize="medium" />
            </IconButton>

            {/* Carousel Items */}
            <Box 
              ref={carouselRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              sx={{
                display: 'flex',
                gap: `${gap}px`,
                width: '100%',
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                py: 2,
                px: 1,
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none'
                },
                minWidth: '100%'
              }}
            >
              {trainingPrograms.map((program, index) => (
                <Paper 
                  key={program._id}
                  elevation={0}
                  sx={{
                    flex: `0 0 ${itemWidth}px`,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    position: 'relative',
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s, box-shadow 0.3s ease`,
                    boxShadow: loaded ? 3 : 0,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  {/* Image with gradient overlay */}
                  <Box
                    sx={{
                      height: 200,
                      backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${getImageUrl(program.image)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'flex-end',
                    }}
                  >
                    {/* Hover content */}
                    <Box 
                      className="hover-content"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: 0,
                        transform: 'translateY(10px)',
                        transition: 'all 0.3s ease',
                        p: 3,
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        color="common.white" 
                        textAlign="center" 
                        sx={{ mb: 2 }}
                      >
                        {program.description}
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="secondary"
                        size="small"
                        sx={{
                          borderRadius: '20px',
                          px: 3,
                          fontWeight: 700,
                          textTransform: 'none',
                        }}
                      >
                        Détails du programme
                      </Button>
                    </Box>
                    
                    {/* Badge */}
                    {program.isPopular && (
                      <Chip
                        label="Popular"
                        color="secondary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          fontWeight: 700,
                          boxShadow: theme.shadows[2],
                        }}
                      />
                    )}
                    
                    {/* Title */}
                    <Typography 
                      variant="h6" 
                      fontWeight={800} 
                      sx={{ 
                        color: 'common.white',
                        p: 3,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        width: '100%',
                      }}
                    >
                      {program.name}
                    </Typography>
                  </Box>
                  
                  {/* Bottom content */}
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {program.duration}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon color="warning" fontSize="small" />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {program.rating} ({program.reviews})
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                      <Typography variant="body2" fontWeight={700}>
                        À partir de {program.price} TND
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        size="small"
                        endIcon={<ArrowForwardIcon fontSize="small" />}
                        sx={{
                          borderRadius: '20px',
                          px: 2,
                          py: 0.5,
                          fontWeight: 700,
                          textTransform: 'none',
                        }}
                      >
                        S'inscrire
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
          
          {/* Navigation Dots */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 3, mb: 8 }}>
            {trainingPrograms.map((_, index) => (
              <Box
                key={index}
                onClick={() => handleDotClick(index)}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: currentIndex === index ? 'primary.main' : 'grey.400',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.2)',
                    bgcolor: 'primary.dark',
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Why Choose Us */}
        <Box 
          mt={10}
          sx={{
            background: '#222', 
            color: '#fff',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            position: 'relative',
            overflow: 'visible',
            minHeight: 300,
            mb: 8
          }}
        >
          {/* Content with higher z-index */}
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography 
              variant="h4" 
              color="primary" 
              fontWeight={800} 
              gutterBottom
              sx={{ mb: 3 }}
            >
              POURQUOI CHOISIR LAGHAZALA ?
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <List disablePadding>
                  {[
                    'Programmes de formation accrédités et alignés sur le marché, développés par des experts du secteur',
                    'Infrastructures modernes et formateurs expérimentés',
                    'Certifications reconnues qui renforcent les opportunités de carrière',
                    'Accompagnement personnalisé et soutien continu'
                  ].map((reason, index) => (
                    <ListItem key={index} disableGutters sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CheckCircleIcon color="secondary" />
                      </ListItemIcon>
                      <Typography variant="body1" color="#fff" fontWeight={500}>{reason}</Typography>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Box>

          {/* Image extending beyond container */}
          <Box
            component="img"
            src="/images/trainees.png"
            alt="Trainees"
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              right: { xs: 16, md: 24 },
              bottom: 0,
              height: '120%',
              width: 'auto',
              maxHeight: '120%',
              objectFit: 'contain',
              zIndex: 1,
              pb: 0,
              dropShadow: '0 25px 25px rgba(0,0,0,0.3)',
            }}
          />
        </Box>

        {/* Contact Information */}
        <Box mt={10}>
          <Typography 
            variant="h4" 
            color="secondary" 
            fontWeight={800} 
            gutterBottom
            sx={{ mb: 3 }}
          >
            NOUS CONTACTER
          </Typography>
          <Divider sx={{ mb: 4 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Paper 
                elevation={4}
                sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[6],
                  }
                }}
              >
                <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
                  NOS ADRESSES
                </Typography>
                <Stack spacing={3}>
                  <Box display="flex" alignItems="flex-start">
                    <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                      <LocationOnIcon color="primary" />
                    </Avatar>
                    <Box>
                      <Typography fontWeight={700}>BUREAU DE KÉBILI</Typography>
                      <Typography variant="body2" color="text.secondary">
                        13 Rue La Victoire, Kébili
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="flex-start">
                    <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                      <LocationOnIcon color="primary" />
                    </Avatar>
                    <Box>
                      <Typography fontWeight={700}>BUREAU DE GABÈS</Typography>
                      <Typography variant="body2" color="text.secondary">
                        25 Rue Med Ali, Gabès
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper 
                elevation={4}
                sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[6],
                  }
                }}
              >
                <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
                  NOUS JOINDRE
                </Typography>
                <Stack spacing={3}>
                  <Box display="flex" alignItems="flex-start">
                    <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                      <PhoneIcon color="primary" />
                    </Avatar>
                    <Box>
                      <Typography fontWeight={700}>TÉLÉPHONE</Typography>
                      <Typography variant="body2" color="text.secondary">
                        50464602
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="flex-start">
                    <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                      <EmailIcon color="primary" />
                    </Avatar>
                    <Box>
                      <Typography fontWeight={700}>EMAIL</Typography>
                      <Typography variant="body2" color="text.secondary">
                        contact@laghazala.tn
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUs;