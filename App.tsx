
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Gender, 
  PatientDetails, 
  ScreenType, 
  PrescriptionData, 
  PatientRecord,
  AllergyConflict,
  INITIAL_PATIENT
} from './types';
import PatientDetailsScreen from './screens/PatientDetailsScreen';
import VoiceInputScreen from './screens/VoiceInputScreen';
import ReviewPrescriptionScreen from './screens/ReviewPrescriptionScreen';
import FinalPrescriptionScreen from './screens/FinalPrescriptionScreen';
import { Stethoscope } from 'lucide-react';

const STORAGE_KEY = 'healthflow_v1_records';

const generateUPID = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('PATIENT_DETAILS');
  const [patient, setPatient] = useState<PatientDetails>(INITIAL_PATIENT);
  const [transcription, setTranscription] = useState('');
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null);
  const [conflicts, setConflicts] = useState<AllergyConflict[]>([]);
  const [records, setRecords] = useState<Record<string, PatientRecord>>({});

  // Load records from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load records", e);
      }
    }
    setPatient(prev => ({ ...prev, upid: generateUPID() }));
  }, []);

  const saveCurrentSession = useCallback((p: PatientDetails, pr: PrescriptionData) => {
    const sessionDate = new Date().toISOString();
    const sessionPrescription = { ...pr, date: sessionDate };
    
    setRecords(prev => {
      const existing = prev[p.upid] || { details: p, history: [] };
      
      // Prevent duplicate saves for the same session within a short window
      const isDuplicate = existing.history.some(h => h.date && (new Date(sessionDate).getTime() - new Date(h.date).getTime() < 30000));
      if (isDuplicate) return prev;

      const updatedHistory = [sessionPrescription, ...existing.history];
      const newRecords = {
        ...prev,
        [p.upid]: { details: p, history: updatedHistory }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
      return newRecords;
    });
  }, []);

  const deleteRecord = (upid: string) => {
    if (window.confirm("Permanently delete this patient's record and all prescription history?")) {
      setRecords(prev => {
        const newRecords = { ...prev };
        delete newRecords[upid];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
        return newRecords;
      });
      resetApp();
    }
  };

  // Auto-save when reaching the final screen
  useEffect(() => {
    if (currentScreen === 'FINAL_PRESCRIPTION' && prescription && !prescription.date) {
      saveCurrentSession(patient, prescription);
    }
  }, [currentScreen, prescription, patient, saveCurrentSession]);

  const checkAllergies = useCallback((currentPrescription: PrescriptionData | null, currentPatient: PatientDetails) => {
    setConflicts([]);
  }, []);

  useEffect(() => {
    checkAllergies(prescription, patient);
  }, [prescription, patient, checkAllergies]);

  const resetApp = () => {
    setPatient({ ...INITIAL_PATIENT, upid: generateUPID() });
    setTranscription('');
    setPrescription(null);
    setCurrentScreen('PATIENT_DETAILS');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'PATIENT_DETAILS':
        return <PatientDetailsScreen 
          onNext={(data) => { setPatient(data); setCurrentScreen('VOICE_INPUT'); }} 
          onViewOldPrescription={(pDetails, prData) => {
            setPatient(pDetails);
            setPrescription(prData);
            setCurrentScreen('FINAL_PRESCRIPTION');
          }}
          onDeleteRecord={deleteRecord}
          initialData={patient} 
          records={records}
        />;
      case 'VOICE_INPUT':
        return <VoiceInputScreen 
          patient={patient}
          onBack={() => setCurrentScreen('PATIENT_DETAILS')}
          onNext={(text, data) => { 
            setTranscription(text); 
            setPrescription(data); 
            setCurrentScreen('REVIEW_PRESCRIPTION'); 
          }}
          initialTranscription={transcription}
        />;
      case 'REVIEW_PRESCRIPTION':
        return prescription ? (
          <ReviewPrescriptionScreen 
            patient={patient}
            prescription={prescription}
            conflicts={conflicts}
            onUpdate={(updated) => setPrescription(updated)}
            onBack={() => setCurrentScreen('VOICE_INPUT')}
            onNext={() => setCurrentScreen('FINAL_PRESCRIPTION')}
          />
        ) : null;
      case 'FINAL_PRESCRIPTION':
        return prescription ? (
          <FinalPrescriptionScreen 
            patient={patient}
            prescription={prescription}
            onReset={resetApp}
            onBack={() => setCurrentScreen('PATIENT_DETAILS')}
          />
        ) : null;
      default:
        // Added missing required onDeleteRecord prop to ensure type safety in the default case
        return <PatientDetailsScreen 
          onNext={(data) => { setPatient(data); setCurrentScreen('VOICE_INPUT'); }} 
          onDeleteRecord={deleteRecord}
          initialData={patient} 
          records={records}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Stethoscope size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">HealthFlow AI</h1>
              <p className="text-sm text-slate-500 font-medium">
                {currentScreen === 'PATIENT_DETAILS' && "Intake & History"}
                {currentScreen === 'VOICE_INPUT' && "Voice Prescription"}
                {currentScreen === 'REVIEW_PRESCRIPTION' && "Prescription Extraction"}
                {currentScreen === 'FINAL_PRESCRIPTION' && "Prescription Finalized"}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="h-2 w-48 bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-blue-600 transition-all duration-500"
                 style={{ width: `${
                   currentScreen === 'PATIENT_DETAILS' ? 25 : 
                   currentScreen === 'VOICE_INPUT' ? 50 : 
                   currentScreen === 'REVIEW_PRESCRIPTION' ? 75 : 100
                 }%`}}
               ></div>
            </div>
            <span className="text-sm font-semibold text-blue-600">
               {currentScreen === 'PATIENT_DETAILS' ? 'Step 1 of 4' : 
                currentScreen === 'VOICE_INPUT' ? 'Step 2 of 4' : 
                currentScreen === 'REVIEW_PRESCRIPTION' ? 'Step 3 of 4' : 'Complete'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {renderScreen()}
        </div>
      </main>
      
      <footer className="py-6 border-t border-slate-200 bg-white print:hidden">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} HealthFlow AI. Professional Suite.</p>
          <div className="flex gap-4 font-medium">
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
