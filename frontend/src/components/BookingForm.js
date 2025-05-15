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

const BookingForm = ({ business, open, onClose }) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      service: '',
      date: null,
      time: null,
      notes: '',
    },
    validationSchema: Yup.object({
      service: Yup.string().required('Service is required'),
      date: Yup.date().required('Date is required').nullable(),
      time: Yup.date().required('Time is required').nullable(),
      notes: Yup.string(),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await bookingApi.create({
          businessId: business._id,
          serviceId: values.service,
          date: values.date,
          time: values.time,
          notes: values.notes,
        });
        toast.success('Booking created successfully!');
        onClose();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error creating booking');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Book an Appointment</DialogTitle>
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
                {(business.services || []).map((service) => (
                  <MenuItem key={service._id} value={service._id}>
                    {service.name} - ${service.price}
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
                  label="Time"
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
              label="Additional Notes"
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
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Book Now
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BookingForm;
