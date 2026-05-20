import { Box, Grid, Tooltip, Typography, Avatar } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const iconMap = {
  star: StarIcon,
  school: SchoolIcon,
  local_fire_department: LocalFireDepartmentIcon,
  whatshot: WhatshotIcon,
  emoji_events: EmojiEventsIcon,
  military_tech: MilitaryTechIcon,
  workspace_premium: WorkspacePremiumIcon,
};

const BadgeItem = ({ badge, earned, earnedAt }) => {
  const IconComponent = iconMap[badge.iconKey] || StarIcon;

  return (
    <Tooltip
      title={
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" fontWeight={700}>{badge.name}</Typography>
          <Typography variant="caption" color="text.secondary">{badge.description}</Typography>
          {earned && earnedAt && (
            <Typography variant="caption" display="block" sx={{ color: '#FCD34D', mt: 0.5 }}>
              Earned {new Date(earnedAt).toLocaleDateString()}
            </Typography>
          )}
          {!earned && (
            <Typography variant="caption" display="block" sx={{ color: '#94A3B8', mt: 0.5 }}>
              🔒 Not yet earned
            </Typography>
          )}
        </Box>
      }
      arrow
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.75,
          p: 1.5,
          borderRadius: 3,
          cursor: 'default',
          transition: 'all 0.3s ease',
          background: earned
            ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(245,158,11,0.15))'
            : 'rgba(255,255,255,0.03)',
          border: earned
            ? '1px solid rgba(168,85,247,0.4)'
            : '1px solid rgba(255,255,255,0.06)',
          ...(earned && {
            animation: 'badgeGlow 3s ease-in-out infinite',
            '@keyframes badgeGlow': {
              '0%,100%': { boxShadow: '0 0 8px rgba(168,85,247,0.3)' },
              '50%': { boxShadow: '0 0 18px rgba(168,85,247,0.55)' },
            },
          }),
          '&:hover': earned ? { transform: 'scale(1.08)' } : {},
        }}
      >
        <Avatar
          sx={{
            width: 48, height: 48,
            background: earned
              ? 'linear-gradient(135deg, #7C3AED, #F59E0B)'
              : 'rgba(255,255,255,0.06)',
            filter: earned ? 'none' : 'grayscale(1)',
            opacity: earned ? 1 : 0.4,
            boxShadow: earned ? '0 4px 14px rgba(168,85,247,0.5)' : 'none',
          }}
        >
          {earned
            ? <IconComponent sx={{ fontSize: 24, color: '#fff' }} />
            : <LockIcon sx={{ fontSize: 20, color: '#64748B' }} />
          }
        </Avatar>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: '0.7rem',
            color: earned ? '#C084FC' : '#64748B',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {badge.name}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default function BadgeGrid({ allBadges = [], earnedBadges = [] }) {
  const earnedMap = {};
  earnedBadges.forEach((e) => {
    earnedMap[e.badgeId?._id || e.badgeId] = e.earnedAt;
  });

  return (
    <Grid container spacing={1.5}>
      {allBadges.map((badge) => (
        <Grid item xs={4} sm={3} key={badge._id}>
          <BadgeItem
            badge={badge}
            earned={!!earnedMap[badge._id]}
            earnedAt={earnedMap[badge._id]}
          />
        </Grid>
      ))}
    </Grid>
  );
}
