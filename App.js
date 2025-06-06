import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const BUCKET = "uploads";

export default function App() {
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return;
    setLoading(true);
    const filePath = `${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file);

    if (error) {
      alert("Lỗi khi tải tệp lên: " + error.message);
    } else {
      setFile(null);
      fetchFiles();
    }
    setLoading(false);
  };

  const fetchFiles = async () => {
    const { data, error } = await supabase.storage.from(BUCKET).list();

    if (data) {
      const urls = await Promise.all(
        data.map(async (file) => {
          const { data: fileUrl } = await supabase.storage
            .from(BUCKET)
            .getPublicUrl(file.name);
          return { name: file.name, url: fileUrl.publicUrl };
        })
      );
      setUploadedFiles(urls);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cloud File Storage</h1>
      <input type="file" onChange={handleFileChange} className="mb-2" />
      <button
        onClick={uploadFile}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? "Đang tải..." : "Tải tệp lên"}
      </button>

      <h2 className="text-xl font-semibold mb-2">Tệp đã tải lên:</h2>
      <ul className="list-disc pl-5">
        {uploadedFiles.map((file) => (
          <li key={file.name}>
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
              {file.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
