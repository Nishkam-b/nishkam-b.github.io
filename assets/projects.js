// Vibe coded projects — tools built with AI.
// To add a new one: copy a block below, paste it at the BOTTOM of the list,
// and drop its screenshot in assets/projects/.
//   name        short name on the card
//   icon        one of: pdf, photo, idcard, resume, spark (the little app icon)
//   color       app icon colour
//   categories  any of: Productivity, Education, Design, Careers, Creators, Utilities
//   chips       2-3 short tags shown on the card
//   featured    true = shown on the laptop + "Featured" badge (only one)
window.PROJECTS = [
  {
    title: 'Nishtek PDF',
    name: 'Nishtek PDF',
    url: 'https://nishtek.in/pdf-editor/',
    image: 'assets/projects/nishtek-pdf.png',
    icon: 'pdf',
    color: '#f97316',
    categories: ['Productivity', 'Utilities'],
    description: 'A free PDF editor that runs in your browser. Edit, sign, highlight, merge and convert your files.',
    chips: ['PDF Editor', 'Merge', 'No Upload'],
    featured: true,
    date: 'Nov 2026'
  },
  {
    title: 'Passport Photo Maker',
    name: 'Passport Photo Maker',
    url: 'https://nishtek.in/passport-photo-generator/',
    image: 'assets/projects/passport-photo-maker.png',
    icon: 'photo',
    color: '#8b5cf6',
    categories: ['Design', 'Utilities'],
    description: 'Create passport photos at home. AI swaps the background, sizes your face to official rules and gives you a print-ready sheet.',
    chips: ['Passport Photo', 'AI Background', 'No Signup'],
    date: 'Nov 2026'
  },
  {
    title: 'School ID Card Generator',
    name: 'School ID Card Generator',
    url: 'https://nishtek.in/id-card-generator/',
    image: 'assets/projects/id-card-generator.webp',
    icon: 'idcard',
    color: '#7c3aed',
    categories: ['Education', 'Design'],
    description: 'Create bulk school ID cards from an Excel sheet. Auto-match photos, pick a template and export print-ready sheets.',
    chips: ['ID Cards', 'Bulk Create', 'Templates'],
    date: 'Nov 2026'
  },
  {
    title: 'HireReady – AI Resume Builder',
    name: 'ATS Resume Builder',
    url: 'https://nishtek.in/hireready/',
    image: 'assets/projects/hireready.png',
    icon: 'resume',
    color: '#16a34a',
    categories: ['Careers', 'Productivity'],
    description: 'Build an ATS-friendly resume with AI. Match it to any job, write cover letters and download PDF/DOCX free.',
    chips: ['ATS Friendly', 'Job Match', 'AI Assist'],
    date: 'Nov 2026'
  }
];
