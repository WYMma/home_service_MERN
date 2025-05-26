import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { bookingApi } from '../services/api';
import { toast } from 'react-toastify';

const BookingForm = ({ business, services, open, onClose }) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      service: '',
      date: null,
      time: null,
      notes: '',
    },
    validationSchema: Yup.object({
      service: Yup.string().required('Le service est requis'),
      date: Yup.date().required('La date est requise').nullable(),
      time: Yup.date().required('L\'heure est requise').nullable(),
      notes: Yup.string(),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const selectedService = services.find(s => s._id === values.service);
        if (!selectedService) {
          throw new Error('Selected service not found');
        }

        // Format the date and time
        const bookingDate = new Date(values.date);
        const bookingTime = new Date(values.time);
        
        // Format time as HH:mm
        const startTime = bookingTime.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        });

        // Calculate end time based on service duration
        const endTime = new Date(bookingTime.getTime() + selectedService.duration * 60000);

        await bookingApi.create({
          business: business._id,
          service: selectedService._id,
          date: bookingDate,
          startTime,
          endTime,
          totalPrice: selectedService.price,
          notes: values.notes,
        });
        toast.success('Réservation créée avec succès !');
        onClose();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erreur lors de la création de la réservation');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Réserver un Rendez-vous</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {business.name}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Service</InputLabel>
              <Select
                name="service"
                value={formik.values.service}
                onChange={formik.handleChange}
                error={formik.touched.service && Boolean(formik.errors.service)}
                label="Service"
              >
                {services.map((service) => (
                  <MenuItem key={service._id} value={service._id}>
                    {service.name} - {service.price} TND
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ mb: 2 }}>
                <DatePicker
                  label="Date"
                  value={formik.values.date}
                  onChange={(value) => formik.setFieldValue('date', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.date && Boolean(formik.errors.date),
                      helperText: formik.touched.date && formik.errors.date
                    }
                  }}
                  minDate={new Date()}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <TimePicker
                  label="Heure"
                  value={formik.values.time}
                  onChange={(value) => formik.setFieldValue('time', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.time && Boolean(formik.errors.time),
                      helperText: formik.touched.time && formik.errors.time
                    }
                  }}
                />
              </Box>
            </LocalizationProvider>

            <TextField
              fullWidth
              name="notes"
              label="Notes Additionnelles"
              multiline
              rows={4}
              value={formik.values.notes}
              onChange={formik.handleChange}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Réserver Maintenant
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BookingForm;
