import React, { useState } from "react";
import "./App.css";

function App() {
  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState("");
  const [atsScore, setAtsScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadResume = async () => {
    if (!resume) {
      alert("Please select a resume file!");
      return;
    }
    if (!jd) {
      alert("Please enter a Job Description!");
      return;
    }

    setLoading(true);
    setAtsScore(null);

    try {
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("jd", jd);

      const response = await fetch("http://localhost:5001/api/resume/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json(); // { atsScore: 85 }
      setAtsScore(data.semanticMatchScore);
    } catch (err) {
      console.error(err);
      alert("Error computing ATS score!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl">
        <h1 className="text-2xl font-bold text-center mb-6">AI Resume Analyzer</h1>

        {/* Resume Upload */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Resume:</label>
          <input
            type="file"
            onChange={(e) => setResume(e.target.files[0])}
            className="w-full border border-gray-300 rounded-md p-2"
          />
          {resume && <p className="text-sm mt-1 text-gray-600">Selected: {resume.name}</p>}
        </div>

        {/* Job Description */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Job Description:</label>
          <textarea
            rows={6}
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
            placeholder="Paste the JD here..."
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={uploadResume}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {/* Result */}
        {atsScore !== null && !loading && (
          <div className="mt-6 p-4 bg-green-100 rounded-md text-center">
            <h2 className="text-xl font-semibold">ATS Score</h2>
            <p className="text-3xl font-bold text-green-700">{atsScore}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
