
import React, { useState, useEffect, useMemo } from 'react';
import { PatientDetails, Gender, PatientRecord, INITIAL_PATIENT, PrescriptionData } from '../types';
import { generateHistorySummary } from '../services/geminiService';
import { 
  User, 
  Phone, 
  Mail, 
  AlertTriangle, 
  ArrowRight, 
  Search,
  Plus,
  ArrowLeft,
  LucideIcon,
  ChevronLeft,
  FileText,
  Bot,
  Mic,
  Loader2,
  ChevronDown,
  Play,
  Trash2
} from 'lucide-react';

interface Props {
  onNext: (data: PatientDetails) => void;
  onViewOldPrescription?: (details: PatientDetails, prescription: PrescriptionData) => void;
  onDeleteRecord: (upid: string) => void;
  initialData: PatientDetails;
  records: Record<string, PatientRecord>;
}

interface InputFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  icon: LucideIcon;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = "text", 
  placeholder, 
  icon: Icon, 
  error 
}) => (
  <div className="mb-5">
    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`block w-full pl-11 pr-4 py-3.5 rounded-xl border bg-white font-bold text-slate-900 ${
          error 
            ? 'border-red-500 ring-2 ring-red-50 bg-red-50/30' 
            : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50'
        } transition-all outline-none placeholder:text-slate-400 placeholder:font-normal`}
      />
    </div>
    {error && <p className="mt-1.5 text-xs font-bold text-red-600 flex items-center gap-1.5"><AlertTriangle size={14}/> {error}</p>}
  </div>
);

const PatientDetailsScreen: React.FC<Props> = ({ onNext, onViewOldPrescription, onDeleteRecord, initialData, records }) => {
  const [formData, setFormData] = useState<PatientDetails>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  
  const recordFromInit = useMemo(() => records[initialData.upid], [records, initialData.upid]);
  
  const [view, setView] = useState<'DASHBOARD' | 'RECORD' | 'FORM'>(
    recordFromInit ? 'RECORD' : 'DASHBOARD'
  );
  
  const [activeRecord, setActiveRecord] = useState<PatientRecord | null>(recordFromInit || null);
  const [errors, setErrors] = useState<Partial<Record<keyof PatientDetails, string>>>({});
  const [isValid, setIsValid] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getTimeAgo = (dateStr: string | undefined) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Unknown Date";
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const recentPatients = useMemo(() => {
    return Object.values(records)
      .sort((a, b) => {
        const dateA = a.history[0]?.date ? new Date(a.history[0].date).getTime() : 0;
        const dateB = b.history[0]?.date ? new Date(b.history[0].date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [records]);

  const validate = (data: PatientDetails) => {
    const newErrors: Partial<Record<keyof PatientDetails, string>> = {};
    if (!data.name.trim()) newErrors.name = "Patient name is required";
    const age = Number(data.age);
    if (!data.age && data.age !== 0) newErrors.age = "Age is required";
    else if (isNaN(age) || age < 1 || age > 120) newErrors.age = "Enter a valid age (1-120)";
    const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    if (!phoneRegex.test(data.phone)) newErrors.phone = "Enter a valid 10-digit phone number";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) newErrors.email = "Enter a valid email address";
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  };

  useEffect(() => {
    validate(formData);
  }, [formData]);

  const handleSearch = () => {
    const record = records[searchQuery.toUpperCase()];
    if (record) {
      setActiveRecord(record);
      setFormData(record.details);
      setView('RECORD');
    } else {
      alert("No patient record found for this UPID. Starting a new consultation.");
      setFormData({ ...INITIAL_PATIENT, upid: initialData.upid });
      setView('FORM');
    }
  };

  const handleRecentClick = (record: PatientRecord) => {
    setActiveRecord(record);
    setFormData(record.details);
    setView('RECORD');
  };

  const handleGenerateSummary = async () => {
    if (!activeRecord) return;
    setIsSummarizing(true);
    setAiSummary(null);
    try {
      const summary = await generateHistorySummary(activeRecord.details.name, activeRecord.history);
      setAiSummary(summary);
    } catch (err) {
      console.error(err);
      alert("Failed to generate AI summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onNext(formData);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (view === 'RECORD' && activeRecord) {
    const latestMedsCount = activeRecord.history[0]?.medications.length || 0;
    const hasAllergies = activeRecord.details.allergies && activeRecord.details.allergies.toLowerCase() !== 'none';

    return (
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500 pb-32">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => { setActiveRecord(null); setView('DASHBOARD'); }}
            className="flex items-center gap-2 text-slate-500 font-medium hover:text-slate-800 transition-colors"
          >
            <ChevronLeft size={20} /> Back to Dashboard
          </button>
          
          <button 
            onClick={() => onDeleteRecord(activeRecord.details.upid)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-bold text-sm"
          >
            <Trash2 size={16} /> Delete Entire Record
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {activeRecord.details.name} | {activeRecord.details.age}{activeRecord.details.gender[0]} | UPID: {activeRecord.details.upid}
              </h2>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${latestMedsCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                Active: {latestMedsCount} medication{latestMedsCount !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-slate-500 font-medium">Contact: +91-{activeRecord.details.phone}</p>
          </div>
        </div>

        {hasAllergies && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-10 flex items-center gap-4 shadow-sm">
            <div className="bg-orange-100 p-2 rounded-xl">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
            <p className="text-red-700 font-bold text-lg">
              <span className="uppercase tracking-widest text-sm mr-2">Allergies:</span> 
              {activeRecord.details.allergies}
            </p>
          </div>
        )}

        <div className="bg-white border border-slate-200 p-1.5 rounded-2xl inline-flex items-center gap-1 mb-10 shadow-sm">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm">
            <FileText size={16} /> Past Prescriptions
          </button>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <FileText size={20} className="text-orange-300" /> Past Prescriptions ({activeRecord.history.length})
          </h3>

          <div className="space-y-4">
            {activeRecord.history.length > 0 ? activeRecord.history.map((record, i) => {
              const isExpanded = expandedIndex === i;
              return (
                <div 
                  key={i}
                  className={`bg-white rounded-[20px] border border-slate-100 shadow-sm transition-all overflow-hidden ${isExpanded ? 'ring-2 ring-blue-100 border-blue-200 shadow-md' : 'hover:border-slate-300'}`}
                >
                  <div 
                    onClick={() => toggleExpand(i)}
                    className="p-8 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-700 text-lg mb-0.5">
                        {formatDate(record.date)} - {i % 2 === 0 ? 'Dr. Mehta' : 'Dr. Sharma'}
                      </h4>
                      <p className="text-slate-500 font-medium">{record.diagnosis}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                        <Play size={18} fill="currentColor" className="text-blue-500" />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-2 duration-300">
                      <div className="h-px bg-slate-100 mb-6" />
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm font-bold text-slate-800 mb-3">Medications:</p>
                          <ul className="space-y-2">
                            {record.medications.map((med, midx) => (
                              <li key={midx} className="flex items-start gap-2 text-slate-600 font-medium">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0" />
                                <span>{med.name} {med.dosage} - {med.frequency}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {record.advice && (
                          <div>
                            <p className="text-sm font-bold text-slate-800 mb-3">Instructions:</p>
                            <ul className="space-y-2">
                              {record.advice.split('\n').filter(l => l.trim()).map((line, lidx) => (
                                <li key={lidx} className="flex items-start gap-2 text-slate-600 font-medium">
                                  <span className="mt-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0" />
                                  <span>{line.replace(/^•\s*/, '')}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="pt-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewOldPrescription?.(activeRecord.details, record);
                            }}
                            className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
                          >
                            View Full Prescription
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="py-20 text-center opacity-40">
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="font-bold text-slate-400 uppercase tracking-widest">No previous prescription records</p>
              </div>
            )}
          </div>
        </div>

        {aiSummary && (
          <div className="mt-8 bg-purple-50 border border-purple-100 rounded-3xl p-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 text-purple-700 font-bold mb-4">
              <Bot size={20} />
              <h4>AI Generated Medical Summary</h4>
            </div>
            <p className="text-purple-900 leading-relaxed font-medium">{aiSummary}</p>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-6 z-40 print:hidden">
          <div className="max-w-6xl mx-auto flex gap-4">
            <button 
              onClick={handleGenerateSummary}
              disabled={isSummarizing || activeRecord.history.length === 0}
              className="flex-1 py-5 bg-[#A855F7] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-purple-600 transition-all shadow-lg shadow-purple-100 disabled:opacity-50"
            >
              {isSummarizing ? <Loader2 className="animate-spin" /> : <Bot size={20} />}
              Generate AI Summary
            </button>
            <button 
              onClick={() => setView('FORM')}
              className="flex-1 py-5 bg-[#2563EB] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Mic size={20} />
              Create New Prescription
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'FORM') {
    return (
      <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
        <button 
          onClick={() => activeRecord ? setView('RECORD') : setView('DASHBOARD')}
          className="mb-8 flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
        >
          <ArrowLeft size={18} /> Back {activeRecord ? 'to Record' : 'to Dashboard'}
        </button>

        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Consultation Intake</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Verify Patient Details</p>
              </div>
            </div>
            <div className="text-right px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UPID Reference</p>
              <p className="font-mono font-bold text-blue-600 tracking-wider">{formData.upid}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <InputField label="Patient Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Anil Verma" icon={User} error={errors.name} />
            
            <div className="grid grid-cols-2 gap-x-6">
              <div className="mb-5">
                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Age</label>
                <input 
                  type="number" 
                  name="age" 
                  value={formData.age} 
                  onChange={handleChange} 
                  placeholder="45" 
                  className={`block w-full px-4 py-3.5 rounded-xl border bg-white font-bold text-slate-900 ${
                    errors.age 
                      ? 'border-red-500 ring-2 ring-red-50 bg-red-50/30' 
                      : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50'
                  } outline-none transition-all placeholder:font-normal`} 
                />
                {errors.age && <p className="mt-1.5 text-xs text-red-600 font-bold flex items-center gap-1.5"><AlertTriangle size={14}/> {errors.age}</p>}
              </div>
              <div className="mb-5">
                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Gender</label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange} 
                  className="block w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none bg-white transition-all"
                >
                  {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <InputField label="Mobile Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" icon={Phone} error={errors.phone} />
            <InputField label="Email Address" name="email" value={formData.email} onChange={handleChange} placeholder="patient@example.com" icon={Mail} error={errors.email} />
            <InputField label="Known Allergies" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g. Penicillin (or 'None')" icon={AlertTriangle} />

            <div className="pt-8">
              <button
                type="submit"
                disabled={!isValid}
                className={`w-full flex items-center justify-center gap-3 py-5 px-6 rounded-3xl font-black text-xl transition-all shadow-xl ${
                  isValid ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:-translate-y-1' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                Proceed to Prescription <ArrowRight size={24} />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="flex items-center justify-between mb-16 bg-white p-4 px-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Plus size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">City General Hospital</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">123 Medical Road, Pune - 411001</p>
          </div>
        </div>
        <button 
          onClick={() => { setActiveRecord(null); setFormData({ ...INITIAL_PATIENT, upid: initialData.upid }); setView('FORM'); }}
          className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-left space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">HealthFlow AI - Doctor Portal</h2>
          <p className="text-slate-500 font-semibold text-lg">Enter patient UPID or select from recent patients</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-2xl border border-slate-100">
          <div className="flex gap-4 items-center">
            <div className="relative flex-grow group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={24} />
              </div>
              <input 
                type="text"
                placeholder="Enter Patient UPID (12-digit)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                className="w-full pl-16 pr-6 py-5 rounded-[20px] bg-slate-50 border-2 border-slate-200 text-lg font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="px-10 py-5 bg-blue-500 text-white font-black rounded-[20px] hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              Search
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Quick Access - Recent Patients</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPatients.length > 0 ? recentPatients.map((record, i) => {
              const allergyArr = record.details.allergies ? record.details.allergies.split(',').map(a => a.trim()).filter(a => a && a.toLowerCase() !== 'none') : [];
              const allergyCount = allergyArr.length;
              
              return (
                <div 
                  key={i} 
                  className="group bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-6 right-6 flex items-center gap-2">
                    {allergyCount > 0 ? (
                      <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        Allergies: {allergyCount}
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        No allergies
                      </span>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteRecord(record.details.upid); }}
                      className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-5 mt-2" onClick={() => handleRecentClick(record)}>
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {record.details.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-black text-slate-900 mb-1">{record.details.name}</h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">UPID: {record.details.upid}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
                      <span className="text-sm font-bold text-slate-600">
                        {record.details.age}{record.details.gender.charAt(0)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        Last visit: {getTimeAgo(record.history[0]?.date)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-20 bg-white rounded-[24px] border border-dashed border-slate-200 flex flex-col items-center justify-center opacity-40">
                <User size={48} className="text-slate-300 mb-4" />
                <p className="font-bold text-slate-400 uppercase tracking-widest">No Recent Patient Records</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsScreen;
