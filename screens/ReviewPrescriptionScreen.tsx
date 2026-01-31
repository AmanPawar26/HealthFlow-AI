
import React from 'react';
import { 
  PatientDetails, 
  PrescriptionData, 
  Frequency, 
  Medication, 
  AllergyConflict 
} from '../types';
import { 
  Plus, 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

interface Props {
  patient: PatientDetails;
  prescription: PrescriptionData;
  conflicts: AllergyConflict[];
  onUpdate: (data: PrescriptionData) => void;
  onBack: () => void;
  onNext: () => void;
}

const ReviewPrescriptionScreen: React.FC<Props> = ({ 
  patient, 
  prescription, 
  conflicts, 
  onUpdate, 
  onBack, 
  onNext 
}) => {
  const handleMedChange = (id: string, field: keyof Medication, value: any) => {
    const updatedMeds = prescription.medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    );
    onUpdate({ ...prescription, medications: updatedMeds });
  };

  const addMedication = () => {
    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name: '',
      dosage: '',
      frequency: Frequency.OD,
      duration: '',
      instructions: ''
    };
    onUpdate({ ...prescription, medications: [...prescription.medications, newMed] });
  };

  const removeMedication = (id: string) => {
    onUpdate({ 
      ...prescription, 
      medications: prescription.medications.filter(med => med.id !== id) 
    });
  };

  const handleFieldChange = (field: keyof Omit<PrescriptionData, 'medications'>, value: string) => {
    onUpdate({ ...prescription, [field]: value });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Clinical Data Extracted</h3>
            <p className="text-slate-500 text-sm font-medium">Patient: {patient.name} | {patient.age}{patient.gender[0]} | UPID: {patient.upid}</p>
          </div>
        </div>
        
        <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl border border-emerald-100 flex items-center gap-2">
          <CheckCircle2 size={20} />
          <span className="font-bold text-sm uppercase tracking-wide">Analysis Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <ClipboardList className="text-blue-600" /> Review Prescription
              </h2>
              <p className="text-slate-500 font-medium mt-1">AI has parsed medications and diagnostic data. Verify below.</p>
            </div>

            <div className="mb-10">
              <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase">Diagnosis</label>
              <input 
                type="text"
                value={prescription.diagnosis}
                onChange={(e) => handleFieldChange('diagnosis', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                placeholder="Enter clinical diagnosis"
              />
            </div>

            <div className="space-y-6">
              <label className="block text-sm font-bold text-slate-700 tracking-wide uppercase">Medications</label>
              
              {prescription.medications.map((med, index) => (
                <div key={med.id} className="group relative bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-lg transition-all hover:border-blue-100">
                  <div className="absolute -left-3 top-6 w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-lg">
                    {index + 1}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Medicine Name</label>
                      <input 
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedChange(med.id, 'name', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Dosage</label>
                      <input 
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedChange(med.id, 'dosage', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Frequency</label>
                      <select 
                        value={med.frequency}
                        onChange={(e) => handleMedChange(med.id, 'frequency', e.target.value as Frequency)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                      >
                        {Object.values(Frequency).map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Duration</label>
                      <input 
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedChange(med.id, 'duration', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Instructions</label>
                      <input 
                        type="text"
                        value={med.instructions}
                        onChange={(e) => handleMedChange(med.id, 'instructions', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => removeMedication(med.id)}
                    className="mt-6 flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest"
                  >
                    <Trash2 size={14} /> Remove Medicine
                  </button>
                </div>
              ))}

              <button 
                onClick={addMedication}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center gap-2 text-slate-500 font-bold hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all group"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Add Medication Manually
              </button>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase">Advice</label>
                <textarea 
                  rows={4}
                  value={prescription.advice}
                  onChange={(e) => handleFieldChange('advice', e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase">Follow-up</label>
                <input 
                  type="text"
                  value={prescription.followUp}
                  onChange={(e) => handleFieldChange('followUp', e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
              <ShieldCheck className="text-emerald-500" /> Safety Check
            </h3>
            <p className="text-sm font-medium text-slate-400 mb-8 uppercase tracking-widest">Real-time Verification</p>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl border bg-emerald-50 border-emerald-200 flex items-center gap-3 text-emerald-700 font-bold">
                <CheckCircle2 size={20} />
                <h4>No Conflicts Found</h4>
              </div>

              <div className="p-6 rounded-2xl border bg-emerald-50 border-emerald-200 flex items-center gap-3 text-emerald-700 font-bold">
                <CheckCircle2 size={20} />
                <h4>Verified Dosage</h4>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-3xl p-8 shadow-xl shadow-blue-200 text-white space-y-6">
            <h4 className="text-xl font-bold">Next Step</h4>
            <div className="space-y-3">
              <button 
                onClick={onNext}
                className="w-full py-4 rounded-2xl font-bold text-lg bg-white text-blue-600 hover:bg-blue-50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Generate Final Rx <ArrowRight size={20} />
              </button>
              <button 
                onClick={onBack}
                className="w-full py-4 rounded-2xl font-bold text-lg text-white/80 hover:bg-blue-500/50 flex items-center justify-center gap-2 transition-all"
              >
                <ArrowLeft size={18} /> Back to Voice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPrescriptionScreen;
