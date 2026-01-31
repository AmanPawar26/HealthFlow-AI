
import React, { useState } from 'react';
import { PatientDetails, PrescriptionData, Frequency } from '../types';
import { sendPrescriptionEmail } from '../services/geminiService';
import { 
  CheckCircle, 
  Download, 
  Send, 
  Plus, 
  Check,
  QrCode,
  FileText,
  Mail,
  Eye,
  LayoutDashboard,
  ChevronLeft,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface Props {
  patient: PatientDetails;
  prescription: PrescriptionData;
  onReset: () => void;
  onBack?: () => void;
}

const FinalPrescriptionScreen: React.FC<Props> = ({ patient, prescription, onReset, onBack }) => {
  const [isSent, setIsSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState({
    email: true,
    save: true
  });

  const SENDER_EMAIL = "pawaramanai@gmail.com";

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const getFrequencyCode = (freq: Frequency) => {
    switch (freq) {
      case Frequency.OD: return { code: '1-0-0', text: 'One tablet in morning' };
      case Frequency.BD: return { code: '1-0-1', text: 'One tablet morning and night' };
      case Frequency.TDS: return { code: '1-1-1', text: 'One tablet thrice daily' };
      case Frequency.QID: return { code: '1-1-1-1', text: 'One tablet four times daily' };
      case Frequency.PRN: return { code: 'As needed', text: 'Take when required' };
      default: return { code: '-', text: freq };
    }
  };

  const handleSend = async () => {
    if (isSending) return;
    
    setIsSending(true);
    try {
      // In a production environment, this calls an API that connects to an SMTP server
      // to deliver the prescription to the patient's inbox.
      await sendPrescriptionEmail(patient, prescription);
      setIsSent(true);
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("System Error: Failed to transmit email. Please check internet connection.");
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Triggers the system print dialog. 
   * Doctors should select 'Save as PDF' in the destination dropdown 
   * to download a professional PDF copy.
   */
  const handleDownload = () => {
    setIsDownloaded(true);
    window.print();
    // Immediate reset after the dialog closes (or cancels)
    setTimeout(() => setIsDownloaded(false), 2000);
  };

  const toggleChannel = (key: keyof typeof selectedChannels) => {
    setSelectedChannels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // SUCCESS VIEW
  if (isSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in fade-in zoom-in duration-500">
        <div className="max-w-xl w-full flex flex-col items-center">
          {/* Large Success Icon */}
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-100 mb-8 animate-bounce-slow">
            <div className="w-16 h-16 border-4 border-white rounded-full flex items-center justify-center">
              <Check size={40} strokeWidth={4} />
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 p-10 w-full text-center space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 rounded-lg text-emerald-700 mb-2">
                <CheckCircle size={20} />
                <span className="font-black tracking-widest text-lg">SUCCESS!</span>
              </div>
              <h2 className="text-2xl font-black text-emerald-600 tracking-tight">Prescription Dispatched</h2>
            </div>

            {/* Email Transmission Log Box */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 text-left space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sent Via Email</p>
                  <p className="text-sm font-bold text-slate-700">From: <span className="text-blue-600">{SENDER_EMAIL}</span></p>
                  <p className="text-sm font-bold text-slate-700">To: <span className="text-slate-900">{patient.email}</span></p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Archive Status</p>
                  <p className="text-sm font-bold text-slate-700">Saved to HealthFlow AI Patient Records</p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                onClick={onReset}
                className="flex-1 py-4 px-6 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus size={18} /> New Patient
              </button>
              <button 
                onClick={onReset}
                className="flex-[1.5] py-4 px-6 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
              >
                <LayoutDashboard size={18} /> Doctor Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD PRESCRIPTION VIEW
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-700 pb-20">
      
      {/* Back to History Button */}
      {onBack && (
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 print:hidden"
        >
          <ChevronLeft size={20} /> Back to Patient History
        </button>
      )}

      {/* Success Animation Banner */}
      {!prescription.date && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center justify-center gap-3 mb-8 animate-bounce-slow print:hidden">
          <CheckCircle size={24} className="text-emerald-500" />
          <p className="font-bold text-lg">Prescription Ready for Dispatch</p>
        </div>
      )}

      {/* Main Prescription Document Card */}
      <div id="prescription-document" className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 p-12 mb-8 print:shadow-none print:border-none print:p-0">
        {/* Hospital Header */}
        <div className="text-center mb-10 border-b border-slate-100 pb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-2">CITY GENERAL HOSPITAL</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">123 Medical Road, Pune - 411001</p>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tel: +91-20-12345678</p>
        </div>

        {/* Doctor Info */}
        <div className="mb-10 text-slate-700 font-medium leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">Dr. Sharma, MD (General Medicine)</h2>
          <p className="text-slate-500">Registration: MCI/12345</p>
          <p className="text-slate-500">Date: {prescription.date ? new Date(prescription.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : today}</p>
        </div>

        {/* Patient Details Box */}
        <div className="bg-slate-50 rounded-[24px] p-8 mb-10 space-y-2 border border-slate-100 print:bg-slate-50/50">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Patient Details:</h3>
          <div className="space-y-1 text-slate-800 font-medium">
            <p><span className="text-slate-500">Name:</span> {patient.name}</p>
            <p><span className="text-slate-500">Age/Gender:</span> {patient.age} Years / {patient.gender}</p>
            <p><span className="text-slate-500">UPID:</span> {patient.upid}</p>
            <p><span className="text-slate-500">Contact:</span> +91-{patient.phone}</p>
            {patient.allergies && patient.allergies.toLowerCase() !== 'none' && (
              <p className="text-red-600 font-bold mt-2">⚠️ ALLERGIES: {patient.allergies}</p>
            )}
          </div>
        </div>

        {/* Diagnosis */}
        <div className="mb-10">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Diagnosis:</h3>
          <div className="space-y-1">
            {prescription.diagnosis.split('\n').map((line, i) => (
              <p key={i} className="text-slate-800 font-medium flex gap-2">
                <span>{i + 1}.</span> {line}
              </p>
            ))}
          </div>
        </div>

        {/* Rx Section */}
        <div className="mb-10">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Rx (Prescription):</h3>
          <div className="space-y-6">
            {prescription.medications.map((med, i) => {
              const freqInfo = getFrequencyCode(med.frequency);
              return (
                <div key={med.id} className="text-slate-800 font-medium pl-2">
                  <p className="text-lg font-bold">{i + 1}. Tab. {med.name} {med.dosage}</p>
                  <p className="text-sm text-slate-500 mt-1">Sig: {freqInfo.code} ({freqInfo.text})</p>
                  <p className="text-sm text-slate-500">Duration: {med.duration}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advice */}
        <div className="mb-10">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Advice:</h3>
          <ul className="space-y-2">
            {prescription.advice.split('\n').map((line, i) => (
              <li key={i} className="text-slate-800 font-medium flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 bg-slate-900 rounded-full shrink-0" />
                <span>{line.replace(/^•\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 border-t border-slate-100 pt-8">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Investigations Advised:</h3>
            <p className="text-slate-800 font-medium">None</p>
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Follow-up:</h3>
            <p className="text-slate-800 font-bold text-blue-600">{prescription.followUp}</p>
          </div>
        </div>

        {/* Signature Area */}
        <div className="flex justify-between items-end border-t border-slate-100 pt-10">
          <div className="flex items-center gap-4 text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
              <QrCode size={40} className="opacity-20" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest max-w-[80px]">Scan to verify prescription</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">Dr. Sharma</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">(Digital Signature)</p>
          </div>
        </div>
      </div>

      {/* Sending Interface Card */}
      <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 p-10 animate-in slide-in-from-bottom-6 duration-500 print:hidden relative overflow-hidden">
        {/* Sending Overlay */}
        {isSending && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-16 h-16 mb-4">
              <Loader2 className="w-full h-full text-blue-600 animate-spin" />
            </div>
            <p className="text-xl font-black text-slate-900">Transmitting Prescription...</p>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Connecting to Secure Mail Server</p>
            <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-bold text-xs">
              <CheckCircle size={14} /> From: {SENDER_EMAIL}
            </div>
          </div>
        )}

        <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-8">
          <span className="text-xl">📩</span> SECURE DISPATCH OPTIONS
        </h3>

        <div className="space-y-5 mb-10">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Email Address</p>
                <p className="font-bold text-slate-900">{patient.email}</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
              Verified
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Record</p>
                <p className="font-bold text-slate-900">Save to Internal History</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
              Active
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button 
            onClick={handleDownload}
            className={`flex-1 py-5 bg-white border-2 rounded-2xl font-black text-slate-800 flex items-center justify-center gap-3 transition-all shadow-sm ${isDownloaded ? 'border-emerald-500 text-emerald-600' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
          >
            {isDownloaded ? <><Check size={20} /> Opening Print Dialog ✓</> : <><Download size={20} /> Download PDF</>}
          </button>
          <button 
            onClick={handleSend}
            disabled={isSending}
            className="flex-[1.5] py-5 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
          >
            <Send size={20} /> Send via Email
          </button>
        </div>
        
        <p className="mt-4 text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest italic">
          Tip: Selecting "Save as PDF" in the print dialog generates a professional digital copy.
        </p>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #prescription-document, #prescription-document * {
            visibility: visible;
          }
          #prescription-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            border: none;
            padding: 0;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default FinalPrescriptionScreen;
