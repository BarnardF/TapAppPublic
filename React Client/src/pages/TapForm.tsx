import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { adminAPI } from "../Api/adminAPI";
import { useAuth } from "../Hooks/useAuth";

const containerTypes = ["Select Container Type", "Bottle", "Drum", "Tank"];
const materials = ["Select Material", "Plastic", "Metal", "Ceramic"];
const sizes = ["Select Size", "Small", "Medium", "Large"];
const flowRates = ["Select Flow Rate", "Low", "Medium", "High"];
const liquidTypes = ["Select Liquid Type", "Water", "Oil", "Wine"];

interface FormData {
  title: string;
  container_type: string;
  material: string;
  size: string;
  flow_rate: string;
  liquid_type: string;
  description: string;
}

export default function TapForm() {
  const token = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tapId = searchParams.get("id");
  const isEditMode = !!tapId;

  const [formData, setFormData] = useState<FormData>({
    title: "",
    container_type: "Select Container Type",
    material: "Select Material",
    size: "Select Size",
    flow_rate: "Select Flow Rate",
    liquid_type: "Select Liquid Type",
    description: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    if (isEditMode && token && tapId) {
      loadTapData(tapId);
    }
  }, [tapId, token]);

  const loadTapData = async (id: string) => {
    try {
      setLoading(true);
      if (!token) return;

      const tap = await adminAPI.getTapById(token, id);
      setFormData({
        title: tap.title,
        container_type: tap.container_type || "Select Container Type",
        material: tap.material || "Select Material",
        size: tap.size || "Select Size",
        flow_rate: tap.flow_rate || "Select Flow Rate",
        liquid_type: tap.liquid_type || "Select Liquid Type",
        description: tap.description,
      });
      setImagePreview(tap.image_url || "");
    } catch (err) {
      console.error("Failed to load tap:", err);
      setError("Failed to load tap data");
    } finally {
      setLoading(false);
    }
  };

  //imput change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //image changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  //handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Authentication required");
      return;
    }

    const { title, container_type, material, size, flow_rate, liquid_type, description } = formData;
    if (
      !title ||
      container_type === "Select Container Type" ||
      material === "Select Material" ||
      size === "Select Size" ||
      flow_rate === "Select Flow Rate" ||
      liquid_type === "Select Liquid Type" ||
      !description
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (!isEditMode && !imageFile) {
      setError("Please upload an image");
      return;
    }

    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append("title", title);
      submitData.append("container_type", container_type);
      submitData.append("material", material);
      submitData.append("size", size);
      submitData.append("flow_rate", flow_rate);
      submitData.append("liquid_type", liquid_type);
      submitData.append("description", description);
      if (imageFile) submitData.append("productPictureFile", imageFile);

      if (isEditMode && tapId) {
        await adminAPI.updateTap(token, tapId, submitData);
      } else {
        await adminAPI.createTap(token, submitData);
      }

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Failed to submit form:", err);
      setError(err.response?.data?.error || err.message || "Failed to save tap");
    } finally {
      setLoading(false);
    }
  };

  //loading screen
  if (loading && isEditMode) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  //main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header Bar */}
      <div className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* App Title - Clickable */}
            <button 
              onClick={() => navigate("/dashboard")}
              className="text-2xl font-bold hover:bg-blue-700 px-3 py-1 rounded-lg transition-colors"
            >
              TheTapApp
            </button>
            
            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-200 hover:border-blue-400 duration-200 font-medium"
              >
                ← Go Back
              </button>


            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {isEditMode ? "Edit Tap" : "Add New Tap"}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <svg
                    className="w-12 h-12 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">Click to upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required={!isEditMode}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Dropdowns for all tap attributes */}
          {[
            { label: "Container Type", name: "container_type", options: containerTypes },
            { label: "Material", name: "material", options: materials },
            { label: "Size", name: "size", options: sizes },
            { label: "Flow Rate", name: "flow_rate", options: flowRates },
            { label: "Liquid Type", name: "liquid_type", options: liquidTypes },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} <span className="text-red-500">*</span>
              </label>
              <select
                name={field.name}
                value={formData[field.name as keyof FormData]}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-gray-200 hover:border-blue-400 duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : isEditMode ? "Update Tap" : "Create Tap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}