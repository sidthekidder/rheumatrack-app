import type { StringKey } from './en';

// Hindi translations. Type forces this object to mirror en.ts shape exactly —
// missing keys will fail tsc.
export const hi: Record<StringKey, string> = {
  // ─── Greetings ───────────────────────────────────────────────────
  good_morning: 'शुभ प्रभात',
  good_afternoon: 'नमस्ते',
  good_evening: 'शुभ संध्या',

  // ─── Bottom Nav ──────────────────────────────────────────────────
  nav_home: 'होम',
  nav_records: 'रिकॉर्ड',
  nav_add: 'जोड़ें',
  nav_wellness: 'स्वास्थ्य',
  nav_me: 'मैं',

  // ─── Home / Compliance ───────────────────────────────────────────
  all_done: 'सभी दवाइयाँ ली गईं! 🎉',
  no_meds_today: 'आज कोई दवाई नहीं',
  doses_taken: 'खुराक ली',
  of: 'में से',
  view_all_meds: 'सभी दवाइयाँ देखें',
  tap_name_id_auto: 'टैप करें — नाम और ID अपने आप भेजा जाएगा',

  // ─── Time of day ─────────────────────────────────────────────────
  morning: 'सुबह',
  afternoon: 'दोपहर',
  evening: 'शाम',
  night: 'रात',

  // ─── Common actions ──────────────────────────────────────────────
  take: 'लें',
  taken: 'ली',
  save: 'सहेजें',
  cancel: 'रद्द करें',
  edit: 'बदलें',
  remove: 'हटाएं',
  add: 'जोड़ें',
  skip: 'छोड़ें',
  continue: 'आगे बढ़ें →',
  get_started: 'शुरू करें →',
  back: 'वापस',
  done: 'हो गया',
  log_today: 'आज दर्ज करें',
  save_report: 'रिपोर्ट सहेजें',
  save_medicine: 'दवाई सहेजें',
  update_medicine: 'दवाई अपडेट करें',
  add_manually: 'खुद जोड़ें',
  scan_prescription: 'पर्ची स्कैन करें',
  read_prescription: 'पर्ची पढ़ें',
  read_report: 'रिपोर्ट पढ़ें',
  try_again: 'फिर कोशिश करें',
  add_medicine_manually: 'दवाई खुद जोड़ें',
  book_appointment: 'अपॉइंटमेंट बुक करें',
  mark_complete: 'पूरा हुआ',

  // ─── Profile / Doctor actions ─────────────────────────────────────
  edit_profile: '✏️ प्रोफाइल बदलें',
  edit_doctor: '✏️ डॉक्टर बदलें',
  add_doctor: '+ डॉक्टर जोड़ें',
  enable: 'चालू करें',
  whatsapp_doctor: 'डॉक्टर को WhatsApp',
  share_health_card: 'WhatsApp पर हेल्थ कार्ड भेजें',
  call_112: '📞 112 पर कॉल करें',

  // ─── Section headings ─────────────────────────────────────────────
  my_medicines: 'मेरी दवाइयाँ',
  my_profile: 'मेरी प्रोफाइल',
  doctor_contact: 'डॉक्टर',
  appearance: 'थीम',
  reminders: 'रिमाइंडर',
  health_card: 'हेल्थ कार्ड',
  appointments: 'अपॉइंटमेंट',
  profile: 'प्रोफाइल',

  // ─── Records tabs ─────────────────────────────────────────────────
  records_cal: 'कैलेंडर',
  records_diary: 'डायरी',
  records_labs: 'लैब',
  symptom_log: 'लक्षण लॉग',
  flare_diary: 'फ्लेयर डायरी',

  // ─── Form fields ──────────────────────────────────────────────────
  full_name: 'पूरा नाम',
  age: 'उम्र',
  patient_id: 'मरीज़ ID',
  city: 'शहर',
  state: 'राज्य',
  country: 'देश',
  doctor_name: 'डॉक्टर का नाम',
  specialty: 'विशेषज्ञता',
  whatsapp_number: 'WhatsApp नंबर',
  hospital_clinic: 'अस्पताल / क्लिनिक',
  website: 'वेबसाइट',
  notes: 'नोट्स (वैकल्पिक)',
  start_date: 'शुरुआत की तारीख',
  duration_days: 'कितने दिन',
  brand_name: 'ब्रांड का नाम',
  dose_strength: 'खुराक / मात्रा',
  schedule_type: 'शेड्यूल का प्रकार',
  food_instructions: 'खाने के साथ निर्देश',
  reminder_time: 'रिमाइंडर का समय (वैकल्पिक)',
  report_date: 'रिपोर्ट की तारीख',

  // ─── Schedule types ───────────────────────────────────────────────
  every_day: 'हर रोज़',
  specific_day: 'खास दिन',
  alternate_days: 'एक दिन छोड़कर',
  tapering: 'टेपरिंग',
  day_of_week: 'सप्ताह का दिन',
  skip_days: 'कौन से दिन न लें (वैकल्पिक)',
  dose_each_time: 'हर समय की खुराक',
  tapering_schedule: 'टेपरिंग शेड्यूल',

  // ─── Food instructions ────────────────────────────────────────────
  with_food: 'खाने के साथ',
  after_food: 'खाने के बाद',
  before_food: 'खाने से पहले / खाली पेट',
  after_breakfast: 'नाश्ते के बाद',
  after_lunch: 'दोपहर के खाने के बाद',
  after_dinner: 'रात के खाने के बाद',
  with_milk: 'दूध के साथ',
  with_water: 'पानी के साथ',
  at_bedtime: 'सोने से पहले',
  any_time: 'कभी भी',

  // ─── Empty states ─────────────────────────────────────────────────
  no_meds_yet: 'अभी कोई दवाई नहीं जोड़ी',
  scan_or_add: 'पर्ची स्कैन करें या खुद जोड़ें',
  no_diary_yet: 'अभी कोई डायरी एंट्री नहीं',
  no_labs_yet: 'अभी कोई लैब रिपोर्ट नहीं',
  no_appts: 'कोई अपॉइंटमेंट नहीं',
  saving: 'सहेजा जा रहा है...',
  adding: 'जोड़ा जा रहा है...',

  // ─── Reminders ────────────────────────────────────────────────────
  reminders_on: 'रिमाइंडर चालू है',
  reminders_off: 'रिमाइंडर बंद है',

  // ─── Onboarding ───────────────────────────────────────────────────
  onb_tagline: 'आपका रूमेटोलॉजी साथी',
  onb_made_for: 'रूमेटोलॉजी मरीज़ों के लिए',
  onb_scan_track: 'स्कैन और ट्रैक',
  onb_lab_trends: 'लैब ट्रेंड',
  onb_health_card: 'हेल्थ कार्ड',
  your_details: 'आपकी जानकारी',
  your_doctor: 'आपके डॉक्टर',
  step_1_of_2: 'चरण 1 / 2',
  step_2_of_2: 'चरण 2 / 2',
  wa_hint: 'WhatsApp टैप करने पर नाम और ID अपने आप भेजा जाएगा',

  // ─── Diary / Symptoms ─────────────────────────────────────────────
  pain_vas: 'दर्द (VAS)',
  morning_stiffness: 'सुबह की अकड़न',
  fatigue: 'थकान',
  joints_affected: 'सूजे / दर्द वाले जोड़',
  how_feeling: 'आज आप कैसा महसूस कर रहे हैं?',
  save_diary: 'डायरी एंट्री सहेजें',
  log_symptoms: 'लक्षण दर्ज करें',
  no_joints: 'कोई जोड़ नहीं चुना',
  joints_marked: 'जोड़ प्रभावित',

  // ─── Compliance ───────────────────────────────────────────────────
  monthly_compliance: 'मासिक अनुपालन',
  all_taken: 'सभी ली',
  some_missed: 'कुछ छूटी',
  none_taken: 'कोई नहीं ली',

  // ─── Labs ─────────────────────────────────────────────────────────
  abnormal_labs: 'असामान्य — डॉक्टर को दिखाएं',
  lab_tracker: 'लैब ट्रैकर',
  add_lab_results: 'लैब नतीजे जोड़ें',
  scan_lab_report: 'लैब रिपोर्ट स्कैन करें',
  enter_values: 'रिपोर्ट से नतीजे भरें',

  // ─── Emergency ────────────────────────────────────────────────────
  emergency: 'आपातकाल',
  emergency_sub: 'किसी भी मेडिकल इमरजेंसी पर 112 डायल करें',

  // ─── OTP / Auth ───────────────────────────────────────────────────
  otp_coming: 'OTP लॉगिन (जल्द आ रहा है)',
  otp_desc: 'मोबाइल OTP से लॉगिन — सभी डिवाइस पर डेटा सिंक होगा। बैकेंड बन रहा है।',

  // ─── Misc settings ────────────────────────────────────────────────
  remind_per_med: 'दवाई जोड़ते समय समय सेट करें',
  qr_scan_title: 'डॉक्टर का QR कोड स्कैन करें',
  qr_coming: 'QR स्कैन — अगले अपडेट में आएगा',

  // ─── Diet & Wellness ──────────────────────────────────────────────
  diet_wellness: 'आहार और स्वास्थ्य',
  exercise_guide: 'व्यायाम गाइड',
  eat: 'खाएं',
  avoid: 'न खाएं',
  disease: 'बीमारी',
  exercise: 'व्यायाम',
  anti_inflam: 'सूजन-रोधी सिद्धांत',
  critical_warning: 'जरूरी चेतावनी',
  condition_diet: 'बीमारी के अनुसार आहार',
  movement_medicine: 'हिलना-डुलना है दवाई',
  select_condition: 'अपनी बीमारी चुनें:',

  // ─── Medicine removal ─────────────────────────────────────────────
  tip: 'सुझाव',
  remove_medicine: 'दवाई हटाएं?',
  remove_confirm: 'यह दवाई आपके शेड्यूल से हट जाएगी।',

  // ─── App version / Search ────────────────────────────────────────
  version: 'RheumaTrack v3.3 · Immunocare, नागपुर ❤️',
  not_in_db: 'डेटाबेस में नहीं है?',
  type_med_name: 'दवाई का नाम लिखें',
  search_med: 'दवाई या ब्रांड खोजें...',
  search_test: 'टेस्ट खोजें...',

  // ─── Tapering / Phases ───────────────────────────────────────────
  phase: 'चरण',
  duration: 'अवधि',
  days: 'दिन',
  add_phase: '+ चरण जोड़ें',
  language: 'भाषा',

  // ─── Production-only keys (Phase 1 + Phase 2 + Phase 3) ──────────
  // TODO(translate): hindi review needed for all keys below

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
};
