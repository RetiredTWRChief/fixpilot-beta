import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

const LANG_KEY = 'fixpilot_language';

const RTL_LANGUAGES = ['ar'];

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'es', name: 'Español (PR)', flag: 'ES' },
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'de', name: 'Deutsch', flag: 'DE' },
  { code: 'pt', name: 'Português', flag: 'PT' },
  { code: 'zh', name: '中文', flag: 'ZH' },
  { code: 'ja', name: '日本語', flag: 'JA' },
  { code: 'ko', name: '한국어', flag: 'KO' },
  { code: 'it', name: 'Italiano', flag: 'IT' },
  { code: 'ar', name: 'العربية', flag: 'AR' },
];

const en = {
  // Brand
  appName: 'FixPilot', tagline: 'Your AI Mechanic', taglineSub: 'Diagnose · Repair · Save Money',
  // Home
  vehicleDetails: 'VEHICLE DETAILS', year: 'Year', make: 'Make', model: 'Model', engineOpt: 'Engine (opt)',
  whatsProblem: "WHAT'S THE PROBLEM?", issuePlaceholder: 'e.g. My car is overheating and I smell coolant near the front...',
  getDiagnosis: 'Get Diagnosis', recentDiagnoses: 'RECENT DIAGNOSES', upgradePro: 'Upgrade to Pro',
  freeDiagLeft: '{{count}} free diagnosis left', freeDiagLeft_plural: '{{count}} free diagnoses left',
  hi: 'Hi, {{name}}',
  // Paywall
  freeLimitReached: 'Free limit reached', upgradeMsg: 'Upgrade to FixPilot Pro for unlimited diagnoses — $9.99/mo',
  // Diagnose
  aiDiagnosis: 'AI Diagnosis', newChat: 'New', describeIssue: 'Describe the issue...',
  send: 'Send', analyzing: 'Analyzing...', describeVehicleIssue: 'Describe your vehicle issue',
  describeSymptoms: 'Tell me what symptoms you\'re experiencing and I\'ll help diagnose the problem.',
  tapFullReport: 'Tap for full diagnosis report', difficulty: 'Difficulty',
  // Garage
  myGarage: 'My Garage', addVehicle: 'ADD VEHICLE', saveVehicle: 'Save Vehicle',
  noVehiclesSaved: 'No vehicles saved', addVehiclesPrompt: 'Add your vehicles to quickly start diagnoses',
  nicknameOpt: 'Nickname (optional)',
  // History
  diagnosisHistory: 'Diagnosis History', noDiagnosesYet: 'No diagnoses yet',
  historyPrompt: 'Your diagnosis history will appear here',
  // Scanner
  obd2Scanner: 'OBD2 Scanner', scanDevices: 'Scan Devices', demoMode: 'Demo Mode',
  connectObd2: 'CONNECT TO OBD2 ADAPTER',
  bleWebMsg: 'Bluetooth is not available on web. Use Demo Mode to preview the scanner interface.',
  blePairMsg: 'Pair your ELM327 Bluetooth OBD2 adapter and scan for devices.',
  liveData: 'LIVE DATA', stop: 'Stop', dtcCodes: 'DIAGNOSTIC TROUBLE CODES',
  howItWorks: 'HOW IT WORKS',
  step1: 'Plug an ELM327 Bluetooth OBD2 adapter into your vehicle\'s OBD port',
  step2: 'Turn the ignition on (engine can be off or running)',
  step3: 'Tap "Scan Devices" to find and connect to your adapter',
  step4: 'View live engine data and read diagnostic trouble codes',
  foundDevices: 'FOUND DEVICES', engineRpm: 'Engine RPM', vehicleSpeed: 'Vehicle Speed',
  coolantTemp: 'Coolant Temp', intakeAirTemp: 'Intake Air Temp', throttlePos: 'Throttle Position',
  fuelLevel: 'Fuel Level', batteryVoltage: 'Battery Voltage',
  // Results
  diagnosisReport: 'Diagnosis Report', overview: 'Overview', diy: 'DIY', parts: 'Parts',
  videos: 'Videos', shops: 'Shops', aiAnalysis: 'AI ANALYSIS', likelyCauses: 'Likely Causes',
  inspectionSteps: 'INSPECTION STEPS', inspectionTools: 'INSPECTION TOOLS',
  diyCost: 'DIY COST', mechanicCost: 'MECHANIC COST', toolsNeeded: 'TOOLS NEEDED',
  aiRepairGuidance: 'AI REPAIR GUIDANCE', recommendedParts: 'RECOMMENDED PARTS',
  instructionVideos: 'INSTRUCTION VIDEOS', nearbyMechanics: 'NEARBY MECHANICS',
  findNearbyShops: 'Find Nearby Shops', nearbyAutoRepair: 'NEARBY AUTO REPAIR SHOPS',
  goBack: 'Go Back', diagnosisNotFound: 'Diagnosis not found',
  // Subscribe
  fixpilotPro: 'FixPilot Pro', currentPlan: 'CURRENT PLAN', free: 'Free',
  freeTier: 'Free Tier', subscribeBtnText: 'Subscribe — $9.99/mo',
  createAccountSubscribe: 'Create Account & Subscribe — $9.99/mo',
  unlimitedDiag: 'Unlimited AI diagnoses', fullHistory: 'Full vehicle history',
  recordedIssues: 'Recorded issues & resolutions', completeDiy: 'Complete DIY repair guides',
  nearbyFinder: 'Nearby mechanics finder', repairVideos: 'Repair instruction videos',
  obd2Integration: 'OBD2 scanner integration', pushNotifs: 'Push notifications',
  proMember: "You're a Pro member!", freeDiagOne: '1 free diagnosis',
  basicDiy: 'Basic DIY fix info', localMechanicsOnce: 'Local mechanics (one-time)',
  paymentVerifying: 'Verifying payment...', welcomePro: 'Welcome to FixPilot Pro! You now have unlimited access.',
  paymentCancelled: 'Payment was cancelled. You can try again anytime.',
  // Auth
  signIn: 'Sign In', email: 'EMAIL', password: 'PASSWORD', enterPassword: 'Enter password',
  createAccount: 'Create Account', name: 'NAME', yourName: 'Your name', minChars: 'Min 6 characters',
  noAccount: "Don't have an account?", createOne: 'Create one',
  haveAccount: 'Already have an account?', signInLink: 'Sign in',
  forgotPassword: 'Forgot password?', forgotPasswordTitle: 'Forgot Password',
  resetPassword: 'Reset Password', passwordReset: 'Password Reset',
  enterEmail: 'Enter your email and we\'ll send you a reset code.',
  sendResetCode: 'Send Reset Code', resetToken: 'RESET TOKEN', pasteToken: 'Paste reset token',
  newPassword: 'NEW PASSWORD', resetPasswordBtn: 'Reset Password',
  passwordResetSuccess: 'Password has been reset successfully!', backToSignIn: 'Back to Sign In', backToLogin: 'Back to login',
  // Language
  language: 'Language', selectLanguage: 'SELECT LANGUAGE',
};

const es = {
  appName: 'FixPilot', tagline: 'Tu Mecánico de AI', taglineSub: 'Diagnostica · Repara · Ahorra Chavos',
  vehicleDetails: 'DETALLES DEL VEHÍCULO', year: 'Año', make: 'Marca', model: 'Modelo', engineOpt: 'Motor (opc)',
  whatsProblem: '¿QUÉ LE PASA?', issuePlaceholder: 'ej. Mi carro se está sobrecalentando y huelo a coolant por el frente...',
  getDiagnosis: 'Diagnosticar', recentDiagnoses: 'DIAGNÓSTICOS RECIENTES', upgradePro: 'Hazte Pro',
  freeDiagLeft: '{{count}} diagnóstico gratis', freeDiagLeft_plural: '{{count}} diagnósticos gratis',
  hi: 'Hola, {{name}}',
  freeLimitReached: 'Límite gratis alcanzado', upgradeMsg: 'Hazte Pro pa\' diagnósticos sin límite — $9.99/mes',
  aiDiagnosis: 'Diagnóstico AI', newChat: 'Nuevo', describeIssue: 'Describe el problema...',
  send: 'Enviar', analyzing: 'Analizando...', describeVehicleIssue: 'Describe el problema de tu vehículo',
  describeSymptoms: 'Dime qué síntomas estás viendo y te ayudo a diagnosticar.',
  tapFullReport: 'Toca pa\' ver el reporte completo', difficulty: 'Dificultad',
  myGarage: 'Mi Garaje', addVehicle: 'AÑADIR VEHÍCULO', saveVehicle: 'Guardar Vehículo',
  noVehiclesSaved: 'No hay vehículos guardados', addVehiclesPrompt: 'Añade tus vehículos pa\' empezar diagnósticos rápido',
  nicknameOpt: 'Apodo (opcional)',
  diagnosisHistory: 'Historial de Diagnósticos', noDiagnosesYet: 'No hay diagnósticos todavía',
  historyPrompt: 'Tu historial de diagnósticos aparecerá aquí',
  obd2Scanner: 'Escáner OBD2', scanDevices: 'Buscar Dispositivos', demoMode: 'Modo Demo',
  connectObd2: 'CONECTAR ADAPTADOR OBD2',
  bleWebMsg: 'Bluetooth no está disponible en web. Usa el Modo Demo pa\' ver cómo funciona.',
  blePairMsg: 'Conecta tu adaptador ELM327 Bluetooth y busca dispositivos.',
  liveData: 'DATOS EN VIVO', stop: 'Parar', dtcCodes: 'CÓDIGOS DE DIAGNÓSTICO',
  howItWorks: 'CÓMO FUNCIONA', step1: 'Conecta un adaptador ELM327 Bluetooth al puerto OBD de tu carro',
  step2: 'Enciende el carro (puede estar prendido o apagado)', step3: 'Toca "Buscar Dispositivos" pa\' encontrar tu adaptador',
  step4: 'Ve los datos del motor en vivo y lee los códigos de diagnóstico',
  foundDevices: 'DISPOSITIVOS ENCONTRADOS', engineRpm: 'RPM del Motor', vehicleSpeed: 'Velocidad',
  coolantTemp: 'Temp Coolant', intakeAirTemp: 'Temp Aire', throttlePos: 'Posición Acelerador',
  fuelLevel: 'Nivel Gasolina', batteryVoltage: 'Voltaje Batería',
  diagnosisReport: 'Reporte de Diagnóstico', overview: 'Resumen', diy: 'Hazlo Tú', parts: 'Piezas',
  videos: 'Videos', shops: 'Talleres', aiAnalysis: 'ANÁLISIS AI', likelyCauses: 'Causas Probables',
  inspectionSteps: 'PASOS DE INSPECCIÓN', inspectionTools: 'HERRAMIENTAS DE INSPECCIÓN',
  diyCost: 'COSTO DIY', mechanicCost: 'COSTO MECÁNICO', toolsNeeded: 'HERRAMIENTAS NECESARIAS',
  aiRepairGuidance: 'GUÍA DE REPARACIÓN AI', recommendedParts: 'PIEZAS RECOMENDADAS',
  instructionVideos: 'VIDEOS DE INSTRUCCIÓN', nearbyMechanics: 'MECÁNICOS CERCANOS',
  findNearbyShops: 'Buscar Talleres Cercanos', nearbyAutoRepair: 'TALLERES CERCANOS',
  goBack: 'Volver', diagnosisNotFound: 'Diagnóstico no encontrado',
  fixpilotPro: 'FixPilot Pro', currentPlan: 'PLAN ACTUAL', free: 'Gratis',
  freeTier: 'Plan Gratis', subscribeBtnText: 'Suscribirse — $9.99/mes',
  createAccountSubscribe: 'Crear Cuenta y Suscribirse — $9.99/mes',
  unlimitedDiag: 'Diagnósticos AI sin límite', fullHistory: 'Historial completo del vehículo',
  recordedIssues: 'Problemas y soluciones guardadas', completeDiy: 'Guías completas de reparación',
  nearbyFinder: 'Buscador de mecánicos cercanos', repairVideos: 'Videos de instrucción',
  obd2Integration: 'Integración escáner OBD2', pushNotifs: 'Notificaciones push',
  proMember: '¡Eres miembro Pro!', freeDiagOne: '1 diagnóstico gratis',
  basicDiy: 'Info básica de reparación', localMechanicsOnce: 'Mecánicos locales (una vez)',
  paymentVerifying: 'Verificando pago...', welcomePro: '¡Bienvenido a FixPilot Pro! Ahora tienes acceso ilimitado.',
  paymentCancelled: 'El pago fue cancelado. Puedes intentar de nuevo cuando quieras.',
  signIn: 'Iniciar Sesión', email: 'CORREO', password: 'CONTRASEÑA', enterPassword: 'Ingresa tu contraseña',
  createAccount: 'Crear Cuenta', name: 'NOMBRE', yourName: 'Tu nombre', minChars: 'Mín 6 caracteres',
  noAccount: '¿No tienes cuenta?', createOne: 'Crea una',
  haveAccount: '¿Ya tienes cuenta?', signInLink: 'Inicia sesión',
  forgotPassword: '¿Olvidaste tu contraseña?', forgotPasswordTitle: 'Olvidé mi Contraseña',
  resetPassword: 'Restablecer Contraseña', passwordReset: 'Contraseña Restablecida',
  enterEmail: 'Ingresa tu correo y te enviamos un código para restablecer.',
  sendResetCode: 'Enviar Código', resetToken: 'TOKEN DE RESTABLECIMIENTO', pasteToken: 'Pega el token',
  newPassword: 'NUEVA CONTRASEÑA', resetPasswordBtn: 'Restablecer',
  passwordResetSuccess: '¡Contraseña restablecida exitosamente!', backToSignIn: 'Volver a Iniciar Sesión', backToLogin: 'Volver al login',
  language: 'Idioma', selectLanguage: 'SELECCIONAR IDIOMA',
};

const fr = {
  appName: 'FixPilot', tagline: 'Votre Mécanicien IA', taglineSub: 'Diagnostiquer · Réparer · Économiser',
  vehicleDetails: 'DÉTAILS DU VÉHICULE', year: 'Année', make: 'Marque', model: 'Modèle', engineOpt: 'Moteur (opt)',
  whatsProblem: 'QUEL EST LE PROBLÈME ?', issuePlaceholder: 'ex. Ma voiture surchauffe et je sens du liquide de refroidissement...',
  getDiagnosis: 'Diagnostiquer', recentDiagnoses: 'DIAGNOSTICS RÉCENTS', upgradePro: 'Passer à Pro',
  freeDiagLeft: '{{count}} diagnostic gratuit restant', freeDiagLeft_plural: '{{count}} diagnostics gratuits restants',
  hi: 'Bonjour, {{name}}',
  freeLimitReached: 'Limite gratuite atteinte', upgradeMsg: 'Passez à FixPilot Pro pour des diagnostics illimités — 9,99$/mois',
  aiDiagnosis: 'Diagnostic IA', newChat: 'Nouveau', describeIssue: 'Décrivez le problème...',
  send: 'Envoyer', analyzing: 'Analyse en cours...', describeVehicleIssue: 'Décrivez le problème de votre véhicule',
  describeSymptoms: 'Dites-moi les symptômes et je vous aiderai à diagnostiquer.',
  tapFullReport: 'Appuyez pour le rapport complet', difficulty: 'Difficulté',
  myGarage: 'Mon Garage', addVehicle: 'AJOUTER VÉHICULE', saveVehicle: 'Enregistrer',
  noVehiclesSaved: 'Aucun véhicule enregistré', addVehiclesPrompt: 'Ajoutez vos véhicules pour démarrer rapidement',
  nicknameOpt: 'Surnom (facultatif)',
  diagnosisHistory: 'Historique des Diagnostics', noDiagnosesYet: 'Aucun diagnostic',
  historyPrompt: 'Votre historique apparaîtra ici',
  obd2Scanner: 'Scanner OBD2', scanDevices: 'Rechercher', demoMode: 'Mode Démo',
  connectObd2: 'CONNECTER L\'ADAPTATEUR OBD2',
  bleWebMsg: 'Bluetooth non disponible sur le web. Utilisez le Mode Démo.',
  blePairMsg: 'Connectez votre adaptateur ELM327 Bluetooth.',
  liveData: 'DONNÉES EN DIRECT', stop: 'Arrêter', dtcCodes: 'CODES DE DIAGNOSTIC',
  howItWorks: 'COMMENT ÇA MARCHE', step1: 'Branchez un adaptateur ELM327 sur le port OBD',
  step2: 'Mettez le contact', step3: 'Appuyez sur "Rechercher" pour trouver votre adaptateur',
  step4: 'Visualisez les données moteur en direct',
  foundDevices: 'APPAREILS TROUVÉS', engineRpm: 'Régime Moteur', vehicleSpeed: 'Vitesse',
  coolantTemp: 'Temp Liquide', intakeAirTemp: 'Temp Air', throttlePos: 'Position Accélérateur',
  fuelLevel: 'Niveau Carburant', batteryVoltage: 'Tension Batterie',
  diagnosisReport: 'Rapport de Diagnostic', overview: 'Aperçu', diy: 'Bricolage', parts: 'Pièces',
  videos: 'Vidéos', shops: 'Garages', aiAnalysis: 'ANALYSE IA', likelyCauses: 'Causes Probables',
  inspectionSteps: 'ÉTAPES D\'INSPECTION', inspectionTools: 'OUTILS D\'INSPECTION',
  diyCost: 'COÛT DIY', mechanicCost: 'COÛT MÉCANICIEN', toolsNeeded: 'OUTILS NÉCESSAIRES',
  aiRepairGuidance: 'GUIDE DE RÉPARATION IA', recommendedParts: 'PIÈCES RECOMMANDÉES',
  instructionVideos: 'VIDÉOS D\'INSTRUCTION', nearbyMechanics: 'MÉCANICIENS À PROXIMITÉ',
  findNearbyShops: 'Trouver des Garages', nearbyAutoRepair: 'GARAGES À PROXIMITÉ',
  goBack: 'Retour', diagnosisNotFound: 'Diagnostic non trouvé',
  fixpilotPro: 'FixPilot Pro', currentPlan: 'PLAN ACTUEL', free: 'Gratuit',
  freeTier: 'Plan Gratuit', subscribeBtnText: "S'abonner — 9,99$/mois",
  createAccountSubscribe: "Créer un Compte & S'abonner — 9,99$/mois",
  unlimitedDiag: 'Diagnostics IA illimités', fullHistory: 'Historique complet',
  recordedIssues: 'Problèmes et résolutions', completeDiy: 'Guides de réparation complets',
  nearbyFinder: 'Recherche de mécaniciens', repairVideos: 'Vidéos d\'instruction',
  obd2Integration: 'Scanner OBD2', pushNotifs: 'Notifications push',
  proMember: 'Vous êtes membre Pro !', freeDiagOne: '1 diagnostic gratuit',
  basicDiy: 'Info réparation basique', localMechanicsOnce: 'Mécaniciens locaux (une fois)',
  paymentVerifying: 'Vérification du paiement...', welcomePro: 'Bienvenue sur FixPilot Pro ! Accès illimité.',
  paymentCancelled: 'Paiement annulé. Réessayez quand vous voulez.',
  signIn: 'Connexion', email: 'E-MAIL', password: 'MOT DE PASSE', enterPassword: 'Entrez le mot de passe',
  createAccount: 'Créer un Compte', name: 'NOM', yourName: 'Votre nom', minChars: 'Min 6 caractères',
  noAccount: "Pas de compte ?", createOne: 'Créer un',
  haveAccount: 'Déjà un compte ?', signInLink: 'Se connecter',
  forgotPassword: 'Mot de passe oublié ?', forgotPasswordTitle: 'Mot de Passe Oublié',
  resetPassword: 'Réinitialiser', passwordReset: 'Réinitialisé',
  enterEmail: 'Entrez votre e-mail pour recevoir un code de réinitialisation.',
  sendResetCode: 'Envoyer le Code', resetToken: 'CODE', pasteToken: 'Collez le code',
  newPassword: 'NOUVEAU MOT DE PASSE', resetPasswordBtn: 'Réinitialiser',
  passwordResetSuccess: 'Mot de passe réinitialisé !', backToSignIn: 'Retour à la connexion', backToLogin: 'Retour',
  language: 'Langue', selectLanguage: 'CHOISIR LA LANGUE',
};

const de = {
  appName: 'FixPilot', tagline: 'Ihr KI-Mechaniker', taglineSub: 'Diagnose · Reparatur · Geld sparen',
  vehicleDetails: 'FAHRZEUGDETAILS', year: 'Jahr', make: 'Marke', model: 'Modell', engineOpt: 'Motor (opt)',
  whatsProblem: 'WAS IST DAS PROBLEM?', issuePlaceholder: 'z.B. Mein Auto überhitzt und ich rieche Kühlmittel vorne...',
  getDiagnosis: 'Diagnose starten', recentDiagnoses: 'LETZTE DIAGNOSEN', upgradePro: 'Auf Pro upgraden',
  freeDiagLeft: '{{count}} kostenlose Diagnose übrig', hi: 'Hallo, {{name}}',
  freeLimitReached: 'Kostenloses Limit erreicht', upgradeMsg: 'Upgraden Sie auf FixPilot Pro — 9,99$/Monat',
  aiDiagnosis: 'KI-Diagnose', newChat: 'Neu', describeIssue: 'Problem beschreiben...',
  send: 'Senden', analyzing: 'Analysiere...', describeVehicleIssue: 'Beschreiben Sie das Fahrzeugproblem',
  describeSymptoms: 'Beschreiben Sie die Symptome und ich helfe bei der Diagnose.',
  tapFullReport: 'Tippen für vollständigen Bericht', difficulty: 'Schwierigkeit',
  myGarage: 'Meine Garage', addVehicle: 'FAHRZEUG HINZUFÜGEN', saveVehicle: 'Speichern',
  noVehiclesSaved: 'Keine Fahrzeuge gespeichert', addVehiclesPrompt: 'Fügen Sie Fahrzeuge hinzu',
  nicknameOpt: 'Spitzname (optional)',
  diagnosisHistory: 'Diagnose-Verlauf', noDiagnosesYet: 'Noch keine Diagnosen',
  historyPrompt: 'Ihr Verlauf erscheint hier',
  obd2Scanner: 'OBD2 Scanner', scanDevices: 'Geräte suchen', demoMode: 'Demo-Modus',
  connectObd2: 'OBD2-ADAPTER VERBINDEN', liveData: 'LIVE-DATEN', stop: 'Stopp',
  dtcCodes: 'FEHLERCODES', howItWorks: 'SO FUNKTIONIERT ES',
  diagnosisReport: 'Diagnosebericht', overview: 'Übersicht', diy: 'Selbst machen', parts: 'Teile',
  videos: 'Videos', shops: 'Werkstätten', aiAnalysis: 'KI-ANALYSE', likelyCauses: 'Wahrscheinliche Ursachen',
  inspectionSteps: 'PRÜFSCHRITTE', inspectionTools: 'PRÜFWERKZEUGE',
  diyCost: 'DIY-KOSTEN', mechanicCost: 'WERKSTATTKOSTEN', toolsNeeded: 'BENÖTIGTE WERKZEUGE',
  findNearbyShops: 'Werkstätten finden', goBack: 'Zurück', diagnosisNotFound: 'Diagnose nicht gefunden',
  fixpilotPro: 'FixPilot Pro', currentPlan: 'AKTUELLER PLAN', free: 'Kostenlos', freeTier: 'Kostenlos',
  subscribeBtnText: 'Abonnieren — 9,99$/Monat', createAccountSubscribe: 'Konto erstellen & Abonnieren — 9,99$/Monat',
  unlimitedDiag: 'Unbegrenzte KI-Diagnosen', proMember: 'Sie sind Pro-Mitglied!',
  signIn: 'Anmelden', email: 'E-MAIL', password: 'PASSWORT', createAccount: 'Konto erstellen',
  name: 'NAME', forgotPassword: 'Passwort vergessen?',
  language: 'Sprache', selectLanguage: 'SPRACHE WÄHLEN',
};

const pt = {
  appName: 'FixPilot', tagline: 'Seu Mecânico IA', taglineSub: 'Diagnosticar · Reparar · Economizar',
  vehicleDetails: 'DETALHES DO VEÍCULO', year: 'Ano', make: 'Marca', model: 'Modelo', engineOpt: 'Motor (opc)',
  whatsProblem: 'QUAL É O PROBLEMA?', issuePlaceholder: 'ex. Meu carro está superaquecendo e sinto cheiro de líquido de arrefecimento...',
  getDiagnosis: 'Diagnosticar', recentDiagnoses: 'DIAGNÓSTICOS RECENTES', upgradePro: 'Assinar Pro',
  freeDiagLeft: '{{count}} diagnóstico grátis restante', hi: 'Olá, {{name}}',
  freeLimitReached: 'Limite gratuito atingido', upgradeMsg: 'Assine o FixPilot Pro — R$49,90/mês',
  aiDiagnosis: 'Diagnóstico IA', newChat: 'Novo', describeIssue: 'Descreva o problema...',
  send: 'Enviar', analyzing: 'Analisando...', describeVehicleIssue: 'Descreva o problema do veículo',
  describeSymptoms: 'Me conte os sintomas e eu ajudo a diagnosticar.',
  myGarage: 'Minha Garagem', addVehicle: 'ADICIONAR VEÍCULO', saveVehicle: 'Salvar',
  diagnosisHistory: 'Histórico de Diagnósticos', noDiagnosesYet: 'Nenhum diagnóstico ainda',
  obd2Scanner: 'Scanner OBD2', scanDevices: 'Buscar Dispositivos', demoMode: 'Modo Demo',
  liveData: 'DADOS AO VIVO', stop: 'Parar', dtcCodes: 'CÓDIGOS DE FALHA',
  diagnosisReport: 'Relatório de Diagnóstico', overview: 'Resumo', diy: 'Faça Você', parts: 'Peças',
  videos: 'Vídeos', shops: 'Oficinas', findNearbyShops: 'Encontrar Oficinas',
  goBack: 'Voltar', fixpilotPro: 'FixPilot Pro', free: 'Grátis', freeTier: 'Plano Grátis',
  subscribeBtnText: 'Assinar — R$49,90/mês', unlimitedDiag: 'Diagnósticos IA ilimitados',
  proMember: 'Você é membro Pro!',
  signIn: 'Entrar', email: 'E-MAIL', password: 'SENHA', createAccount: 'Criar Conta',
  name: 'NOME', forgotPassword: 'Esqueceu a senha?',
  language: 'Idioma', selectLanguage: 'SELECIONAR IDIOMA',
};

const zh = {
  appName: 'FixPilot', tagline: '您的AI机械师', taglineSub: '诊断 · 维修 · 省钱',
  vehicleDetails: '车辆信息', year: '年份', make: '品牌', model: '型号', engineOpt: '发动机(选填)',
  whatsProblem: '车辆有什么问题？', issuePlaceholder: '例如：我的车在过热，前方闻到冷却液的味道...',
  getDiagnosis: '开始诊断', recentDiagnoses: '最近诊断', upgradePro: '升级到Pro',
  freeDiagLeft: '剩余{{count}}次免费诊断', hi: '你好，{{name}}',
  freeLimitReached: '免费次数已用完', upgradeMsg: '升级到FixPilot Pro享受无限诊断 — $9.99/月',
  aiDiagnosis: 'AI诊断', newChat: '新对话', describeIssue: '描述问题...',
  send: '发送', analyzing: '分析中...', describeVehicleIssue: '描述您的车辆问题',
  myGarage: '我的车库', addVehicle: '添加车辆', saveVehicle: '保存',
  diagnosisHistory: '诊断历史', noDiagnosesYet: '暂无诊断记录',
  obd2Scanner: 'OBD2扫描仪', scanDevices: '搜索设备', demoMode: '演示模式',
  liveData: '实时数据', stop: '停止', dtcCodes: '故障码',
  diagnosisReport: '诊断报告', overview: '概览', diy: '自己修', parts: '零件',
  videos: '视频', shops: '修理厂', findNearbyShops: '查找附近修理厂',
  goBack: '返回', fixpilotPro: 'FixPilot Pro', free: '免费', freeTier: '免费版',
  subscribeBtnText: '订阅 — $9.99/月', unlimitedDiag: '无限AI诊断', proMember: '您是Pro会员！',
  signIn: '登录', email: '邮箱', password: '密码', createAccount: '注册',
  name: '姓名', forgotPassword: '忘记密码？',
  language: '语言', selectLanguage: '选择语言',
};

const ja = {
  appName: 'FixPilot', tagline: 'AIメカニック', taglineSub: '診断 · 修理 · 節約',
  vehicleDetails: '車両情報', year: '年式', make: 'メーカー', model: '車種', engineOpt: 'エンジン（任意）',
  whatsProblem: '何が問題ですか？', issuePlaceholder: '例：車がオーバーヒートして冷却水の匂いがします...',
  getDiagnosis: '診断開始', recentDiagnoses: '最近の診断', upgradePro: 'Proにアップグレード',
  freeDiagLeft: '無料診断残り{{count}}回', hi: 'こんにちは、{{name}}さん',
  freeLimitReached: '無料回数の上限に達しました', upgradeMsg: 'FixPilot Proで無制限診断 — $9.99/月',
  aiDiagnosis: 'AI診断', newChat: '新規', describeIssue: '問題を説明...',
  send: '送信', analyzing: '分析中...', describeVehicleIssue: '車両の問題を説明してください',
  myGarage: 'マイガレージ', addVehicle: '車両追加', saveVehicle: '保存',
  diagnosisHistory: '診断履歴', noDiagnosesYet: 'まだ診断がありません',
  obd2Scanner: 'OBD2スキャナー', scanDevices: 'デバイス検索', demoMode: 'デモモード',
  liveData: 'ライブデータ', stop: '停止', dtcCodes: '故障コード',
  diagnosisReport: '診断レポート', overview: '概要', diy: 'DIY', parts: '部品',
  videos: '動画', shops: '整備工場', findNearbyShops: '近くの整備工場を探す',
  goBack: '戻る', fixpilotPro: 'FixPilot Pro', free: '無料', freeTier: '無料プラン',
  subscribeBtnText: '登録 — $9.99/月', unlimitedDiag: '無制限AI診断', proMember: 'Proメンバーです！',
  signIn: 'ログイン', email: 'メール', password: 'パスワード', createAccount: 'アカウント作成',
  name: '名前', forgotPassword: 'パスワードをお忘れですか？',
  language: '言語', selectLanguage: '言語を選択',
};

const ko = {
  appName: 'FixPilot', tagline: 'AI 정비사', taglineSub: '진단 · 수리 · 절약',
  vehicleDetails: '차량 정보', year: '연식', make: '제조사', model: '모델', engineOpt: '엔진 (선택)',
  whatsProblem: '무엇이 문제인가요?', issuePlaceholder: '예: 차가 과열되고 냉각수 냄새가 납니다...',
  getDiagnosis: '진단 시작', recentDiagnoses: '최근 진단', upgradePro: 'Pro 업그레이드',
  freeDiagLeft: '무료 진단 {{count}}회 남음', hi: '안녕하세요, {{name}}님',
  aiDiagnosis: 'AI 진단', newChat: '새로', describeIssue: '문제를 설명하세요...',
  send: '보내기', analyzing: '분석 중...', myGarage: '내 차고', diagnosisHistory: '진단 기록',
  obd2Scanner: 'OBD2 스캐너', scanDevices: '장치 검색', demoMode: '데모 모드',
  liveData: '실시간 데이터', stop: '중지', diagnosisReport: '진단 보고서',
  overview: '개요', diy: 'DIY', parts: '부품', videos: '동영상', shops: '정비소',
  findNearbyShops: '가까운 정비소 찾기', goBack: '뒤로',
  fixpilotPro: 'FixPilot Pro', free: '무료', subscribeBtnText: '구독 — $9.99/월',
  unlimitedDiag: '무제한 AI 진단', proMember: 'Pro 회원입니다!',
  signIn: '로그인', email: '이메일', password: '비밀번호', createAccount: '계정 만들기',
  name: '이름', forgotPassword: '비밀번호를 잊으셨나요?',
  language: '언어', selectLanguage: '언어 선택',
};

const it = {
  appName: 'FixPilot', tagline: 'Il Tuo Meccanico IA', taglineSub: 'Diagnostica · Ripara · Risparmia',
  vehicleDetails: 'DETTAGLI VEICOLO', year: 'Anno', make: 'Marca', model: 'Modello', engineOpt: 'Motore (opz)',
  whatsProblem: 'QUAL È IL PROBLEMA?', issuePlaceholder: 'es. La mia auto si surriscalda e sento odore di liquido refrigerante...',
  getDiagnosis: 'Avvia Diagnosi', recentDiagnoses: 'DIAGNOSI RECENTI', upgradePro: 'Passa a Pro',
  freeDiagLeft: '{{count}} diagnosi gratuita rimasta', hi: 'Ciao, {{name}}',
  aiDiagnosis: 'Diagnosi IA', newChat: 'Nuovo', describeIssue: 'Descrivi il problema...',
  send: 'Invia', analyzing: 'Analisi...', myGarage: 'Il Mio Garage', diagnosisHistory: 'Storico Diagnosi',
  obd2Scanner: 'Scanner OBD2', scanDevices: 'Cerca Dispositivi', demoMode: 'Modalità Demo',
  liveData: 'DATI IN TEMPO REALE', stop: 'Ferma', diagnosisReport: 'Rapporto Diagnosi',
  overview: 'Panoramica', diy: 'Fai da Te', parts: 'Ricambi', videos: 'Video', shops: 'Officine',
  findNearbyShops: 'Trova Officine', goBack: 'Indietro',
  fixpilotPro: 'FixPilot Pro', free: 'Gratuito', subscribeBtnText: 'Abbonati — 9,99$/mese',
  unlimitedDiag: 'Diagnosi IA illimitate', proMember: 'Sei un membro Pro!',
  signIn: 'Accedi', email: 'E-MAIL', password: 'PASSWORD', createAccount: 'Crea Account',
  name: 'NOME', forgotPassword: 'Password dimenticata?',
  language: 'Lingua', selectLanguage: 'SELEZIONA LINGUA',
};

const ar = {
  appName: 'FixPilot', tagline: 'ميكانيكي الذكاء الاصطناعي', taglineSub: 'تشخيص · إصلاح · توفير',
  vehicleDetails: 'تفاصيل المركبة', year: 'السنة', make: 'الشركة', model: 'الموديل', engineOpt: 'المحرك (اختياري)',
  whatsProblem: 'ما المشكلة؟', issuePlaceholder: 'مثال: سيارتي تسخن وأشم رائحة سائل التبريد...',
  getDiagnosis: 'ابدأ التشخيص', recentDiagnoses: 'التشخيصات الأخيرة', upgradePro: 'ترقية إلى Pro',
  freeDiagLeft: '{{count}} تشخيص مجاني متبقي', hi: 'مرحباً، {{name}}',
  aiDiagnosis: 'تشخيص الذكاء الاصطناعي', newChat: 'جديد', describeIssue: 'صف المشكلة...',
  send: 'إرسال', analyzing: 'جاري التحليل...', myGarage: 'مرآبي', diagnosisHistory: 'سجل التشخيص',
  obd2Scanner: 'ماسح OBD2', scanDevices: 'بحث عن الأجهزة', demoMode: 'وضع تجريبي',
  liveData: 'بيانات مباشرة', stop: 'إيقاف', diagnosisReport: 'تقرير التشخيص',
  overview: 'نظرة عامة', diy: 'افعلها بنفسك', parts: 'قطع غيار', videos: 'فيديوهات', shops: 'ورش',
  findNearbyShops: 'البحث عن ورش قريبة', goBack: 'رجوع',
  fixpilotPro: 'FixPilot Pro', free: 'مجاني', subscribeBtnText: 'اشترك — $9.99/شهر',
  unlimitedDiag: 'تشخيصات غير محدودة', proMember: 'أنت عضو Pro!',
  signIn: 'تسجيل الدخول', email: 'البريد الإلكتروني', password: 'كلمة المرور', createAccount: 'إنشاء حساب',
  name: 'الاسم', forgotPassword: 'نسيت كلمة المرور؟',
  language: 'اللغة', selectLanguage: 'اختر اللغة',
};

const resources = {
  en: { translation: en }, es: { translation: es }, fr: { translation: fr },
  de: { translation: de }, pt: { translation: pt }, zh: { translation: zh },
  ja: { translation: ja }, ko: { translation: ko }, it: { translation: it },
  ar: { translation: ar },
};

export async function initI18n() {
  const stored = await AsyncStorage.getItem(LANG_KEY).catch(() => null);
  const deviceLang = getLocales()?.[0]?.languageCode || 'en';
  const lang = stored || (Object.keys(resources).includes(deviceLang) ? deviceLang : 'en');

  await i18n.use(initReactI18next).init({
    resources, lng: lang, fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });
  const isRTL = RTL_LANGUAGES.includes(lang);
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
  return lang;
}

export async function changeLanguage(code: string) {
  await i18n.changeLanguage(code);
  await AsyncStorage.setItem(LANG_KEY, code);
  const isRTL = RTL_LANGUAGES.includes(code);
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }
}

export default i18n;
