import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Checkbox, FormControlLabel, Box, Divider,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState } from 'react';

const CONSENT_STATEMENTS = [
  'I have read and understood the Participant Information Sheet.',
  'I understand that my participation is voluntary and I may withdraw at any time.',
  'I consent to my anonymised data being collected and used for this academic research study.',
  'I am 16 years of age or older.',
];

/**
 * Reusable consent modal — shown when a user needs to confirm participation consent.
 * Props:
 *  open       — controls visibility
 *  onConfirm  — called when user agrees
 *  onCancel   — called when user dismisses without agreeing
 */
export default function ConsentModal({ open, onConfirm, onCancel }) {
  const [agreed, setAgreed] = useState(false);

  const handleClose = () => {
    setAgreed(false);
    onCancel?.();
  };

  const handleConfirm = () => {
    if (!agreed) return;
    setAgreed(false);
    onConfirm?.();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoOutlinedIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Informed Consent
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Before proceeding, please confirm that you agree to the following:
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {CONSENT_STATEMENTS.map((statement, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex', alignItems: 'flex-start', gap: 1,
                p: 1.5, borderRadius: 1,
                background: 'rgba(0,0,0,0.02)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <Typography sx={{ color: 'primary.main', fontWeight: 800, minWidth: 18, mt: 0.1 }}>✓</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {statement}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <FormControlLabel
          control={
            <Checkbox
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" fontWeight={700}>
              I agree to all of the above and consent to participate in this study
            </Typography>
          }
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!agreed}
        >
          Confirm Consent
        </Button>
      </DialogActions>
    </Dialog>
  );
}
