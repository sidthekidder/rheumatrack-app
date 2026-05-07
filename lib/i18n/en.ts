// English translations. All values must match the keys in hi.ts (typescript enforces this).
// Keys lifted verbatim from RheumaTrack_v3.3-1.jsx STRINGS.en, plus production-only keys
// added below the v3.3 block (BottomTabBar labels, AppointmentCard, AddAppointmentForm,
// DoctorSection, splash, etc).

export const en = {
  // ─── Greetings ───────────────────────────────────────────────────
  good_morning: 'Good Morning',
  good_afternoon: 'Good Afternoon',
  good_evening: 'Good Evening',

  // ─── Bottom Nav ──────────────────────────────────────────────────
  nav_home: 'Home',
  nav_records: 'Records',
  nav_add: 'Add',
  nav_wellness: 'Wellness',
  nav_me: 'Me',

  // ─── Home / Compliance ───────────────────────────────────────────
  all_done: 'All medicines taken! 🎉',
  no_meds_today: 'No medicines scheduled today',
  doses_taken: 'doses taken',
  of: 'of',
  view_all_meds: 'View All Medicines',
  tap_name_id_auto: 'Tap — name and ID sent automatically',

  // ─── Time of day ─────────────────────────────────────────────────
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',

  // ─── Common actions ──────────────────────────────────────────────
  take: 'Take',
  taken: 'Taken',
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  remove: 'Remove',
  add: 'Add',
  skip: 'Skip',
  continue: 'Continue →',
  get_started: 'Get Started →',
  back: 'Back',
  done: 'Done',
  log_today: 'Log Today',
  save_report: 'Save Lab Report',
  save_medicine: 'Save Medicine',
  update_medicine: 'Update Medicine',
  add_manually: 'Add Manually',
  scan_prescription: 'Scan Prescription',
  read_prescription: 'Read Prescription',
  read_report: 'Read Lab Report',
  try_again: 'Try Again',
  add_medicine_manually: 'Add Medicine Manually',
  book_appointment: 'Book Appointment',
  mark_complete: 'Mark Completed',

  // ─── Profile / Doctor actions ─────────────────────────────────────
  edit_profile: '✏️ Edit Profile',
  edit_doctor: '✏️ Edit Doctor',
  add_doctor: '+ Add Doctor',
  enable: 'Enable',
  whatsapp_doctor: 'WhatsApp Doctor',
  share_health_card: 'Share Health Card via WhatsApp',
  call_112: '📞 Call 112',

  // ─── Section headings ─────────────────────────────────────────────
  my_medicines: 'My Medicines',
  my_profile: 'My Profile',
  doctor_contact: 'Doctor Contact',
  appearance: 'Appearance',
  reminders: 'Reminders',
  health_card: 'Health Card',
  appointments: 'Appointments',
  profile: 'Profile',

  // ─── Records tabs ─────────────────────────────────────────────────
  records_cal: 'Calendar',
  records_diary: 'Diary',
  records_labs: 'Labs',
  symptom_log: 'Symptom Log',
  flare_diary: 'Flare Diary',

  // ─── Form fields ──────────────────────────────────────────────────
  full_name: 'Full Name',
  age: 'Age',
  patient_id: 'Patient ID',
  city: 'City',
  state: 'State',
  country: 'Country',
  doctor_name: "Doctor's Name",
  specialty: 'Specialty',
  whatsapp_number: 'WhatsApp Number',
  hospital_clinic: 'Hospital / Clinic',
  website: 'Website',
  notes: 'Notes (optional)',
  start_date: 'Start Date',
  duration_days: 'Duration (days)',
  brand_name: 'Brand Name',
  dose_strength: 'Dose / Strength',
  schedule_type: 'Schedule Type',
  food_instructions: 'Food Instructions',
  reminder_time: 'Reminder Time (optional)',
  report_date: 'Report Date',

  // ─── Schedule types ───────────────────────────────────────────────
  every_day: 'Every Day',
  specific_day: 'Specific Day',
  alternate_days: 'Alternate Days',
  tapering: 'Tapering',
  day_of_week: 'Day of Week',
  skip_days: 'Skip days (optional)',
  dose_each_time: 'Dose at Each Time',
  tapering_schedule: 'Tapering Schedule',

  // ─── Food instructions ────────────────────────────────────────────
  with_food: 'With Food',
  after_food: 'After Food',
  before_food: 'Before Food / Empty Stomach',
  after_breakfast: 'After Breakfast',
  after_lunch: 'After Lunch',
  after_dinner: 'After Dinner',
  with_milk: 'With Milk',
  with_water: 'With Water',
  at_bedtime: 'At Bedtime',
  any_time: 'Any Time',

  // ─── Empty states ─────────────────────────────────────────────────
  no_meds_yet: 'No medicines added yet',
  scan_or_add: 'Scan your prescription or add manually',
  no_diary_yet: 'No diary entries yet',
  no_labs_yet: 'No lab reports yet',
  no_appts: 'No appointments',
  saving: 'Saving...',
  adding: 'Adding...',

  // ─── Reminders ────────────────────────────────────────────────────
  reminders_on: 'Reminders enabled',
  reminders_off: 'Reminders off',

  // ─── Onboarding ───────────────────────────────────────────────────
  onb_tagline: 'Your Rheumatology Companion',
  onb_made_for: 'Made for Rheumatology patients',
  onb_scan_track: 'Scan & Track',
  onb_lab_trends: 'Lab Trends',
  onb_health_card: 'Health Card',
  your_details: 'Your Details',
  your_doctor: 'Your Doctor',
  step_1_of_2: 'Step 1 of 2',
  step_2_of_2: 'Step 2 of 2',
  wa_hint: 'Tapping WhatsApp will send your name and ID automatically',

  // ─── Diary / Symptoms ─────────────────────────────────────────────
  pain_vas: 'Pain (VAS)',
  morning_stiffness: 'Morning Stiffness',
  fatigue: 'Fatigue',
  joints_affected: 'Swollen / Painful Joints',
  how_feeling: 'How are you feeling today?',
  save_diary: 'Save Diary Entry',
  log_symptoms: 'Log Symptoms',
  no_joints: 'No joints marked',
  joints_marked: 'marked',

  // ─── Compliance ───────────────────────────────────────────────────
  monthly_compliance: 'Monthly Compliance',
  all_taken: 'All taken',
  some_missed: 'Some missed',
  none_taken: 'None taken',

  // ─── Labs ─────────────────────────────────────────────────────────
  abnormal_labs: 'Abnormal — Share with your doctor',
  lab_tracker: 'Lab Tracker',
  add_lab_results: 'Add Lab Results',
  scan_lab_report: 'Scan Lab Report',
  enter_values: 'Enter values from your report',

  // ─── Emergency ────────────────────────────────────────────────────
  emergency: 'Emergency',
  emergency_sub: 'For medical emergencies call 112',

  // ─── OTP / Auth ───────────────────────────────────────────────────
  otp_coming: 'OTP Login (Coming Soon)',
  otp_desc: 'Mobile OTP login with cross-device sync. Requires backend — in progress.',

  // ─── Misc settings ────────────────────────────────────────────────
  remind_per_med: 'Set time per medicine in Add Medicine',
  qr_scan_title: 'Scan Doctor QR Code',
  qr_coming: 'QR Scan — coming in next update',

  // ─── Diet & Wellness ──────────────────────────────────────────────
  diet_wellness: 'Diet & Wellness',
  exercise_guide: 'Exercise Guide',
  eat: 'Eat',
  avoid: 'Avoid',
  disease: 'Disease',
  exercise: 'Exercise',
  anti_inflam: 'Anti-Inflammatory Principles',
  critical_warning: 'Critical Warning',
  condition_diet: 'Condition-Specific Diet',
  movement_medicine: 'Movement is Medicine',
  select_condition: 'Select condition:',

  // ─── Medicine removal ─────────────────────────────────────────────
  tip: 'Tip',
  remove_medicine: 'Remove Medicine?',
  remove_confirm: 'This medicine will be removed from your schedule.',

  // ─── App version / Search ────────────────────────────────────────
  version: 'RheumaTrack v3.3 · Immunocare, Nagpur ❤️',
  not_in_db: 'Not in database?',
  type_med_name: 'Type medicine name',
  search_med: 'Search medicine or brand...',
  search_test: 'Search test...',

  // ─── Tapering / Phases ───────────────────────────────────────────
  phase: 'Phase',
  duration: 'Duration',
  days: 'days',
  add_phase: '+ Add Phase',
  language: 'Language',

  // ─── Production-only keys (Phase 1 + Phase 2 + Phase 3) ──────────

  // Phase 1 Edit Medicine
  edit_medicine: 'Edit Medicine',
  medicine_not_found: 'Medicine not found',
  medicine_deleted_other_tab: 'This medicine may have been deleted in another tab.',

  // Phase 2 Appointments
  new_appointment: 'New Appointment',
  edit_appointment: 'Edit Appointment',
  save_appointment: 'Save Appointment',
  update_appointment: 'Update Appointment',
  visit_type: 'Visit type',
  visit_routine: 'Routine Follow-up',
  visit_new_symptom: 'New Symptom',
  visit_lab_review: 'Lab Review',
  visit_other: 'Other',
  pre_visit_notes: 'Pre-visit notes',
  post_visit_notes: 'Post-visit notes',
  pre_visit_placeholder: 'Questions to ask, symptoms to mention',
  post_visit_placeholder: 'What the doctor said',
  what_doctor_said: 'What did the doctor say?',
  appointment_not_found: 'Appointment not found',
  appointment_deleted: 'This appointment may have been deleted.',
  upcoming: 'Upcoming',
  past: 'Past',
  no_upcoming: 'No upcoming appointments. Tap + to schedule one.',
  no_past: 'No past appointments yet.',
  delete_appt_confirm: 'Delete appointment?',
  delete_cannot_undo: 'This cannot be undone.',
  delete: 'Delete',
  complete: 'Complete',
  call: 'Call',

  // Phase 2 DoctorSection
  website_url: 'Website URL',
  instagram_url: 'Instagram URL',
  youtube_url: 'YouTube URL',
  instagram: 'Instagram',
  youtube: 'YouTube',

  // Phase 2 QRPlaceholder
  qr_explain: 'Generate a QR code patients can scan to instantly add your contact info to RheumaTrack.',
  qr_format_label: 'Format:',
  qr_generate_btn: 'Generate at qr-code-generator.com',

  // Phase 2 HealthCard
  todays_compliance: "Today's Compliance",
  current_medicines: 'Current Medicines',
  abnormal_labs_30: 'Abnormal Labs (last 30 days)',
  generated_via: 'Generated {date} · RheumaTrack',
  loading: 'Loading…',
  complete_onboarding: 'Complete onboarding to view your Health Card.',
  share: 'Share',

  // Phase 3 splash
  splash_tagline: 'Your rheumatology companion',
  splash_track_meds: '💊 Track meds',
  splash_log_symptoms: '📊 Log symptoms',
  splash_scan_labs: '🧪 Scan labs',

  // Phase 3 Diary rewrite
  diary_trend_30: 'Trend (last 30 days)',
  diary_today: "Today's entry",
  diary_no_history: 'Log a diary entry to see your trend.',
  update_entry: 'Update Entry',
  save_entry: 'Save Entry',

  // Phase 3 Labs rewrite
  no_history_for_test: 'No history for this test yet.',
  share_abnormal: 'Share abnormal labs with doctor',

  // Phase 3 HealthCard WhatsApp
  hello_doctor: 'Hello {name},',
} as const;

export type StringKey = keyof typeof en;
