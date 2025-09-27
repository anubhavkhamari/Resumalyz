import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import "./App.css";

function App() {
  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState("");
  const [atsScore, setAtsScore] = useState(null);
  const [loadingATS, setLoadingATS] = useState(false);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [hrReview, setHrReview] = useState("");
  const [loadingHR, setLoadingHR] = useState(false);

  // WebSocket for async updates
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5001");

    ws.onopen = () => console.log("WebSocket connected ✅");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "missingKeywords") {
        setMissingKeywords(data.missingKeywords);
        setLoadingKeywords(false);
      }
      if (data.type === "hrReview") {
        setHrReview(data.review);
        setLoadingHR(false);
      }
    };

    return () => ws.close();
  }, []);

  // Drag & Drop
  const onDrop = useCallback((acceptedFiles) => setResume(acceptedFiles[0]), []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    }
  });

  const uploadResume = async () => {
    if (!resume || !jd) {
      alert("Please select a resume file and enter JD!");
      return;
    }

    setLoadingATS(true);
    setLoadingKeywords(true);
    setLoadingHR(true);
    setAtsScore(null);
    setMissingKeywords([]);
    setHrReview("");

    try {
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("jd", jd);

      const response = await fetch("http://localhost:5001/api/resume/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setAtsScore(data.semanticMatchScore);
      setLoadingATS(false);
    } catch (err) {
      console.error(err);
      alert("Error analyzing resume!");
      setLoadingATS(false);
      setLoadingKeywords(false);
      setLoadingHR(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-100 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-3xl">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-extrabold text-center mb-8 text-indigo-700"
        >
          AI Resume Analyzer
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          {/* Drag & Drop Resume */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed p-6 rounded-xl text-center cursor-pointer transition-colors
              ${isDragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}`}
          >
            <input {...getInputProps()} />
            {resume ? (
              <p className="text-gray-700 font-medium">{resume.name}</p>
            ) : (
              <p className="text-gray-500">
                {isDragActive ? "Drop the file here..." : "Drag & drop your resume or click to select"}
              </p>
            )}
          </div>

          {/* Job Description */}
          <div className="mt-6">
            <label className="block font-semibold mb-2 text-gray-700">Job Description</label>
            <textarea
              rows={6}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={uploadResume}
            disabled={loadingATS}
            className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
          >
            {loadingATS ? "Analyzing..." : "Analyze Resume"}
          </button>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {(atsScore !== null || missingKeywords.length > 0 || hrReview) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 grid grid-cols-1 gap-6"
            >
              {/* ATS Score */}
              <div className="bg-green-50 rounded-2xl p-6 shadow-md text-center">
                <h2 className="text-xl font-semibold text-green-700 mb-2">ATS Score</h2>
                {loadingATS ? (
                  <div className="flex justify-center items-center h-12">
                    <div className="loader border-t-4 border-green-500 border-b-4 border-green-300 rounded-full w-10 h-10 animate-spin"></div>
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-green-900">{atsScore}%</p>
                )}
              </div>

              {/* Missing Keywords */}
              <div className="bg-yellow-50 rounded-2xl p-6 shadow-md">
                <h2 className="text-xl font-semibold text-yellow-800 mb-2">Missing Keywords</h2>
                {loadingKeywords ? (
                  <div className="flex justify-center items-center h-12">
                    <div className="loader border-t-4 border-yellow-500 border-b-4 border-yellow-300 rounded-full w-10 h-10 animate-spin"></div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {missingKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full text-sm"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* HR AI Review */}
              <div className="bg-purple-50 rounded-2xl p-6 shadow-md">
                <h2 className="text-xl font-semibold text-purple-700 mb-2">AI Review</h2>
                {loadingHR ? (
                  <div className="flex justify-center items-center h-12">
                    <div className="loader border-t-4 border-purple-500 border-b-4 border-purple-300 rounded-full w-10 h-10 animate-spin"></div>
                  </div>
                ) : (
                  <p className="text-gray-800 whitespace-pre-line">{hrReview}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loader CSS */}
      <style>{`
        .loader {
          border-top-width: 4px;
          border-bottom-width: 4px;
        }
      `}</style>
    </div>
  );
}

export default App;
