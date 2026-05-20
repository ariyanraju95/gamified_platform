import { Snackbar, Box, Typography } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import { useGamification } from '../../context/GamificationContext';

export default function XPPopup() {
  const { xpPopup, newBadges } = useGamification();

  return (
    <>
      {/* XP gain notification */}
      <Snackbar
        open={!!xpPopup}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 3, py: 2, borderRadius: 3,
            background: 'linear-gradient(135deg,#7C3AED,#A855F7)',
            boxShadow: '0 8px 32px rgba(168,85,247,0.6)',
            border: '1px solid rgba(192,132,252,0.4)',
            animation: 'slideInUp 0.4s ease',
            '@keyframes slideInUp': {
              from: { transform: 'translateY(20px)', opacity: 0 },
              to: { transform: 'translateY(0)', opacity: 1 },
            },
          }}
        >
          <BoltIcon sx={{ fontSize: 28, color: '#FCD34D', filter: 'drop-shadow(0 0 8px #F59E0B)' }} />
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#FCD34D', lineHeight: 1 }}>
              +{xpPopup?.xpEarned} XP
            </Typography>
            {xpPopup?.multiplier > 1 && (
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                🔥 {xpPopup.multiplier}x streak bonus!
              </Typography>
            )}
          </Box>
        </Box>
      </Snackbar>

      {/* Badge unlock notification */}
      {newBadges.map((badge, i) => (
        <Snackbar
          key={badge._id}
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ bottom: `${80 + i * 80}px !important` }}
        >
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              px: 3, py: 2, borderRadius: 3,
              background: 'linear-gradient(135deg,rgba(245,158,11,0.9),rgba(234,88,12,0.9))',
              boxShadow: '0 8px 32px rgba(245,158,11,0.5)',
              border: '1px solid rgba(253,224,71,0.4)',
              animation: 'slideInUp 0.4s ease',
            }}
          >
            <Typography sx={{ fontSize: 24 }}>🏅</Typography>
            <Box>
              <Typography variant="body2" fontWeight={800} sx={{ color: '#fff', lineHeight: 1 }}>
                Badge Unlocked!
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {badge.name}
              </Typography>
            </Box>
          </Box>
        </Snackbar>
      ))}
    </>
  );
}
