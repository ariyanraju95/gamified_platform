import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Card, Typography, TextField, Button,
  Alert, Checkbox, FormControlLabel, CircularProgress, Chip,
  Divider, Select, MenuItem, FormControl, InputLabel,
  Stepper, Step, StepLabel, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';

const STEPS = ['Participant Information', 'Demographics', 'Create Account'];

const AGE_GROUPS = [
  { value: 'under_18', label: 'Under 18' },
  { value: '18_24', label: '18 – 24' },
  { value: '25_34', label: '25 – 34' },
  { value: '35_44', label: '35 – 44' },
  { value: '45_plus', label: '45 or older' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary / Third gender' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const EDUCATION_LEVELS = [
  { value: 'secondary', label: 'Secondary / High School' },
  { value: 'undergraduate', label: "Undergraduate (Bachelor's)" },
  { value: 'postgraduate', label: "Postgraduate (Master's / PhD)" },
  { value: 'professional', label: 'Professional / Vocational qualification' },
  { value: 'other', label: 'Other' },
];

const EXPERIENCE_LEVELS = [
  { value: 'none', label: 'None — I have never programmed before' },
  { value: 'beginner', label: 'Beginner — I know a little (< 6 months)' },
  { value: 'intermediate', label: 'Intermediate — I can write simple programs' },
  { value: 'advanced', label: 'Advanced — I program regularly / professionally' },
];

const LEARNING_FREQUENCY = [
  { value: 'never', label: 'Never' },
  { value: 'rarely', label: 'Rarely (a few times a year)' },
  { value: 'sometimes', label: 'Sometimes (monthly)' },
  { value: 'often', label: 'Often (weekly)' },
  { value: 'very_often', label: 'Very often (daily or near-daily)' },
];

const INFO_SECTIONS = [
  {
    title: '1. What is this study about?',
    content: `This study investigates whether gamification mechanics — such as experience points (XP), daily streaks, achievement badges, and leaderboards — improve user engagement and retention compared to a standard non-gamified interface on an online coding tutorial platform. The platform teaches introductory Python programming across 10 structured lessons.`,
  },
  {
    title: '2. Who is conducting this research?',
    content: `This research is conducted by a final-year undergraduate student at Southampton Solent University as part of the QHO634 Dissertation module. The study is supervised in accordance with the university's academic integrity and research ethics framework.`,
  },
  {
    title: '3. What will I be asked to do?',
    content: `You will be randomly assigned to one of two versions of the platform — Standard (no game mechanics) or Gamified (with XP, streaks and badges). Both versions contain identical lesson content. You are invited to complete as many of the 10 Python lessons as you wish at your own pace. At the end, you will be asked to complete a short usability survey (approximately 5 minutes).`,
  },
  {
    title: '4. What data will be collected?',
    content: `The platform will automatically record: which lessons you complete, how long you spend on each session, your streak and badge progress (if applicable), and your survey responses. Demographic information (age range, gender, education level, prior programming experience) will also be collected at registration. No personally identifiable information beyond your name and email is collected, and your data will be anonymised in all research outputs.`,
  },
  {
    title: '5. Is participation voluntary?',
    content: `Yes. Participation is entirely voluntary. You may withdraw at any time without providing a reason and without any consequences. If you withdraw, your data will be deleted on request — contact the researcher via the university.`,
  },
  {
    title: '6. How will my data be used?',
    content: `Your anonymised data will be used solely for this dissertation project and will not be shared with third parties. Data is stored securely and retained only for the duration required by university policy. The study complies with UK GDPR (2018) and the Data Protection Act (2018). Results may be included in the dissertation and presented at university-level events.`,
  },
  {
    title: '7. Ethical approval',
    content: `This study has been designed in line with the ethical guidelines of Southampton Solent University and the British Computer Society (BCS) Code of Conduct. If you have any concerns about the ethics of this study, please contact the dissertation supervisor through the university.`,
  },
];

export default function Register() {
  const { register, loading } = useAuth();
  const { refresh } = useGamification();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [consentGiven, setConsentGiven] = useState(false);
  const [demographics, setDemographics] = useState({
    ageGroup: '',
    gender: '',
    educationLevel: '',
    priorProgrammingExperience: '',
    onlineLearningFrequency: '',
  });
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleDemoChange = (field) => (e) =>
    setDemographics((d) => ({ ...d, [field]: e.target.value }));

  const handleAccountChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleNextStep = () => {
    setError('');
    if (step === 0 && !consentGiven) {
      setError('You must read and consent to participate before continuing.');
      return;
    }
    if (step === 1) {
      const required = ['ageGroup', 'gender', 'educationLevel', 'priorProgrammingExperience', 'onlineLearningFrequency'];
      if (required.some((k) => !demographics[k])) {
        setError('Please answer all demographic questions before continuing.');
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register({ ...form, consentGiven: true, demographics });
    if (result.success) {
      if (result.mode === 'gamified') await refresh();
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,#0D0B1E,#1a1035,#0D0B1E)',
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: 3, mb: 2,
              background: 'linear-gradient(135deg,#7C3AED,#F59E0B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(168,85,247,0.4)',
            }}
          >
            <SchoolIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight={800}
            sx={{ background: 'linear-gradient(90deg,#C084FC,#F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            PyLearn Research Study
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Southampton Solent University — Module QHO634 Dissertation
          </Typography>
        </Box>

        <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        {/* ── Step 0: Participant Information Sheet ── */}
        {step === 0 && (
          <Card sx={{ p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <InfoOutlinedIcon sx={{ color: '#A855F7', fontSize: 28 }} />
              <Typography variant="h5" fontWeight={800}>Participant Information Sheet</Typography>
            </Box>

            <Chip
              label="Please read all sections carefully before proceeding"
              size="small"
              sx={{ mb: 3, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#FCD34D', fontWeight: 600 }}
            />

            {INFO_SECTIONS.map((section, i) => (
              <Accordion
                key={section.title}
                defaultExpanded={i === 0}
                sx={{ mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' } }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={700} variant="body2">{section.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {section.content}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ p: 3, borderRadius: 2, background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#C084FC', mb: 2 }}>
                Informed Consent Declaration
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  'I have read and understood the Participant Information Sheet above.',
                  'I understand that my participation is voluntary and I may withdraw at any time.',
                  'I consent to my anonymised data being collected and used for this academic research study.',
                  'I am 16 years of age or older.',
                ].map((statement, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Typography sx={{ color: '#A855F7', fontWeight: 800, minWidth: 18 }}>✓</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>{statement}</Typography>
                  </Box>
                ))}
              </Box>
              <FormControlLabel
                sx={{ mt: 2 }}
                control={
                  <Checkbox
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={700}>
                    I agree to all of the above and consent to participate in this study
                  </Typography>
                }
              />
            </Box>

            <Button
              fullWidth variant="contained" size="large"
              onClick={handleNextStep}
              sx={{ mt: 3, py: 1.5 }}
              disabled={!consentGiven}
            >
              I Consent — Continue to Demographics
            </Button>
          </Card>
        )}

        {/* ── Step 1: Demographics ── */}
        {step === 1 && (
          <Card sx={{ p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <PersonOutlineIcon sx={{ color: '#A855F7', fontSize: 28 }} />
              <Typography variant="h5" fontWeight={800}>About You</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              These questions help describe the research sample. All answers are anonymised and cannot identify you personally.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth required>
                <InputLabel>What is your age group?</InputLabel>
                <Select value={demographics.ageGroup} label="What is your age group?" onChange={handleDemoChange('ageGroup')}>
                  {AGE_GROUPS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>What is your gender?</InputLabel>
                <Select value={demographics.gender} label="What is your gender?" onChange={handleDemoChange('gender')}>
                  {GENDERS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>What is your highest level of education completed?</InputLabel>
                <Select value={demographics.educationLevel} label="What is your highest level of education completed?" onChange={handleDemoChange('educationLevel')}>
                  {EDUCATION_LEVELS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>What is your prior programming experience?</InputLabel>
                <Select value={demographics.priorProgrammingExperience} label="What is your prior programming experience?" onChange={handleDemoChange('priorProgrammingExperience')}>
                  {EXPERIENCE_LEVELS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>How often do you use online learning platforms?</InputLabel>
                <Select value={demographics.onlineLearningFrequency} label="How often do you use online learning platforms?" onChange={handleDemoChange('onlineLearningFrequency')}>
                  {LEARNING_FREQUENCY.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button variant="outlined" size="large" onClick={() => setStep(0)} sx={{ flex: 1 }}>
                Back
              </Button>
              <Button variant="contained" size="large" onClick={handleNextStep} sx={{ flex: 2, py: 1.5 }}>
                Continue to Account Setup
              </Button>
            </Box>
          </Card>
        )}

        {/* ── Step 2: Create Account ── */}
        {step === 2 && (
          <Card sx={{ p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <LockOutlinedIcon sx={{ color: '#A855F7', fontSize: 28 }} />
              <Typography variant="h5" fontWeight={800}>Create Your Account</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You will be randomly assigned to Standard or Gamified mode on registration. This ensures research validity by eliminating self-selection bias.
            </Typography>

            <Chip
              label="🔬 Random mode assignment — eliminates self-selection bias"
              size="small"
              sx={{ mb: 3, width: '100%', borderRadius: 2, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#FCD34D', fontSize: '0.75rem', fontWeight: 600 }}
            />

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleAccountChange}
                  required fullWidth
                  placeholder="e.g. Alex Johnson"
                  helperText="Your first and last name"
                />
                <TextField
                  label="Email address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleAccountChange}
                  required fullWidth
                />
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleAccountChange}
                  required fullWidth
                  helperText="Minimum 8 characters"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button variant="outlined" size="large" onClick={() => setStep(1)} sx={{ flex: 1 }} disabled={loading}>
                  Back
                </Button>
                <Button
                  type="submit" variant="contained" size="large"
                  disabled={loading}
                  sx={{ flex: 2, py: 1.5, fontSize: '1rem' }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account & Start Learning'}
                </Button>
              </Box>
            </form>
          </Card>
        )}

        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 3 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#A855F7', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
