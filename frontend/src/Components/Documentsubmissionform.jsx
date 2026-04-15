import { useState, useRef, memo } from "react";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const maxDobDate = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0];
})();

const Icon = ({ path, size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const InputField = memo(({ label, name, type = "text", placeholder, value, onChange, error, required, max, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-medium text-[#0C447C]">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      max={max}
      className={`w-full h-[38px] px-3 rounded-lg border text-[13px] text-[#042C53] bg-[#E6F1FB] placeholder-[#85B7EB] outline-none transition
        focus:ring-[3px] focus:ring-[#378ADD]/20 focus:border-[#378ADD] focus:bg-white
        hover:border-[#85B7EB]
        ${error ? "border-[#F09595] bg-[#FCEBEB]" : "border-[#B5D4F4]"}`}
    />
    {hint && <p className="text-[11px] text-[#85B7EB]">{hint}</p>}
    {error && (
      <p className="text-[11px] text-red-500 flex items-center gap-1">
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {error}
      </p>
    )}
  </div>
));

const SectionTitle = ({ label }) => (
  <div className="flex items-center gap-2 mb-5">
    <span className="w-1.5 h-1.5 rounded-full bg-[#378ADD] shrink-0" />
    <span className="text-[11px] font-medium tracking-[.08em] uppercase text-[#185FA5]">{label}</span>
  </div>
);

const DocumentSubmissionForm = () => {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", dob: "",
    residentialStreet1: "", residentialStreet2: "",
    sameAsResidential: true,
    permanentStreet1: "", permanentStreet2: "",
  });

  const [documents, setDocuments] = useState([
    { id: 1, fileName: "", fileType: "", file: null, filePreviewName: "" },
    { id: 2, fileName: "", fileType: "", file: null, filePreviewName: "" },
  ]);

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const fileInputRefs = useRef({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDocChange = (id, field, value) => {
    setDocuments((prev) => prev.map((d) => d.id === id ? { ...d, [field]: value } : d));
    setErrors((prev) => ({ ...prev, [`doc_${id}_${field}`]: "" }));
  };

  const handleFileChange = (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const doc = documents.find((d) => d.id === id);
    const ext = file.name.split(".").pop().toLowerCase();
    if (doc.fileType === "image" && !["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      setErrors((prev) => ({ ...prev, [`doc_${id}_file`]: "Valid image required (jpg, png, gif, webp)" }));
      e.target.value = ""; return;
    }
    if (doc.fileType === "pdf" && ext !== "pdf") {
      setErrors((prev) => ({ ...prev, [`doc_${id}_file`]: "Valid PDF file required" }));
      e.target.value = ""; return;
    }
    setDocuments((prev) => prev.map((d) => d.id === id ? { ...d, file, filePreviewName: file.name } : d));
    setErrors((prev) => ({ ...prev, [`doc_${id}_file`]: "" }));
  };

  const addDocument = () => {
    setDocuments((prev) => [...prev, { id: Date.now(), fileName: "", fileType: "", file: null, filePreviewName: "" }]);
  };

  const removeDocument = (id) => {
    if (documents.length <= 2) return;
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = "Required";
    if (!formData.lastName.trim()) e.lastName = "Required";
    if (!formData.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Enter a valid email address";
    if (!formData.dob) e.dob = "Required";
    else {
      const today = new Date(); const birth = new Date(formData.dob);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      if (age < 18) e.dob = "Must be at least 18 years old";
    }
    if (!formData.residentialStreet1.trim()) e.residentialStreet1 = "Required";
    if (!formData.residentialStreet2.trim()) e.residentialStreet2 = "Required";
    if (!formData.sameAsResidential) {
      if (!formData.permanentStreet1.trim()) e.permanentStreet1 = "Required";
      if (!formData.permanentStreet2.trim()) e.permanentStreet2 = "Required";
    }
    documents.forEach((doc) => {
      if (!doc.fileName.trim()) e[`doc_${doc.id}_fileName`] = "Name required";
      if (!doc.fileType) e[`doc_${doc.id}_fileType`] = "Type required";
      if (!doc.file) e[`doc_${doc.id}_file`] = "Upload required";
    });
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("firstName", formData.firstName);
      payload.append("lastName", formData.lastName);
      payload.append("email", formData.email);
      payload.append("dob", formData.dob);
      payload.append("residentialStreet1", formData.residentialStreet1);
      payload.append("residentialStreet2", formData.residentialStreet2);
      payload.append("sameAsResidential", formData.sameAsResidential);
      if (!formData.sameAsResidential) {
        payload.append("permanentStreet1", formData.permanentStreet1);
        payload.append("permanentStreet2", formData.permanentStreet2);
      }
      payload.append("documentsMeta", JSON.stringify(documents.map(({ fileName, fileType }) => ({ fileName, fileType }))));
      documents.forEach((doc) => payload.append("files", doc.file));
      const response = await fetch(`${BASE_API_URL}/api/candidates/submit`, { method: "POST", body: payload });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Server error: ${response.status}`);
      }
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false); setApiError(""); setErrors({});
    setFormData({ firstName: "", lastName: "", email: "", dob: "", residentialStreet1: "", residentialStreet2: "", sameAsResidential: true, permanentStreet1: "", permanentStreet2: "" });
    setDocuments([{ id: 1, fileName: "", fileType: "", file: null, filePreviewName: "" }, { id: 2, fileName: "", fileType: "", file: null, filePreviewName: "" }]);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#E6F1FB] flex items-center justify-center p-6">
        <div className="bg-white rounded-[20px] border border-[#B5D4F4] p-10 text-center max-w-sm w-full">
          <div className="w-[60px] h-[60px] rounded-full bg-[#E6F1FB] border border-[#B5D4F4] flex items-center justify-center mx-auto mb-5">
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-[18px] font-medium text-[#042C53] mb-1.5">Submitted successfully!</h2>
          <p className="text-[13px] text-[#378ADD] mb-6 leading-relaxed">Your details and documents have been<br />received for verification.</p>
          <button onClick={resetForm} className="bg-[#185FA5] hover:bg-[#0C447C] text-white px-7 py-2.5 rounded-xl text-[13px] font-medium transition">
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6F1FB] py-10 px-4">
      <div className="max-w-[660px] mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-[20px] font-medium text-[#042C53] tracking-tight">Candidate document submission</h1>
          <p className="text-[13px] text-[#378ADD] mt-1">Fill in your details and upload the required documents</p>
        </div>

        {apiError && (
          <div className="mb-4 bg-[#FCEBEB] border border-[#F09595] text-[#A32D2D] text-[13px] rounded-xl px-4 py-3 flex items-center gap-2">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-[#B5D4F4] p-6">
            <SectionTitle label="Personal information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField label="First name" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} error={errors.firstName} required />
              <InputField label="Last name" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} error={errors.lastName} required />
              <InputField label="Email address" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} error={errors.email} required />
              <InputField label="Date of birth" name="dob" type="date" value={formData.dob} max={maxDobDate} onChange={handleChange} error={errors.dob} hint="Minimum age 18 years" required />
            </div>
          </div>

          {/* Residential Address */}
          <div className="bg-white rounded-2xl border border-[#B5D4F4] p-6">
            <SectionTitle label="Residential address" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField label="Street 1" name="residentialStreet1" placeholder="123 Main Street" value={formData.residentialStreet1} onChange={handleChange} error={errors.residentialStreet1} required />
              <InputField label="Street 2" name="residentialStreet2" placeholder="Apt / Area" value={formData.residentialStreet2} onChange={handleChange} error={errors.residentialStreet2} required />
            </div>
            <label className="mt-4 flex items-center gap-2 cursor-pointer w-fit select-none">
              <input type="checkbox" name="sameAsResidential" checked={formData.sameAsResidential} onChange={handleChange} className="w-[15px] h-[15px] accent-[#185FA5] cursor-pointer" />
              <span className="text-[13px] text-[#0C447C]">Same as residential address</span>
            </label>
          </div>

          {/* Permanent Address */}
          {!formData.sameAsResidential && (
            <div className="bg-white rounded-2xl border border-[#B5D4F4] p-6">
              <SectionTitle label="Permanent address" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="Street 1" name="permanentStreet1" placeholder="123 Main Street" value={formData.permanentStreet1} onChange={handleChange} error={errors.permanentStreet1} required />
                <InputField label="Street 2" name="permanentStreet2" placeholder="Apt / Area" value={formData.permanentStreet2} onChange={handleChange} error={errors.permanentStreet2} required />
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="bg-white rounded-2xl border border-[#B5D4F4] p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#378ADD]" />
                <span className="text-[11px] font-medium tracking-[.08em] uppercase text-[#185FA5]">Upload documents</span>
              </div>
              <span className="text-[11px] text-[#185FA5] bg-[#E6F1FB] border border-[#B5D4F4] px-2.5 py-1 rounded-full">Min. 2 required</span>
            </div>

            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div key={doc.id} className="bg-[#E6F1FB] border border-[#B5D4F4] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-medium tracking-[.06em] uppercase text-[#378ADD]">Document {index + 1}</span>
                    {documents.length > 2 && (
                      <button type="button" onClick={() => removeDocument(doc.id)}
                        className="text-[#888780] hover:text-red-500 hover:bg-[#FCEBEB] transition p-1 rounded-lg">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* File Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-[#0C447C]">File name <span className="text-red-500">*</span></label>
                      <input
                        type="text" value={doc.fileName} placeholder="Name"
                        onChange={(e) => handleDocChange(doc.id, "fileName", e.target.value)}
                        className={`w-full h-[38px] px-3 rounded-lg border text-[13px] text-[#042C53] bg-white placeholder-[#85B7EB] outline-none transition focus:ring-[3px] focus:ring-[#378ADD]/20 focus:border-[#378ADD]
                          ${errors[`doc_${doc.id}_fileName`] ? "border-[#F09595] bg-[#FCEBEB]" : "border-[#B5D4F4]"}`}
                      />
                      {errors[`doc_${doc.id}_fileName`] && <p className="text-[11px] text-red-500">{errors[`doc_${doc.id}_fileName`]}</p>}
                    </div>

                    {/* File Type */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-[#0C447C]">File type <span className="text-red-500">*</span></label>
                      <select
                        value={doc.fileType}
                        onChange={(e) => {
                          handleDocChange(doc.id, "fileType", e.target.value);
                          handleDocChange(doc.id, "file", null);
                          handleDocChange(doc.id, "filePreviewName", "");
                          if (fileInputRefs.current[doc.id]) fileInputRefs.current[doc.id].value = "";
                        }}
                        className={`w-full h-[38px] px-3 rounded-lg border text-[13px] text-[#042C53] bg-white outline-none transition focus:ring-[3px] focus:ring-[#378ADD]/20 focus:border-[#378ADD]
                          ${errors[`doc_${doc.id}_fileType`] ? "border-[#F09595] bg-[#FCEBEB]" : "border-[#B5D4F4]"}`}
                      >
                        <option value="" disabled>Select…</option>
                        <option value="image">Image</option>
                        <option value="pdf">PDF</option>
                      </select>
                      {errors[`doc_${doc.id}_fileType`] && <p className="text-[11px] text-red-500">{errors[`doc_${doc.id}_fileType`]}</p>}
                    </div>

                    {/* Upload */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium text-[#0C447C]">Upload <span className="text-red-500">*</span></label>
                      <div
                        onClick={() => doc.fileType && fileInputRefs.current[doc.id]?.click()}
                        className={`flex items-center gap-2 h-[38px] px-3 rounded-lg border text-[12px] cursor-pointer transition overflow-hidden
                          ${!doc.fileType ? "opacity-40 cursor-not-allowed border-[#B5D4F4] bg-[#E6F1FB]"
                            : doc.file ? "border-[#97C459] bg-[#EAF3DE] text-[#27500A]"
                            : errors[`doc_${doc.id}_file`] ? "border-[#F09595] bg-[#FCEBEB] text-[#378ADD] border-dashed hover:bg-[#FCEBEB]"
                            : "border-dashed border-[#85B7EB] bg-white text-[#378ADD] hover:border-[#378ADD] hover:bg-[#E6F1FB]"}`}
                      >
                        {doc.file
                          ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#3B6D11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>}
                        <span className="truncate">
                          {doc.filePreviewName || (doc.fileType ? `Choose ${doc.fileType === "image" ? "image" : "PDF"}` : "Pick type first")}
                        </span>
                      </div>
                      <input
                        ref={(el) => (fileInputRefs.current[doc.id] = el)}
                        type="file" accept={doc.fileType === "image" ? "image/*" : doc.fileType === "pdf" ? ".pdf" : ""}
                        onChange={(e) => handleFileChange(doc.id, e)} className="hidden"
                      />
                      {errors[`doc_${doc.id}_file`] && <p className="text-[11px] text-red-500">{errors[`doc_${doc.id}_file`]}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={addDocument}
              className="mt-4 flex items-center gap-2 text-[13px] font-medium text-[#378ADD] hover:text-[#0C447C] transition">
              <span className="w-[28px] h-[28px] rounded-lg border-[1.5px] border-dashed border-[#85B7EB] flex items-center justify-center hover:border-[#185FA5] hover:bg-[#E6F1FB] transition shrink-0">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
              Add another document
            </button>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full h-[48px] bg-[#185FA5] hover:bg-[#0C447C] disabled:bg-[#85B7EB] disabled:cursor-not-allowed text-white font-medium rounded-2xl transition flex items-center justify-center gap-2 text-[14px]">
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a8 8 0 00-8 8h4z" />
                </svg>
                Submitting…
              </>
            ) : (
              <>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
                </svg>
                Submit documents
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DocumentSubmissionForm;